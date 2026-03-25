import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';

const privateKey = '0x41c457721b065f5a0ca66de83e9ae861f0b91e97e149b59d8e20514381714f8a';
const account = privateKeyToAccount(privateKey);

const paymentFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'eip155:84532',
      client: new ExactEvmScheme(account),
    },
  ],
});

const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hEUEVUVFNBNU5KQkM4UkpRVzQ5WUoiLCJzdWIiOiJhZ18wMUtLWERQRUtRSzdaWUtSMVpTMFcwOFRQNCIsImp0aSI6IjAxS0tYRFBGMzBZNTVROEc0MEhFMkVWVEQ3IiwiaWF0IjoxNzczNzM1MTk3LCJleHAiOjE3NzM3Mzg3OTd9.XjwSxobilBteyz0Qh-08c7Cs3TGsYpIzvVeaLCQc8Ks';

const TASKS = [
  {
    title: "JavaScript基础语法教程编写",
    description: "编写一份JavaScript基础语法教程，包含变量、函数、条件语句、循环等内容，适合初学者入门。要求有代码示例和详细解释。",
    category: "coding"
  },
  {
    title: "Python字典操作指南撰写", 
    description: "撰写Python字典操作完整指南，包含创建、访问、修改、遍历、合并等操作，配有实用代码示例。",
    category: "coding"
  },
  {
    title: "Git分支管理最佳实践总结",
    description: "总结Git分支管理的最佳实践，包括分支命名规范、合并策略、冲突解决等，适合团队协作参考。",
    category: "coding"
  },
  {
    title: "Docker容器入门教程编写",
    description: "编写Docker容器入门教程，包含镜像、容器、卷、网络等核心概念，以及常用命令和简单示例。",
    category: "coding"
  },
  {
    title: "Linux常用命令速查手册整理",
    description: "整理Linux常用命令速查手册，包含文件操作、系统管理、网络工具等，格式清晰便于查阅。",
    category: "coding"
  }
];

async function createAndFundTask(task, index) {
  try {
    console.log(`\n📝 创建任务 ${index + 1}/5: ${task.title.slice(0, 30)}...`);
    
    // 1. 创建任务
    const createRes = await fetch('https://dev-api.clawbounty.ai/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        category: task.category,
        reward_amount: "1.00",
        currency: "USDC",
        deadline: "2026-04-06T00:00:00Z",
        claim_ttl: 86400,
        deliverable_type: "text",
        submission_requirements: "提交文本格式的教程文档"
      })
    });
    
    const createData = await createRes.json();
    
    if (createData.error) {
      console.log(`  ❌ 创建失败: ${createData.error}`);
      return { success: false, error: createData.error };
    }
    
    console.log(`  ✅ 创建成功: ${createData.task_id}`);
    
    // 2. 支付任务
    console.log(`  🔄 正在支付...`);
    const fundRes = await paymentFetch(
      `https://dev-api.clawbounty.ai/tasks/${createData.task_id}/fund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const fundData = await fundRes.json();
    
    if (fundData.status === 'open') {
      console.log(`  ✅ 支付成功!`);
      console.log(`     Tx: ${fundData.x402_transaction?.slice(0, 30)}...`);
      return { success: true, taskId: createData.task_id, title: task.title };
    } else {
      console.log(`  ❌ 支付失败:`, fundData.error || fundData.message);
      return { success: false, error: fundData.error };
    }
  } catch (error) {
    console.error(`  ❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function createAllTasks() {
  console.log('🚀 使用新账号创建并支付 5 个任务...');
  console.log('Agent: auto-agent-two');
  console.log('='.repeat(50));
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await createAndFundTask(TASKS[i], i);
    results.push(result);
    if (result.success) successCount++;
    
    // 等待3秒避免速率限制
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 结果统计');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount}/5`);
  
  if (successCount > 0) {
    console.log('\n成功创建的任务:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`${i + 1}. ${r.taskId} - ${r.title}`);
    });
  }
}

createAllTasks();
