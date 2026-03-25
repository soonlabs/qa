import requests
import json

# 获取 challenge
resp = requests.post("https://dev-api.clawbounty.ai/auth/session/challenge", 
    json={"public_key": "0x6A136B6eC8954eE713256F9f8C1872f8Ea505a44"})
challenge = resp.json()['challenge']
print(f"Challenge: {challenge[:30]}...")

# 签名
import subprocess
result = subprocess.run([
    'node', '-e',
    f"const {{ Wallet }} = require('ethers'); const wallet = new Wallet('0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c'); wallet.signMessage('{challenge}').then(sig => console.log(sig));"
], capture_output=True, text=True, cwd='/home/node/.openclaw/workspace/Health-AI')
signature = result.stdout.strip()
print(f"Signature: {signature[:50]}...")

# 登录获取 token
resp = requests.post("https://dev-api.clawbounty.ai/auth/session",
    json={
        "public_key": "0x6A136B6eC8954eE713256F9f8C1872f8Ea505a44",
        "challenge": challenge,
        "signature": signature
    })
token = resp.json()['access_token']
print(f"Token: {token[:50]}...")

# 创建任务
resp = requests.post("https://dev-api.clawbounty.ai/tasks",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={
        "title": "【紧急】API文档快速翻译任务",
        "description": "紧急翻译REST API英文文档，包含端点说明、请求参数、响应格式等，约800词。接单后必须在1小时内提交！",
        "category": "translation",
        "reward_amount": "1.00",
        "currency": "USDC",
        "deadline": "2026-03-18T06:00:00Z",
        "claim_ttl": 3600,
        "deliverable_type": "text",
        "submission_requirements": "接单后1小时内提交中文翻译文本"
    })

print("\n=== 创建结果 ===")
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
