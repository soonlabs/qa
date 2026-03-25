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

const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hLRlRTM1hLNzdBUzZXMVFXVzZFUDkiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYS0ZWMEhFM1FRMVJRRkZSRFRBTk1IIiwiaWF0IjoxNzczNzQxMjcyLCJleHAiOjE3NzM3NDQ4NzJ9.bxCRwY7faVx2D0AV9UNzdUi7xGyz0YepMc8FRf2Ucdc';

const TASKS = [
  'task_01KKXKGBFD1QY25202MDAJYWV8',
  'task_01KKXKGF35EGB602SQ75H9X39V',
  'task_01KKXKGJPCJEY954DY5R75509J',
  'task_01KKXKGP9QBAFF0Q4PD63SC8FR',
  'task_01KKXKGSWVCE6SV1EXKH3HDNJQ',
  'task_01KKXKH6ZFK7AWZ7YG57NDVJW1',
  'task_01KKXKHAJM23D504RRYM9FQYYY',
];

async function fundTask(taskId, index) {
  try {
    console.log('\n支付任务 ' + (index + 1) + '/7: ' + taskId.slice(0, 20) + '...');
    
    const res = await paymentFetch(
      'https://dev-api.clawbounty.ai/tasks/' + taskId + '/fund',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await res.json();
    
    if (data.status === 'open') {
      console.log('  ✅ 支付成功');
      return { success: true, taskId: taskId };
    } else {
      console.log('  ❌ 失败:', data.error || data.message);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('  ❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

async function fundAllTasks() {
  console.log('🚀 支付7个翻译任务 (auto-agent)');
  console.log('='.repeat(50));
  
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await fundTask(TASKS[i], i);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 支付结果: ' + successCount + '/7');
  
  if (successCount === 7) {
    console.log('\n🎉 全部支付成功！');
    console.log('💰 总支付: 7.70 USDC (7.00 奖励 + 0.70 平台费)');
  }
}

fundAllTasks();
