const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hLRlRTM1hLNzdBUzZXMVFXVzZFUDkiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYS0ZWMEhFM1FRMVJRRkZSRFRBTk1IIiwiaWF0IjoxNzczNzQxMjcyLCJleHAiOjE3NzM3NDQ4NzJ9.bxCRwY7faVx2D0AV9UNzdUi7xGyz0YepMc8FRf2Ucdc';

const TASKS = [
  { title: '区块链技术英文文档翻译任务', desc: '将一篇关于区块链技术的英文技术文档翻译成中文，约2000词，包含技术架构、共识机制等内容。' },
  { title: '人工智能研究论文翻译工作', desc: '翻译一篇AI领域的英文学术论文摘要和结论部分，约1500词，要求术语准确。' },
  { title: '云计算白皮书中文翻译任务', desc: '将云计算平台的技术白皮书从英文翻译成中文，涉及云架构、服务模型等内容。' },
  { title: '数据分析教程英文翻译项目', desc: '翻译Python数据分析英文教程一章，包含代码注释和说明文字，约1800词。' },
  { title: '网络安全指南翻译任务', desc: '将网络安全最佳实践指南从英文翻译成中文，适合企业IT人员阅读。' },
  { title: '机器学习入门文章翻译工作', desc: '翻译机器学习入门英文文章，解释基础概念和算法，适合初学者。' },
  { title: '软件工程文档中文翻译任务', desc: '翻译软件工程规范文档，包含开发流程、代码审查等内容。' },
  { title: '产品经理英文资料翻译项目', desc: '翻译产品经理必读英文资料，包含用户研究、需求分析等内容。' },
  { title: 'DevOps实践指南翻译任务', desc: '将DevOps实践指南从英文翻译成中文，涉及CI/CD、自动化等内容。' },
  { title: '前端开发技术文档翻译工作', desc: '翻译前端开发技术文档，包含React/Vue等框架的使用说明。' },
];

async function createTask(task, index) {
  try {
    console.log('\n创建任务 ' + (index + 1) + '/10: ' + task.title.slice(0, 30) + '...');
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        description: task.desc,
        category: 'translation',
        reward_amount: '1.00',
        currency: 'USDC',
        deadline: '2026-04-10T00:00:00Z',
        claim_ttl: 86400,
        deliverable_type: 'text',
        submission_requirements: '提交中文翻译文本'
      })
    });
    
    const data = await res.json();
    
    if (data.task_id) {
      console.log('  ✅ 创建成功: ' + data.task_id);
      return { success: true, taskId: data.task_id, title: task.title };
    } else {
      console.log('  ❌ 失败: ' + (data.error || data.message));
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('  ❌ 错误: ' + error.message);
    return { success: false, error: error.message };
  }
}

async function createAllTasks() {
  console.log('🚀 创建10个翻译任务 (auto-agent)');
  console.log('='.repeat(50));
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await createTask(TASKS[i], i);
    results.push(result);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 创建结果: ' + successCount + '/10');
  
  if (successCount > 0) {
    console.log('\n成功创建的任务ID:');
    results.filter(r => r.success).forEach((r, i) => {
      console.log((i + 1) + '. ' + r.taskId);
    });
    console.log('\n💡 请使用 fund-tasks.mjs 脚本支付这些任务');
  }
}

createAllTasks();
