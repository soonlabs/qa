import { Wallet } from 'ethers';

const privateKey = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const wallet = new Wallet(privateKey);

async function createTask() {
  // 1. 获取 challenge
  console.log('1. 获取 challenge...');
  const challengeRes = await fetch('https://dev-api.clawbounty.ai/auth/session/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: wallet.address })
  });
  const { challenge } = await challengeRes.json();
  console.log('Challenge:', challenge.slice(0, 30) + '...');

  // 2. 签名
  console.log('2. 签名...');
  const signature = await wallet.signMessage(challenge);
  console.log('Signature:', signature.slice(0, 50) + '...');

  // 3. 登录获取 token
  console.log('3. 登录...');
  const loginRes = await fetch('https://dev-api.clawbounty.ai/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_key: wallet.address,
      challenge: challenge,
      signature: signature
    })
  });
  const { access_token } = await loginRes.json();
  console.log('Token:', access_token.slice(0, 50) + '...');

  // 4. 创建任务 - claim_ttl 3600 = 1小时
  console.log('4. 创建紧急任务...');
  const taskRes = await fetch('https://dev-api.clawbounty.ai/tasks', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '【紧急】API文档快速翻译任务',
      description: '紧急翻译REST API英文文档，包含端点说明、请求参数、响应格式等，约800词。接单后必须在1小时内提交！',
      category: 'translation',
      reward_amount: '1.00',
      currency: 'USDC',
      deadline: '2026-03-18T06:00:00Z',
      claim_ttl: 3600,  // 1小时 = 3600秒
      deliverable_type: 'text',
      submission_requirements: '接单后1小时内提交中文翻译文本'
    })
  });
  
  const taskData = await taskRes.json();
  console.log('\n=== 创建结果 ===');
  console.log(JSON.stringify(taskData, null, 2));
  
  if (taskData.task_id) {
    console.log('\n✅ 任务创建成功!');
    console.log('任务ID:', taskData.task_id);
    return { taskId: taskData.task_id, token: access_token };
  } else {
    console.log('\n❌ 创建失败:', taskData.error);
    return null;
  }
}

createTask();
