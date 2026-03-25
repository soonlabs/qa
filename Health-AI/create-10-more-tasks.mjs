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

// 更多任务数据
const MORE_TASKS = [
  { title: "TypeScript类型系统入门教程", description: "编写TypeScript类型系统入门教程，包含基础类型、接口、泛型、类型推断等内容，适合有JavaScript基础的开发者。", category: "coding" },
  { title: "React Hooks使用指南撰写", description: "撰写React Hooks完整使用指南，包含useState、useEffect、useContext、自定义Hooks等，配有实际代码示例。", category: "coding" },
  { title: "Node.js后端开发基础教程", description: "编写Node.js后端开发基础教程，包含Express框架、路由、中间件、数据库连接等内容。", category: "coding" },
  { title: "Vue.js组件开发最佳实践", description: "总结Vue.js组件开发最佳实践，包含组件设计、Props、Events、状态管理等，适合前端开发者参考。", category: "coding" },
  { title: "CSS Flexbox布局完全指南", description: "编写CSS Flexbox布局完全指南，包含所有属性详解、常见布局模式、实际案例等，配有可视化示例。", category: "coding" },
  { title: "Python文件操作教程编写", description: "编写Python文件操作完整教程，包含读写文件、CSV、JSON、路径处理等，适合初学者。", category: "coding" },
  { title: "SQL数据库设计规范总结", description: "总结SQL数据库设计规范，包含命名规范、索引设计、表结构设计、常见反模式等。", category: "coding" },
  { title: "RESTful API设计最佳实践", description: "编写RESTful API设计最佳实践指南，包含URL设计、HTTP方法、状态码、版本控制等内容。", category: "coding" },
  { title: "Git工作流模式对比分析", description: "对比分析常见Git工作流模式，包括Git Flow、GitHub Flow、Trunk-based等，说明适用场景。", category: "coding" },
  { title: "Webpack配置优化实战指南", description: "编写Webpack配置优化实战指南，包含性能优化、代码分割、缓存策略等高级配置技巧。", category: "coding" },
];

async function createAndFundTask(task, index) {
  try {
    console.log(`\n📝 任务 ${index + 1}/10: ${task.title.slice(0, 35)}...`);
    
    // 创建任务
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
        deadline: "2026-04-07T00:00:00Z",
        claim_ttl: 86400,
        deliverable_type: "text",
        submission_requirements: "提交文本格式的教程文档"
      })
    });
    
    const createData = await createRes.json();
    
    if (createData.error) {
      console.log(`  ❌ 创建失败: ${createData.error}`);
      if (createData.error === 'rate_limit_exceeded') {
        console.log(`  ⏳ 速率限制，停止创建`);
        return { success: false, rateLimit: true };
      }
      return { success: false, error: createData.error };
    }
    
    console.log(`  ✅ 创建: ${createData.task_id.slice(0, 25)}...`);
    
    // 支付任务
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
  console.log('🚀 创建10个新任务 (auto-agent-two)');
  console.log('='.repeat(55));
  
  const results = [];
  let successCount = 0;
  let stopped = false;
  
  for (let i = 0; i < MORE_TASKS.length; i++) {
    const result = await createAndFundTask(MORE_TASKS[i], i);
    results.push(result);
    
    if (result.rateLimit) {
      stopped = true;
      break;
    }
    
    if (result.success) successCount++;
    
    // 等待2秒
    if (i < MORE_TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(55));
  console.log('📊 结果统计');
  console.log('='.repeat(55));
  console.log(`✅ 成功: ${successCount}/${stopped ? 'stopped' : '10'}`);
  
  if (successCount > 0) {
    console.log('\n成功创建的任务:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log(`${i + 1}. ${r.taskId}`);
      console.log(`   ${r.title}`);
    });
  }
  
  if (stopped) {
    console.log('\n⏳ 因速率限制停止，可稍后继续创建剩余任务');
  }
}

createAllTasks();
