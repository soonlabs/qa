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

const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYM0tDWUQ4WU43NlczMFNYQUhUVjFQIiwiaWF0IjoxNzczNzI0NjExLCJleHAiOjE3NzM3MjgyMTF9.kvJVqVPWMvcBBYgbgv8yvy30WRoFiFgxa9_7gVJvSyw';

// 所有待支付的草稿任务
const DRAFT_TASKS = [
  { id: 'task_01KKWWCZREMGN52N0MFXRQ6EQX', title: '数据分析报告撰写 - 新', amount: '1.00' },
  { id: 'task_01KKWWAENFE5JNVSJMC5A4TDCS', title: '代码审查任务20250317', amount: '1.00' },
  { id: 'task_01KKWVK8QVD5049P30PAC4977J', title: '智能合约安全审计任务', amount: '1.00' },
  { id: 'task_01KKWTRB45Z156PDJCBF46TPMC', title: 'AI安全分析报告撰写任务', amount: '1.00' },
  { id: 'task_01KKWTMSYHC0MBN9CZBT7411CW', title: 'AI安全分析报告撰写', amount: '1.00' },
  { id: 'task_01KKWS198Q0XSBHCCJMSH5H3VM', title: '撰写AI安全领域短篇分析文章', amount: '1.10' },
];

async function fundTask(task) {
  try {
    console.log(`\n🔄 正在支付: ${task.title} (${task.amount} USDC)`);
    
    const response = await paymentFetch(
      `https://dev-api.clawbounty.ai/tasks/${task.id}/fund`,
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
      console.log(`✅ 支付成功! Task ID: ${data.task_id}`);
      console.log(`   x402 交易: ${data.x402_transaction}`);
      return { success: true, task: data };
    } else if (data.error) {
      console.log(`❌ 支付失败: ${data.error} - ${data.message}`);
      return { success: false, error: data };
    } else {
      console.log(`⚠️ 未知响应:`, JSON.stringify(data));
      return { success: false, error: data };
    }
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function fundAllTasks() {
  console.log('🚀 开始批量支付 6 个任务...');
  console.log('总计需要: 6.10 USDC\n');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const task of DRAFT_TASKS) {
    const result = await fundTask(task);
    results.push({ ...task, ...result });
    
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 等待 2 秒避免速率限制
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 支付完成统计');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount} 个任务`);
  console.log(`❌ 失败: ${failCount} 个任务`);
  
  console.log('\n📋 详细结果:');
  results.forEach((r, i) => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${r.title}`);
    if (r.success) {
      console.log(`   状态: open | 交易: ${r.task?.x402_transaction?.slice(0, 20)}...`);
    } else {
      console.log(`   错误: ${r.error?.error || r.error}`);
    }
  });
}

fundAllTasks();
