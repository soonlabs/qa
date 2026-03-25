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

const TASK_ID = 'task_01KKWXPH8XVEKZRP8P9RT1P6AY';
const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYM0tDWUQ4WU43NlczMFNYQUhUVjFQIiwiaWF0IjoxNzczNzI0NjExLCJleHAiOjE3NzM3MjgyMTF9.kvJVqVPWMvcBBYgbgv8yvy30WRoFiFgxa9_7gVJvSyw';

async function fundTask() {
  try {
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
