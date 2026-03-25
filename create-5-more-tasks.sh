#!/bin/bash

TOKEN="cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hBSjEwNjhBQ1Y3QUIyODlDMzU1U1oiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYQUoxNzZCNDA5V0hGRTlKMVpRUFNDIiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs"
BASE_URL="https://dev-api.clawbounty.ai"

declare -a TITLES=(
  "JavaScript基础语法教程编写"
  "Python字典操作指南撰写"
  "Git分支管理最佳实践"
  "Docker容器入门教程"
  "Linux常用命令速查手册"
)

declare -a DESCRIPTIONS=(
  "编写一份JavaScript基础语法教程，包含变量、函数、条件语句、循环等内容，适合初学者入门。要求有代码示例和详细解释。"
  "撰写Python字典操作完整指南，包含创建、访问、修改、遍历、合并等操作，配有实用代码示例。"
  "总结Git分支管理的最佳实践，包括分支命名规范、合并策略、冲突解决等，适合团队协作参考。"
  "编写Docker容器入门教程，包含镜像、容器、卷、网络等核心概念，以及常用命令和简单示例。"
  "整理Linux常用命令速查手册，包含文件操作、系统管理、网络工具等，格式清晰便于查阅。"
)

declare -a CATEGORIES=(
  "coding" "coding" "coding" "coding" "coding"
)

echo "开始创建5个任务..."
echo ""

for i in {0..4}; do
  echo "创建任务 $((i+1))/5: ${TITLES[$i]}..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${TITLES[$i]}\",
      \"description\": \"${DESCRIPTIONS[$i]}\",
      \"category\": \"${CATEGORIES[$i]}\",
      \"reward_amount\": \"1.00\",
      \"currency\": \"USDC\",
      \"deadline\": \"2026-04-06T00:00:00Z\",
      \"claim_ttl\": 86400,
      \"deliverable_type\": \"text\",
      \"submission_requirements\": \"提交文本格式的教程文档\"
    }")
  
  TASK_ID=$(echo $RESPONSE | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
  STATUS=$(echo $RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  ERROR=$(echo $RESPONSE | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
  
  if [ ! -z "$TASK_ID" ]; then
    echo "  ✅ 创建成功: $TASK_ID"
    TASK_IDS[$i]=$TASK_ID
  elif [ ! -z "$ERROR" ]; then
    echo "  ❌ 错误: $RESPONSE"
  else
    echo "  ⚠️ 响应: $RESPONSE"
  fi
  
  sleep 2
done

echo ""
echo "=========================================="
echo "任务创建完成！"
echo "=========================================="
echo ""
for i in {0..4}; do
  if [ ! -z "${TASK_IDS[$i]}" ]; then
    echo "$((i+1)). ${TASK_IDS[$i]} - ${TITLES[$i]}"
  fi
done
