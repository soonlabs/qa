#!/bin/bash

TOKEN="cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hBSjEwNjhBQ1Y3QUIyODlDMzU1U1oiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYQUoxNzZCNDA5V0hGRTlKMVpRUFNDIiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs"
BASE_URL="https://dev-api.clawbounty.ai"

declare -a TITLES=(
  "Python列表操作教程"
  "Git基础命令总结"
  "HTTP状态码速查表"
  "正则表达式常用模式"
  "SQL基础查询语句"
  "Docker常用命令清单"
  "Linux文件权限说明"
  "JSON格式规范指南"
  "Markdown语法速查"
  "CSS选择器参考手册"
)

declare -a DESCRIPTIONS=(
  "编写一份Python列表常用操作教程，包含增删改查、切片、排序等基础操作，适合初学者。要求有代码示例。"
  "总结Git最常用的10个命令，包括init、add、commit、push、pull、branch等，每个命令附带简要说明和使用示例。"
  "整理一份HTTP状态码速查表，包含1xx-5xx各类状态码的含义和常见场景，格式清晰易查。"
  "收集整理10个最常用的正则表达式模式，如邮箱验证、手机号验证、URL匹配等，附带解释说明。"
  "编写SQL基础查询教程，包含SELECT、WHERE、JOIN、GROUP BY等核心语句，配有简单示例。"
  "整理Docker最常用的10个命令，包括run、ps、exec、build、push等，每个命令有简要说明。"
  "说明Linux文件权限系统，包括rwx含义、chmod命令、数字权限表示法等，适合新手理解。"
  "编写JSON格式规范指南，包含基本语法、数据类型、嵌套结构等，附带正确和错误的示例对比。"
  "整理Markdown常用语法，包括标题、列表、链接、图片、代码块等，格式为速查表形式。"
  "编写CSS选择器参考手册，包含基础选择器、组合选择器、伪类等，每个选择器附带示例。"
)

declare -a CATEGORIES=(
  "coding" "coding" "coding" "coding" "coding" 
  "coding" "coding" "coding" "writing" "coding"
)

echo "开始创建10个简单任务..."
echo ""

for i in {0..9}; do
  echo "创建任务 $((i+1))/10: ${TITLES[$i]}..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${TITLES[$i]}\",
      \"description\": \"${DESCRIPTIONS[$i]}\",
      \"category\": \"${CATEGORIES[$i]}\",
      \"reward_amount\": \"1.00\",
      \"currency\": \"USDC\",
      \"deadline\": \"2026-04-05T00:00:00Z\",
      \"claim_ttl\": 86400,
      \"deliverable_type\": \"text\",
      \"submission_requirements\": \"提交文本格式的教程或速查表\"
    }")
  
  TASK_ID=$(echo $RESPONSE | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
  STATUS=$(echo $RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  
  if [ ! -z "$TASK_ID" ]; then
    echo "  ✅ 创建成功: $TASK_ID (status: $STATUS)"
    TASK_IDS[$i]=$TASK_ID
  else
    echo "  ❌ 创建失败: $RESPONSE"
  fi
  
  sleep 1
done

echo ""
echo "=========================================="
echo "任务创建完成！"
echo "=========================================="
echo ""
echo "创建的任务ID列表:"
for i in {0..9}; do
  if [ ! -z "${TASK_IDS[$i]}" ]; then
    echo "$((i+1)). ${TASK_IDS[$i]} - ${TITLES[$i]}"
  fi
done
