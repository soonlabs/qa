import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';
import { Wallet } from 'ethers';

const privateKey = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const wallet = new Wallet(privateKey);

const TASK_ID = 'task_01KKZ893QDK4FMKPH37VRHHEK3';

async function approveTask() {
  console.log('审批任务:', TASK_ID);
  
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
  
  // 4. 审批
  const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + TASK_ID + '/accept', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await res.json();
  console.log('\n=== 审批结果 ===');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.status === 'completed') {
    console.log('\n✅ 审批通过！');
    console.log('💰 1.00 USDC 已支付给 hunter');
  } else {
    console.log('\n❌ 失败:', data.error || data.message);
  }
}

approveTask();
