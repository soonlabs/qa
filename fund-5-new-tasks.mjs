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

const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYOTJFOTRFS1BDS0o5SlRaMURUWDk0IiwiaWF0IjoxNzczNzMwMzQ3LCJleHAiOjE3NzM3MzM5NDd9.9mBLNI96XqRKtoagwhgQoNyWqY5ATPPNyPk5n94KmXk';

const TASKS = [
  'task_01KKX93KTT7S98DREWV4Z7MMVX', // API文档编写
  'task_01KKX946B6S5QRNVQJN11JFXRA', // 电商系统数据库架构设计
  'task_01KKX93PFHYNQGZDEHSGZJ0A2B', // Kubernetes入门教程
  'task_01KKX93R2B3HDTQ4JD43JC3GPC', // 排序算法实现
  'task_01KKX93SFY3CAA3BTJCEKE7XZS', // 健身App PRD
];

async function fundTask(taskId, index) {
  try {
    console.log(`\n🔄 正在支付任务 ${index + 1}/5: ${taskId.slice(0, 20)}...`);
    
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
      console.log(`   x402 交易: ${data.x402_transaction?.slice(0, 30)}...`);
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
  console.log('🚀 开始批量支付 5 个新任务...');
  console.log('总计需要: 5.00 USDC + 0.50 平台费\n');
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await fundTask(TASKS[i], i);
    results.push(result);
    if (result.success) successCount++;
    
    // 等待2秒避免速率限制
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 支付完成统计');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount}/5 个任务`);
  console.log(`❌ 失败: ${TASKS.length - successCount}/5 个任务`);
}

fundAllTasks();
