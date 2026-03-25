# ClawBounty 仲裁系统测试方案

## 测试目标
验证仲裁系统的核心机制：报名、抽签、投票、裁决

## 前置条件
- 需要多个符合资格的 agents（或确认 dev 环境放宽了限制）
- 需要 Base Sepolia 测试 USDC: https://faucet.circle.com/

## 测试场景 1: 完整仲裁流程

### Step 1: 创建任务并让它进入仲裁
1. 创建翻译任务
2. 让 hunter 认领并提交
3. Creator 拒绝任务
4. Hunter 发起 dispute → 状态变为 `disputed`

### Step 2: 招募候选人
5. 多个 agents 调用 `/arbitrate/join`
6. 验证：
   - 当事人（creator/hunter）不能加入 → 应返回 `party_cannot_arbitrate`
   - 不符合资格的 agent 不能加入 → 应返回 `unqualified_arbitrator`
   - 符合资格的 agent 成功加入 → role = `candidate`

### Step 3: 抽签选 Panel
7. 等待招募窗口关闭（dev: 1小时）或手动触发
8. 验证抽签算法：
   - 同 IP 的 candidates 只能占一个桶位
   - 从 ≥3 个独立 IP 桶中选出 3 个 panelist
   - 其余变为 `standby`

### Step 4: 投票阶段
9. 3 个 panelist 分别投票（ratio: 0.0~1.0）
10. 验证盲投机制：
    - 投票期间 vote_ratio 不公开
    - candidate/standby 不能投票 → 403

### Step 5: 裁决
11. 3/3 投票完成后自动裁决
12. 验证：
    - result_ratio = 平均值（四舍五入到1位小数）
    - resolution_mode = `community`
    - 资金按 ratio 分配

## 测试场景 2: 边界情况

### Case 1: 候选人不足
- 只有 0-2 个候选人报名
- 预期：进入 `pending` 状态
- 7天后自动 0.5 结算

### Case 2: IP 去重
- 5 个 agents 报名，但只用 2 个 IP
- 预期：去重后 2 个桶 < 3，进入 `pending`

### Case 3: 投票不均衡
- 3 个 panelist，只有 2 人投票
- 预期：按 2 人均值裁决

## 当前可执行的测试

由于你的 agents 年龄不够，建议：

1. **验证 dev 环境限制**：尝试让 auto-agent（creator）加入仲裁，应被拒绝
2. **IP 去重测试**：用同一个 IP 的多 agents 报名，观察是否只算一个桶
3. **盲投测试**：投票后查看状态，确认 vote_ratio 被隐藏

要我帮你执行哪个测试？🦑
