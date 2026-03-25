import { Wallet } from 'ethers';

const TASK_ID = 'task_01KKZZKH9TDJBJ7RE74VK8AP7A';
const VOTE_RATIO = "0.0"; // 支持 creator

const agents = [
  {
    name: 'auto-agent',
    privateKey: '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c',
    address: '0x6A136B6eC8954eE713256F9f8C1872f8Ea505a44'
  },
  {
    name: 'auto-agent-two',
    privateKey: '0x41c457721b065f5a0ca66de83e9ae861f0b91e97e149b59d8e20514381714f8a',
    address: '0x3571B520a9B3E8Cc1fb7F5dA050B5fC34C4AE969'
  },
  {
    name: 'auto-agent-three',
    privateKey: '0x429e7b2b0a8b93042c2b177d367ae8cf4f7fc6a2d9dafca05e660a8db1d325b8',
    address: '0xB3C5Cc751707B23DF6573eEbf7a1Aef998595532'
  }
];

async function getToken(agent) {
  const wallet = new Wallet(agent.privateKey);
  
  // 获取 challenge
  const challengeRes = await fetch('https://dev-api.clawbounty.ai/auth/session/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: wallet.address })
  });
  const { challenge } = await challengeRes.json();
  
  // 签名
  const signature = await wallet.signMessage(challenge);
  
  // 登录
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
  return access_token;
}

async function joinArbitration(token, agentName) {
  try {
    const res = await fetch(`https://dev-api.clawbounty.ai/tasks/${TASK_ID}/arbitrate/join`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    
    if (data.joined_at) {
      console.log(`✅ ${agentName} 加入仲裁成功`);
      return true;
    } else if (data.error === 'already_joined') {
      console.log(`✓ ${agentName} 已在仲裁中`);
      return true;
    } else {
      console.log(`❌ ${agentName} 加入失败: ${data.error}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${agentName} 错误: ${e.message}`);
    return false;
  }
}

async function voteArbitration(token, agentName) {
  try {
    const res = await fetch(`https://dev-api.clawbounty.ai/tasks/${TASK_ID}/arbitrate/vote`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ratio: VOTE_RATIO,
        reason: '翻译质量不符合要求，内容不够详细'
      })
    });
    const data = await res.json();
    
    if (data.voted_at) {
      console.log(`✅ ${agentName} 投票成功: ${data.vote_ratio}`);
      return true;
    } else {
      console.log(`❌ ${agentName} 投票失败: ${data.error}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${agentName} 投票错误: ${e.message}`);
    return false;
  }
}

async function processAgent(agent) {
  console.log(`\n🦑 处理 ${agent.name}...`);
  
  const token = await getToken(agent);
  
  // 加入仲裁
  const joined = await joinArbitration(token, agent.name);
  if (!joined) return;
  
  // 等待一下避免 rate limit
  await new Promise(r => setTimeout(r, 1000));
  
  // 投票
  await voteArbitration(token, agent.name);
}

async function main() {
  console.log('=== 三个 Agent 加入仲裁并投票 ===');
  console.log(`任务: ${TASK_ID}`);
  console.log(`投票比例: ${VOTE_RATIO} (0=支持creator, 1=支持hunter)`);
  console.log('');
  
  for (const agent of agents) {
    await processAgent(agent);
    await new Promise(r => setTimeout(r, 2000)); // 间隔避免 rate limit
  }
  
  console.log('\n=== 完成 ===');
}

main();
