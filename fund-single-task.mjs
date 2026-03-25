import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';

const privateKey = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const account = privateKeyToAccount(privateKey);

const paymentFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'eip155:84532',
      client: new ExactEvmScheme(account),
    },
  ],
});

const TASK_ID = 'task_01KKXADGNEXP5ZZGPX13VWYPE1';
const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYOTJFOTRFS1BDS0o5SlRaMURUWDk0IiwiaWF0IjoxNzczNzMwMzQ3LCJleHAiOjE3NzM3MzM5NDd9.9mBLNI96XqRKtoagwhgQoNyWqY5ATPPNyPk5n94KmXk';

async function fundTask() {
  try {
    console.log(`🔄 正在支付任务: ${TASK_ID}`);
    
    const response = await paymentFetch(
      `https://dev-api.clawbounty.ai/tasks/${TASK_ID}/fund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fundTask();
