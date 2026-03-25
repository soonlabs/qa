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
  { title: "Python文件操作完整教程编写", description: "编写Python文件操作完整教程，包含读写文件、CSV处理、JSON解析、路径操作等，适合初学者入门。", category: "coding" },
  { title: "SQL数据库设计规范最佳实践", description: "总结SQL数据库设计规范，包含命名约定、索引策略、表结构设计、常见反模式避免等实用内容。", category: "coding" },
  { title: "RESTful API设计指南撰写", description: "撰写RESTful API设计完整指南，包含URL设计、HTTP方法使用、状态码规范、版本控制策略等。", category: "coding" },
  { title: "Git工作流模式对比分析文档", description: "对比分析Git Flow、GitHub Flow、Trunk-based等常见工作流模式，说明各自适用场景和优缺点。", category: "coding" },
  { title: "Webpack配置优化实战教程", description: "编写Webpack配置优化实战教程，包含性能优化、代码分割、缓存策略、加载器配置等高级技巧。", category: "coding" },
];

async function createAndFundTask(task, index) {
  try {
    console.log(`\n📝 任务 ${index + 1}/5: ${task.title}`);
    
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
        deadline: "2026-04-08T00:00:00Z",
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
    
    console.log(`  ✅ 创建: ${createData.task_id}`);
    
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
      console.log(`  ✅ 支付成功`);
      return { success: true, taskId: createData.task_id, title: task.title };
    } else {
      console.log(`  ❌ 支付失败:`, fundData.error);
      return { success: false, error: fundData.error };
    }
  } catch (error) {
    console.error(`  ❌ 错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function createAllTasks() {
  console.log('🚀 创建5个新任务 (auto-agent-two)');
  console.log('='.repeat(60));
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await createAndFundTask(TASKS[i], i);
    results.push(result);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ 成功: ${successCount}/5`);
  
  if (successCount > 0) {
    console.log('\n成功创建的任务:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`${i + 1}. ${r.taskId}`);
      console.log(`   ${r.title}`);
    });
  }
}

createAllTasks();
