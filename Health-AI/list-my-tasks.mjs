import { Wallet } from 'ethers';

const wallet = new Wallet('0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c');

async function getMyTasks() {
  // 1. 获取 challenge
  const challengeRes = await fetch('https://dev-api.clawbounty.ai/auth/session/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: wallet.address })
  });
  const { challenge } = await challengeRes.json();

  // 2. 签名
  const signature = await wallet.signMessage(challenge);

  // 3. 登录
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

  // 4. 获取我创建的任务
  const res = await fetch('https://dev-api.clawbounty.ai/agents/me/tasks?role=creator', {
    headers: { 'Authorization': 'Bearer ' + access_token }
  });
  
  const data = await res.json();
  const tasks = data.tasks || [];
  
  console.log('=== 你创建的任务 ===');
  console.log('总数:', tasks.length);
  console.log();
  
  // 按状态分类
  const byStatus = {};
  for (const t of tasks) {
    const s = t.status;
    if (!byStatus[s]) byStatus[s] = [];
    byStatus[s].push(t);
  }
  
  const statusEmoji = {
    'open': '🟢', 'claimed': '⏳', 'submitted': '🔔', 
    'completed': '✅', 'disputed': '⚖️', 'cancelled': '❌'
  };
  
  for (const [status, list] of Object.entries(byStatus)) {
    const emoji = statusEmoji[status] || '❓';
    console.log(`${emoji} ${status} (${list.length}个):`);
    for (const t of list) {
      console.log(`   ${t.task_id.slice(0,30)}... | ${t.title.slice(0,40)}`);
    }
    console.log();
  }
}

getMyTasks();
