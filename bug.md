# Bug 分析报告

生成时间：2026-03-03
审查对象：agent-audit skill

---

## 🐛 已发现的 Bug

### 1. **致命 Bug：score_privilege 计算逻辑错误**
**文件**: `scripts/audit_scan.py:225-227`
**严重程度**: 🔴 高

**问题描述**:
```python
def score_privilege(permissions: List[Dict[str, Any]]) -> int:
    high = sum(len(entry.get("highRiskTools", [])) for entry in permissions if entry["type"] == "agent")
    return min(100, 20 + high * 20) if high else 15
```

与 `risk-model.md` 中描述的逻辑不一致：
- **文档要求**: 默认 15；每出现高危工具 +20
- **实际实现**: 基础分 20，然后加 `high * 20`（high 是所有高危工具总数）
- **冲突点**: 基础分应该是 15，不是 20

**影响**: 风险分数偏高 5 分，可能导致误报

**修复建议**:
```python
def score_privilege(permissions: List[Dict[str, Any]]) -> int:
    high = sum(len(entry.get("highRiskTools", [])) for entry in permissions if entry["type"] == "agent")
    return min(100, 15 + high * 20) if high else 15
```

---

### 2. **Bug：collect_permissions 中 skill 风险分固定为 20**
**文件**: `scripts/audit_scan.py:103`
**严重程度**: 🟡 中

**问题描述**:
```python
"riskScore": 20,
```

skill 的风险分始终为 20，没有根据配置内容动态计算。这与 agent 的动态风险评分机制不一致。

**影响**: 
- 无法区分高风险和低风险的 skill 配置
- skill 风险评估缺乏精确性

**修复建议**:
应该根据 skill 配置的敏感程度（如是否包含 API key、数据库凭证等）动态计算风险分。

---

### 3. **Bug：collect_permissions 处理空 agent payload 时的逻辑问题**
**文件**: `scripts/audit_scan.py:69-70`
**严重程度**: 🟡 中

**问题描述**:
```python
tools = list((payload or {}).get("tools", {}).keys())
skills = (payload or {}).get("skills")
```

当 `payload` 为 `None` 时会正确处理，但当 `payload.tools` 不是字典类型时会抛出 AttributeError。

**潜在错误场景**:
```json
{
  "agents": {
    "myagent": {
      "tools": ["exec", "browser"]  // 如果是列表而不是字典
    }
  }
}
```

**修复建议**:
```python
tools_obj = (payload or {}).get("tools", {})
tools = list(tools_obj.keys()) if isinstance(tools_obj, dict) else tools_obj if isinstance(tools_obj, list) else []
```

---

### 4. **Bug：日志错误率计算中的 total_lines 最小值处理问题**
**文件**: `scripts/audit_scan.py:182`
**严重程度**: 🟢 低

**问题描述**:
```python
total_lines += max(lines, 1)
```

这会导致即使空日志文件也被计入 1 行，可能使错误率计算偏低。

**场景**: 
- 10 个空日志文件 → total_lines = 10
- 1 个文件有 1 行错误 → error_rate = 1/10 = 10%
- 实际应该是 100%

**修复建议**:
```python
total_lines += lines  # 移除 max()
# 在计算时处理：
rate = total_errors / total_lines if total_lines > 0 else 0.0
```

---

### 5. **Bug：敏感信息模式匹配的假阳性问题**
**文件**: `scripts/audit_scan.py:39`
**严重程度**: 🟡 中

**问题描述**:
```python
"Mnemonic": re.compile(r"(\b[a-z]+\b\s+){11,}\b[a-z]+\b"),
```

这个正则表达式会匹配任何 12 个以上连续的英文单词，导致大量假阳性。

**假阳性场景**:
- 普通的英文文档段落
- README 文件中的长句子
- 会议记录、日记等

**影响**: 隐私风险分数被严重高估

