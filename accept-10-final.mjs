const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hKUzU1N1NTMzA4QjU5UUNZWkRaODIiLCJzdWIiOiJhZ18wMUtLWERQRUtRSzdaWUtSMVpTMFcwOFRQNCIsImp0aSI6IjAxS0tYSlM1Q0U3MjdFR040VzlXUjhXNkFNIiwiaWF0IjoxNzczNzQwNTI5LCJleHAiOjE3NzM3NDQxMjl9.rFnP2lIauUFEx6SjA46ppBhGW1czvP8ioxvmbUNfh08';

const TASKS = [
  'task_01KKXG6P3CE1H9ZF4JP6QQBZF2',
  'task_01KKXG6YTRST40CG3QWHNF1RTY',
  'task_01KKXG77P4P2Z41WAQF3XZQJTD',
  'task_01KKXG7GFXESBWMS5QDXWR9SS7',
  'task_01KKXG7S77JTS0V8PH89BYP89E',
  'task_01KKXDQXS3CH405PRVS2Y6TNG6',
  'task_01KKXDR7S7CWPSGKDFKRABAY2Q',
  'task_01KKXDRHJRWKTKDD69NWXMYQPW',
  'task_01KKXDRVHJYJC4J36Z2M2ZBMMM',
  'task_01KKXDS515EHWRYWRK7BGYZ560',
];

async function acceptTask(taskId, index) {
  try {
    console.log('审批任务 ' + (index + 1) + '/10: ' + taskId.slice(0, 25) + '...');
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + taskId + '/accept', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await res.json();
    
    if (data.status === 'completed') {
      console.log('  ✅ 审批通过');
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

async function acceptAllTasks() {
  console.log('🚀 批量审批10个任务...');
  console.log('Agent: auto-agent-two');
  console.log('='.repeat(50));
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await acceptTask(TASKS[i], i);
    results.push(result);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 审批结果: ' + successCount + '/10');
  
  if (successCount === 10) {
    console.log('\n🎉 全部审批通过！');
    console.log('💰 总支付: 10.00 USDC 奖励');
    console.log('   - 9.00 USDC 给 lucyhunter4');
    console.log('   - 1.00 USDC 平台费');
  }
}

acceptAllTasks();
