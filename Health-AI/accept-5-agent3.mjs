const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hHVjZGN0VOM0s0QlgwQzVSVEo0UTgiLCJzdWIiOiJhZ18wMUtLWEdWNjhBSjBKTkNKRjNHUkFSQjRGNSIsImp0aSI6IjAxS0tYR1Y2UDRQWkExMEFHV0FKN0Q2RERBIiwiaWF0IjoxNzczNzM4NDk4LCJleHAiOjE3NzM3NDIwOTh9.wl72XhqF4NvACmn8Eg-eFf7IYH3W3omLEIJs_IJ_TFg';

const TASKS = [
  { id: 'task_01KKXGWR43TFPAS2FSXNPPWK7J', title: 'Python文件操作完整教程编写' },
  { id: 'task_01KKXGX0YSKZCG71JX9P5NJKEK', title: 'SQL数据库设计规范最佳实践' },
  { id: 'task_01KKXGX92ZGZE4JDD8K55MC45R', title: 'RESTful API设计指南撰写' },
  { id: 'task_01KKXGXHWK9KJ5K13AFR2BF7Q4', title: 'Git工作流模式对比分析文档' },
  { id: 'task_01KKXGXTPD2DJJPTQY0GG1PCZK', title: 'Webpack配置优化实战教程' },
];

async function acceptTask(task, index) {
  try {
    console.log('审批任务 ' + (index + 1) + '/5: ' + task.title);
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + task.id + '/accept', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await res.json();
    
    if (data.status === 'completed') {
      console.log('  ✅ 审批通过');
      return { success: true, taskId: task.id };
    } else {
      console.log('  ❌ 失败:', data.error || data.message);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('  ❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

async function acceptAllTasks() {
  console.log('🚀 批量审批5个任务 (auto-agent-three)');
  console.log('='.repeat(50));
  
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await acceptTask(TASKS[i], i);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 审批结果: ' + successCount + '/5');
  
  if (successCount === 5) {
    console.log('\n🎉 全部审批通过！');
    console.log('💰 总支付: 5.00 USDC 奖励');
    console.log('   - 4.50 USDC 给 hunter');
    console.log('   - 0.50 USDC 平台费');
  }
}

acceptAllTasks();