**修复建议**:
使用 BIP39 词汇表进行精确匹配，或者添加更严格的上下文检测（如检查是否有 "seed phrase"、"mnemonic" 等关键词）。

---

### 6. **Bug：token 统计正则表达式不够健壮**
**文件**: `scripts/audit_scan.py:42-45`
**严重程度**: 🟢 低

**问题描述**:
```python
TOKEN_PATTERNS = [
    re.compile(r'"model"\s*:\s*"(?P<model>[^"]+)",.*?"totalTokens"\s*:\s*(?P<tokens>\d+)', re.IGNORECASE),
    re.compile(r'model=(?P<model>\S+).*?tokens=(?P<tokens>\d+)', re.IGNORECASE),
]
```

第一个模式要求 model 和 totalTokens 在同一行，如果 JSON 格式化换行会匹配失败。

**修复建议**:
使用 `re.DOTALL` 或多行匹配模式，或者使用 JSON 解析而不是正则。

---

### 7. **Bug：collect_permissions 中 skill 的 tools 字段误用**
**文件**: `scripts/audit_scan.py:100`
**严重程度**: 🟡 中

**问题描述**:
```python
"tools": list((payload or {}).keys()),
```

这里将 skill 配置的所有 key（可能是 API_KEY、DATABASE_URL 等）当作 "tools"，概念混淆。

**影响**: 
- 输出报告中 skill 的 "工具" 字段显示的是配置项名称，不是实际工具
- 与 agent 的 tools 字段语义不一致

**修复建议**:
skill 应该有单独的 "config" 或 "credentials" 字段，不应复用 tools。

---

### 8. **潜在 Bug：敏感信息掩码逻辑过于简单**
**文件**: `scripts/audit_scan.py:92-94`
**严重程度**: 🟡 中

**问题描述**:
```python
if isinstance(value, str) and len(value) > 8:
    masked[key] = value[:6] + "…" + value[-4:]
```

**问题**:
1. 长度 <= 8 的敏感信息（如短密码）会完全暴露
2. 非字符串类型的敏感信息（如数字型密码）不会被掩码
3. 固定的掩码长度可能让攻击者推测原始长度

**修复建议**:
```python
if isinstance(value, (str, int, float)) and str(value) and len(str(value)) > 4:
    val_str = str(value)
    masked[key] = val_str[:2] + "***" + val_str[-2:] if len(val_str) > 4 else "***"
else:
    masked[key] = "***"
```

---

### 9. **Bug：HIGH_RISK_TOOLS 集合中缺少 "gateway"**
**文件**: `scripts/audit_scan.py:27-35`、`SKILL.md:53`
**严重程度**: 🟢 低

**观察**: 
- 代码中 `HIGH_RISK_TOOLS` 包含 "gateway"
- 但 SKILL.md 中列举的高危工具不包括 "gateway"

**影响**: 文档和代码不一致，可能造成用户困惑

**修复建议**: 统一文档和代码，明确 gateway 是否属于高危工具。

---

### 10. **Bug：缺少日志文件不存在时的优雅降级**
**文件**: `scripts/audit_scan.py:161-193`
**严重程度**: 🟢 低

**问题描述**:
当 `LOG_DIR` 不存在时，会返回空结果，但不会告知用户这个情况。用户可能误以为系统没有任何错误。

**修复建议**:
在报告中添加 "dataAvailable" 字段，标识哪些数据源可用。

---

## 📊 Bug 统计

- 🔴 高严重度: 1
- 🟡 中严重度: 6
- 🟢 低严重度: 3
- **总计**: 10 个 Bug

## 🎯 优先修复建议

1. **立即修复**: Bug #1 (score_privilege 计算错误)
2. **短期修复**: Bug #2, #3, #5, #7, #8
3. **长期优化**: Bug #4, #6, #9, #10

---

**审查人员**: AI Code Reviewer  
**审查日期**: 2026-03-03
