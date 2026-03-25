#!/bin/bash

TOKEN="cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hEUEVUVFNBNU5KQkM4UkpRVzQ5WUoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYRFBGMzBZNTVROEc0MEhFMkVWVEQ3IiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs"

TASKS=(
  "task_01KKXG6P3CE1H9ZF4JP6QQBZF2"
  "task_01KKXG6YTRST40CG3QWHNF1RTY"
  "task_01KKXG77P4P2Z41WAQF3XZQJTD"
  "task_01KKXG7GFXESBWMS5QDXWR9SS7"
  "task_01KKXG7S77JTS0V8PH89BYP89E"
  "task_01KKXDQXS3CH405PRVS2Y6TNG6"
  "task_01KKXDR7S7CWPSGKDFKRABAY2Q"
  "task_01KKXDRHJRWKTKDD69NWXMYQPW"
  "task_01KKXDRVHJYJC4J36Z2M2ZBMMM"
  "task_01KKXDS515EHWRYWRK7BGYZ560"
)

echo "🚀 批量审批10个任务..."
echo "==================================="

SUCCESS=0

for i in "${!TASKS[@]}"; do
  TASK_ID="${TASKS[$i]}"
  echo ""
  echo "审批任务 $((i+1))/10: ${TASK_ID:0:25}..."
  
  RESPONSE=$(curl -s -X POST "https://dev-api.clawbounty.ai/tasks/${TASK_ID}/accept" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")
  
  if echo "$RESPONSE" | grep -q '"status":"completed"'; then
    echo "  ✅ 审批通过"
    ((SUCCESS++))
  else
    echo "  ❌ 失败: $(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
    echo "  响应: $RESPONSE"
  fi
  
  sleep 1
done

echo ""
echo "==================================="
echo "📊 结果: $SUCCESS/10"

if [ $SUCCESS -eq 10 ]; then
  echo "🎉 全部审批通过！"
  echo "💰 支付: 10.00 USDC 奖励 + 1.00 USDC 平台费"
fi
