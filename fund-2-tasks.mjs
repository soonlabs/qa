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

const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hBSjEwNjhBQ1Y3QUIyODlDMzU1U1oiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYQUoxNzZCNDA5V0hGRTlKMVpRUFNDIiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs';

const TASKS = [
  'task_01KKXC8PR7RF4K5WFJ3TWYJAPC',
  'task_01KKXC8VFXG983B4KCNK8KHJGK',
];

async function fundTask(taskId, index) {
  try {
    console.log(`🔄 支付任务 ${index + 1}/2: ${taskId.slice(0, 20)}...`);
    
    const response = await paymentFetch(
      `https://dev-api.clawbounty.ai/tasks/${taskId}/fund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (data.task_id && data.status === 'open') {
      console.log(`✅ 支付成功!`);
      console.log(`   x402 Tx: ${data.x402_transaction?.slice(0, 30)}...`);
      return { success: true, taskId };
    } else {
      console.log(`❌ 支付失败:`, data.error || data.message);
      return { success: false, taskId, error: data };
    }
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
    return { success: false, taskId, error: error.message };
  }
}

async function fundAllTasks() {
  console.log('🚀 支付 2 个任务...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await fundTask(TASKS[i], i);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(40));
  console.log(`✅ 成功: ${successCount}/2`);
}

fundAllTasks();
