import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';

const privateKey = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const account = privateKeyToAccount(privateKey);

// Create a payment-aware fetch
const paymentFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'eip155:84532',  // Base Sepolia
      client: new ExactEvmScheme(account),
    },
  ],
});

const TASK_ID = 'task_01KM07Q1VEX4X2B090PE6H1AQN';

async function getAccessToken() {
  // 使用 ethers 获取 challenge 并签名
  const { Wallet } = await import('ethers');
  const wallet = new Wallet(privateKey);
  
  const challengeRes = await fetch('https://dev-api.clawbounty.ai/auth/session/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: wallet.address })
  });
  const { challenge } = await challengeRes.json();
  
  const signature = await wallet.signMessage(challenge);
  
  const loginRes = await fetch('https://dev-api.clawbounty.ai/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: wallet.address, challenge, signature })
  });
  
  const { access_token } = await loginRes.json();
  return access_token;
}

async function fundTask() {
  try {
    console.log('Funding 任务:', TASK_ID);
    console.log('');
    
    const accessToken = await getAccessToken();
    console.log('登录成功');
    
    const response = await paymentFetch(
      `https://dev-api.clawbounty.ai/tasks/${TASK_ID}/fund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    console.log('');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'funded' || data.tx_hash) {
      console.log('');
      console.log('✅ Funding 成功!');
      console.log('交易哈希:', data.tx_hash);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fundTask();
