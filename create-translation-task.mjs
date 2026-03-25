const ACCESS_TOKEN = 'TOKEN_PLACEHOLDER';

const TASK = {
  title: '微服务架构英文文档翻译任务',
  desc: '将一篇关于微服务架构的英文技术文档翻译成中文，包含服务拆分、服务发现、负载均衡、熔断降级等内容，约2000词。'
};

async function createTask() {
  try {
    console.log('创建翻译任务: ' + TASK.title);
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: TASK.title,
        description: TASK.desc,
        category: 'translation',
        reward_amount: '1.00',
        currency: 'USDC',
        deadline: '2026-04-15T00:00:00Z',
        claim_ttl: 86400,
        deliverable_type: 'text',
        submission_requirements: '提交中文翻译文本'
      })
    });
    
    const data = await res.json();
    
    if (data.task_id) {
      console.log('✅ 创建成功!');
      console.log('任务ID: ' + data.task_id);
      return { success: true, taskId: data.task_id };
    } else {
      console.log('❌ 失败: ' + (data.error || data.message));
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('错误:', error.message);
    return { success: false, error: error.message };
  }
}

createTask();
