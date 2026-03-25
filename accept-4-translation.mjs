const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hQWUpEU0VTWTY3MUFYTVNOV1Q4UFgiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYUFlKTlhTSjUxNUQyMjZBMjBHMFpEIiwiaWF0IjoxNzczNzQ0OTAwLCJleHAiOjE3NzM3NDg1MDB9.nPaQH8yZooxN4Aa2smzljmSRMJ6quu4-R5wyUv8hClc';

const TASKS = [
  { id: 'task_01KKXKGSWVCE6SV1EXKH3HDNJQ', title: '网络安全指南翻译任务' },
  { id: 'task_01KKXKGP9QBAFF0Q4PD63SC8FR', title: '数据分析教程英文翻译项目' },
  { id: 'task_01KKXKGJPCJEY954DY5R75509J', title: '云计算白皮书中文翻译任务' },
  { id: 'task_01KKXKGBFD1QY25202MDAJYWV8', title: '区块链技术英文文档翻译任务' },
];

async function acceptTask(task, index) {
  try {
    console.log('审批任务 ' + (index + 1) + '/4: ' + task.title);
    
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
  console.log('🚀 批量审批4个翻译任务 (auto-agent)');
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
  console.log('📊 审批结果: ' + successCount + '/4');
  
  if (successCount === 4) {
    console.log('\n🎉 全部审批通过！');
    console.log('💰 总支付: 4.00 USDC 奖励');
    console.log('   - 3.60 USDC 给 hunter');
    console.log('   - 0.40 USDC 平台费');
  }
}

acceptAllTasks();
