#!/usr/bin/env python3
"""Standalone Agent Audit scanner (no OpenClaw runtime required)."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

HIGH_RISK_TOOLS = {"exec", "browser", "message", "nodes", "cron", "canvas"}
SENSITIVE_PATTERNS = {
    "API Key": re.compile(r"sk-[a-zA-Z0-9_-]{20,}"),
    "Ethereum Key": re.compile(r"0x[a-fA-F0-9]{64}"),
    "Private Block": re.compile(r"-----BEGIN[\s\w]+PRIVATE KEY-----"),
    "Mnemonic": re.compile(r"(\b[a-z]+\b\s+){11,}\b[a-z]+\b"),
}


def human_size(num_bytes: int) -> str:
    step = 1024
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num_bytes < step:
            return f"{num_bytes:.2f} {unit}" if unit != "B" else f"{num_bytes} B"
        num_bytes /= step
    return f"{num_bytes:.2f} PB"


def load_config(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open() as fh:
        return json.load(fh)


def collect_permissions(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    entries: List[Dict[str, Any]] = []
    agents = config.get("agents", {})
    for name, payload in agents.items():
        tools = list((payload or {}).get("tools", {}).keys())
        high_risk = [t for t in tools if t in HIGH_RISK_TOOLS]
        entries.append(
            {
                "type": "agent",
                "name": name,
                "tools": tools,
                "highRiskTools": high_risk,
                "notes": ["包含高危工具"] if high_risk else [],
            }
        )

    skill_cfg = (config.get("skills") or {}).get("entries", {})
    for name, payload in skill_cfg.items():
        entries.append(
            {
                "type": "skill",
                "name": name,
                "tools": list((payload or {}).keys()),
                "highRiskTools": [],
                "notes": ["已配置凭据"] if payload else [],
            }
        )
    return entries


def scan_memory(directory: Path) -> Dict[str, Any]:
    total = 0
    findings: List[Dict[str, Any]] = []
    hits = 0
    if not directory.exists():
        return {"totalSize": 0, "files": [], "sensitiveHits": 0}

    for path in sorted(directory.glob("*.md")):
        try:
            content = path.read_text(errors="ignore")
        except Exception:
            continue
        size = path.stat().st_size
        total += size
        issues: List[str] = []
        for label, pattern in SENSITIVE_PATTERNS.items():
            match = pattern.findall(content)
            if match:
                issues.append(f"{label} ×{len(match)}")
                hits += len(match)
        if size > 1_000_000:
            issues.append("文件超过 1MB，建议归档")
        if issues:
            findings.append({"path": str(path), "size": human_size(size), "issues": issues})
    return {"totalSize": total, "files": findings, "sensitiveHits": hits}


def scan_logs(directory: Path) -> Dict[str, Any]:
    if not directory.exists():
        return {"files": [], "errorRate": 0.0}
    entries: List[Dict[str, Any]] = []
    total_lines = 0
    total_errors = 0
    keywords = ("error", "failed", "traceback", "exception")
    for path in sorted(directory.glob("*.log")):
        errors = 0
        lines = 0
        try:
            with path.open("r", errors="ignore") as fh:
                for line in fh:
                    lines += 1
                    if any(k in line.lower() for k in keywords):
                        errors += 1
        except Exception:
            continue
        entries.append(
            {
                "path": str(path),
                "size": human_size(path.stat().st_size),
                "errors": errors,
                "lines": lines,
                "updatedAt": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            }
        )
        total_lines += lines
        total_errors += errors
    rate = total_errors / total_lines if total_lines else 0.0
    return {"files": entries, "errorRate": rate}


def scan_token_usage(directory: Path) -> Dict[str, Any]:
    pattern = re.compile(r'"totalTokens"\s*:\s*(\d+)', re.IGNORECASE)
    totals = 0
    per_model: List[Dict[str, Any]] = []
    for path in sorted(directory.glob("*.log")):
        try:
            with path.open("r", errors="ignore") as fh:
                for line in fh:
                    match = pattern.search(line)
                    if match:
                        value = int(match.group(1))
                        totals += value
        except Exception:
            continue
    if totals:
        per_model.append({"model": "unknown", "tokens": totals})
    return {"totalTokens": totals, "byModel": per_model}


def score_privacy(hits: int) -> int:
    if hits == 0:
        return 5
    return min(100, 30 + hits * 15)


def score_privilege(entries: List[Dict[str, Any]]) -> int:
    high = sum(len(e.get("highRiskTools", [])) for e in entries if e["type"] == "agent")
    return min(100, 20 + high * 20) if high else 15


def score_memory(total_size: int) -> int:
    mb = total_size / 1_000_000
    if mb <= 2:
        return 10
    if mb <= 5:
        return 40
    return min(100, 40 + int((mb - 5) * 10))


def score_tokens(total_tokens: int) -> int:
    if total_tokens == 0:
        return 10
    if total_tokens <= 500_000:
        return 35
    return min(100, 35 + int((total_tokens - 500_000) / 50_000))


def score_failures(error_rate: float) -> int:
    return min(100, int(error_rate * 400))


def build_suggestions(report: Dict[str, Any]) -> List[str]:
    suggestions: List[str] = []
    if report["privacyRisk"] > 30:
        suggestions.append("在 memory/ 中查找敏感信息并进行脱敏或迁移到安全存储。")
    if report["privilegeRisk"] > 30:
        suggestions.append("为含 exec/browser 的 Agent 添加操作确认或拆分角色。")
    if report["memoryRisk"] > 40:
        suggestions.append("归档 memory 文件（>1MB）并替换为摘要。")
    if report["tokenRisk"] > 35:
        suggestions.append("为高消耗模型设置预算守卫或改用低成本模型。")
    if report["failureRisk"] > 25:
        suggestions.append("检查日志中高频错误，增加重试/超时保护。")
    return suggestions or ["暂无建议"]


def to_markdown(report: Dict[str, Any]) -> str:
    lines = [
        f"# Agent Audit 报告",
        f"生成时间：{report['generatedAt']}",
        "",
        "## 风险评分",
        f"- 隐私泄露：{report['privacyRisk']}",
        f"- 越权风险：{report['privilegeRisk']}",
        f"- 记忆膨胀：{report['memoryRisk']}",
        f"- Token 成本：{report['tokenRisk']}",
        f"- 失败率：{report['failureRisk']}",
        "",
        "## 修复建议",
    ]
    for item in report["suggestions"]:
        lines.append(f"- {item}")

    lines.extend([
        "",
        "## 权限概览",
        "| 类型 | 名称 | 工具 | 高危 | 备注 |",
        "| --- | --- | --- | --- | --- |",
    ])
    for entry in report["permissions"]:
        lines.append(
            f"| {entry['type']} | {entry['name']} | {', '.join(entry['tools']) or '-'} | {', '.join(entry.get('highRiskTools', [])) or '-'} | {'; '.join(entry.get('notes', [])) or '-'} |"
        )

    lines.extend([
        "",
        "## 记忆问题",
        "| 文件 | 大小 | 问题 |",
        "| --- | --- | --- |",
    ])
    if report["memory"]["files"]:
        for item in report["memory"]["files"]:
            lines.append(f"| {item['path']} | {item['size']} | {', '.join(item['issues'])} |")
    else:
        lines.append("| - | - | - |")

    lines.extend([
        "",
        "## 日志摘要",
        "| 文件 | 大小 | 错误 | 行数 | 更新时间 |",
        "| --- | --- | --- | --- | --- |",
    ])
    if report["logs"]["files"]:
        for item in report["logs"]["files"]:
            lines.append(
                f"| {item['path']} | {item['size']} | {item['errors']} | {item['lines']} | {item['updatedAt']} |"
            )
    else:
        lines.append("| - | - | - | - | - |")

    return "\n".join(lines)


def generate_report(config_path: Path, memory_dir: Path, log_dir: Path) -> Dict[str, Any]:
    config = load_config(config_path)
    permissions = collect_permissions(config)
    memory = scan_memory(memory_dir)
    logs = scan_logs(log_dir)
    tokens = scan_token_usage(log_dir)

    report = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "permissions": permissions,
        "memory": memory,
        "logs": logs,
        "tokens": tokens,
    }
    report["privacyRisk"] = score_privacy(memory.get("sensitiveHits", 0))
    report["privilegeRisk"] = score_privilege(permissions)
    report["memoryRisk"] = score_memory(memory.get("totalSize", 0))
    report["tokenRisk"] = score_tokens(tokens.get("totalTokens", 0))
    report["failureRisk"] = score_failures(logs.get("errorRate", 0.0))
    report["suggestions"] = build_suggestions(report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Standalone agent audit scanner")
    parser.add_argument("--config", type=Path, required=True, help="配置文件 openclaw.json 的路径")
    parser.add_argument("--memory", type=Path, required=True, help="memory 目录路径")
    parser.add_argument("--logs", type=Path, required=True, help="日志目录路径")
    parser.add_argument("--output", type=Path, default=Path("audit_report.json"), help="JSON 输出路径")
    parser.add_argument("--markdown", type=Path, help="可选的 Markdown 输出路径")
    args = parser.parse_args()

    report = generate_report(args.config.expanduser(), args.memory.expanduser(), args.logs.expanduser())
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"✅ JSON 报告已生成：{args.output}")
    if args.markdown:
        args.markdown.write_text(to_markdown(report))
        print(f"✅ Markdown 报告已生成：{args.markdown}")


if __name__ == "__main__":
    main()
