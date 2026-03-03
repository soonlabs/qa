"""Core logic for Agent Audit scanner."""

from __future__ import annotations

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


def _human_size(num_bytes: int) -> str:
    step = 1024
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num_bytes < step:
            return f"{num_bytes:.2f} {unit}" if unit != "B" else f"{num_bytes} B"
        num_bytes /= step
    return f"{num_bytes:.2f} PB"


def _load_config(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open() as fh:
        return json.load(fh)


def _collect_permissions(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    entries: List[Dict[str, Any]] = []
    agents = config.get("agents", {})
    for name, payload in agents.items():
        tools = list((payload or {}).get("tools", {}).keys())
        high = [t for t in tools if t in HIGH_RISK_TOOLS]
        entries.append(
            {
                "type": "agent",
                "name": name,
                "tools": tools,
                "highRiskTools": high,
                "notes": ["包含高危工具"] if high else [],
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


def _scan_memory(directory: Path) -> Dict[str, Any]:
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
            findings.append({"path": str(path), "size": _human_size(size), "issues": issues})
    return {"totalSize": total, "files": findings, "sensitiveHits": hits}


def _scan_logs(directory: Path) -> Dict[str, Any]:
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
                "size": _human_size(path.stat().st_size),
                "errors": errors,
                "lines": lines,
                "updatedAt": datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
            }
        )
        total_lines += lines
        total_errors += errors
    rate = total_errors / total_lines if total_lines else 0.0
    return {"files": entries, "errorRate": rate}


def _scan_token_usage(directory: Path) -> Dict[str, Any]:
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


def _score_privacy(hits: int) -> int:
    if hits == 0:
        return 5
    return min(100, 30 + hits * 15)


def _score_privilege(entries: List[Dict[str, Any]]) -> int:
    high = sum(len(e.get("highRiskTools", [])) for e in entries if e["type"] == "agent")
    return min(100, 20 + high * 20) if high else 15


def _score_memory(total_size: int) -> int:
    mb = total_size / 1_000_000
    if mb <= 2:
        return 10
    if mb <= 5:
        return 40
    return min(100, 40 + int((mb - 5) * 10))


def _score_tokens(total_tokens: int) -> int:
    if total_tokens == 0:
        return 10
    if total_tokens <= 500_000:
        return 35
    return min(100, 35 + int((total_tokens - 500_000) / 50_000))


def _score_failures(error_rate: float) -> int:
    return min(100, int(error_rate * 400))


def _build_suggestions(report: Dict[str, Any]) -> List[str]:
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


def run_audit(config_path: Path, memory_dir: Path, log_dir: Path) -> Dict[str, Any]:
    """执行体检并返回完整报告字典。"""
    config = _load_config(config_path.expanduser())
    permissions = _collect_permissions(config)
    memory = _scan_memory(memory_dir.expanduser())
    logs = _scan_logs(log_dir.expanduser())
    tokens = _scan_token_usage(log_dir.expanduser())

    report = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "permissions": permissions,
        "memory": memory,
        "logs": logs,
        "tokens": tokens,
    }
    report["privacyRisk"] = _score_privacy(memory.get("sensitiveHits", 0))
    report["privilegeRisk"] = _score_privilege(permissions)
    report["memoryRisk"] = _score_memory(memory.get("totalSize", 0))
    report["tokenRisk"] = _score_tokens(tokens.get("totalTokens", 0))
    report["failureRisk"] = _score_failures(logs.get("errorRate", 0.0))
    report["suggestions"] = _build_suggestions(report)
    return report


def to_markdown(report: Dict[str, Any]) -> str:
    from textwrap import dedent

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
