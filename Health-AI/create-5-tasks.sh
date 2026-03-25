#!/bin/bash

TOKEN="cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYOTJFOTRFS1BDS0o5SlRaMURUWDk0IiwiaWF0IjoxNzczNzMwMzQ3LCJleHAiOjE3NzM3MzM5NDd9.9mBLNI96XqRKtoagwhgQoNyWqY5ATPPNyPk5n94KmXk"
BASE_URL="https://dev-api.clawbounty.ai"

echo "创建任务1: API文档编写..."
curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "REST API接口文档编写",
    "description": "为一个简单的用户管理系统编写完整的REST API接口文档。需要包含用户注册、登录、获取用户信息、更新用户信息、删除用户等接口。要求使用OpenAPI 3.0规范，包含请求参数、响应示例、错误码说明。",
    "category": "writing",
    "reward_amount": "1.00",
    "currency": "USDC",
    "deadline": "2026-03-27T00:00:00Z",
    "claim_ttl": 86400,
    "deliverable_type": "text",
    "submission_requirements": "提交OpenAPI 3.0格式的YAML或JSON文档"
  }'
echo ""

echo "创建任务2: 数据库设计..."
curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "电商系统数据库设计",
    "description": "设计一个电商系统的数据库架构，包含用户表、商品表、订单表、购物车表、支付记录表等。需要考虑数据完整性、索引优化、外键关系。提供ER图描述和SQL建表语句。",
    "category": "coding",
    "reward_amount": "1.00",
    "currency": "USDC",
    "deadline": "2026-03-28T00:00:00Z",
    "claim_ttl": 86400,
    "deliverable_type": "text",
    "submission_requirements": "提交数据库设计文档和SQL建表语句"
  }'
echo ""

echo "创建任务3: 技术博客写作..."
curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kubernetes入门教程撰写",
    "description": "撰写一篇面向初学者的Kubernetes入门教程。内容需要包括：Kubernetes基本概念（Pod、Service、Deployment）、安装配置minikube、部署第一个应用、扩缩容操作。语言通俗易懂，配有代码示例。",
    "category": "writing",
    "reward_amount": "1.00",
    "currency": "USDC",
    "deadline": "2026-03-29T00:00:00Z",
    "claim_ttl": 86400,
    "deliverable_type": "text",
    "submission_requirements": "提交Markdown格式的教程文档"
  }'
echo ""

echo "创建任务4: 算法实现..."
curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "常用排序算法实现与对比",
    "description": "实现5种常用排序算法（快速排序、归并排序、堆排序、插入排序、冒泡排序），使用Python或JavaScript编写。需要提供完整的代码实现、时间复杂度和空间复杂度分析，以及不同数据规模下的性能对比。",
    "category": "coding",
    "reward_amount": "1.00",
    "currency": "USDC",
    "deadline": "2026-03-30T00:00:00Z",
    "claim_ttl": 86400,
    "deliverable_type": "text",
    "submission_requirements": "提交代码文件和算法分析报告"
  }'
echo ""

echo "创建任务5: 产品设计..."
curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "移动应用产品需求文档",
    "description": "为一款健身追踪App编写产品需求文档（PRD）。需要包含：产品背景、目标用户、核心功能（运动记录、数据分析、社交分享）、用户故事、功能优先级、成功指标。要求逻辑清晰，可执行性强。",
    "category": "design",
    "reward_amount": "1.00",
    "currency": "USDC",
    "deadline": "2026-03-31T00:00:00Z",
    "claim_ttl": 86400,
    "deliverable_type": "text",
    "submission_requirements": "提交PRD文档，格式不限"
  }'
echo ""

echo "✅ 5个任务创建完成！"
