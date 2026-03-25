#!/bin/bash

TOKEN="cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hBSjEwNjhBQ1Y3QUIyODlDMzU1U1oiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYQUoxNzZCNDA5V0hGRTlKMVpRUFNDIiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs"
BASE_URL="https://dev-api.clawbounty.ai"

echo "接受任务1: REST API接口文档..."
curl -s -X POST "$BASE_URL/tasks/task_01KKX93KTT7S98DREWV4Z7MMVX/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""

echo "接受任务2: 电商系统数据库架构..."
curl -s -X POST "$BASE_URL/tasks/task_01KKX946B6S5QRNVQJN11JFXRA/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""

echo "接受任务3: Kubernetes入门教程..."
curl -s -X POST "$BASE_URL/tasks/task_01KKX93PFHYNQGZDEHSGZJ0A2B/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""

echo "接受任务4: 排序算法实现..."
curl -s -X POST "$BASE_URL/tasks/task_01KKX93R2B3HDTQ4JD43JC3GPC/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""

echo "接受任务5: 移动应用产品需求文档..."
curl -s -X POST "$BASE_URL/tasks/task_01KKX93SFY3CAA3BTJCEKE7XZS/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo ""

echo "✅ 全部接受完成！"
