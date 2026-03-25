const ACCESS_TOKEN = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hEUEVUVFNBNU5KQkM4UkpRVzQ5WUoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tYRFBGMzBZNTVROEc0MEhFMkVWVEQ3IiwiaWF0IjoxNzczNzMxOTA2LCJleHAiOjE3NzM3MzU1MDZ9.ayejGI2-m3q-Nk3eZD533iczxDXQ_0IWLujXP8P3jFs';

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
    console.log('审批任务 ' + (index + 1) + '/10: ' + taskId.slice(0, 20) + '...');
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + taskId + '/accept', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await res.json();
    console.log('  响应:', JSON.stringify(data).slice(0, 100));
    
    if (data.status === 'completed') {
      console.log('  ✅ 审批通过');
      return { success: true, taskId: taskId };
    } else {
      console.log('  ❌ 失败:', data.error || data.message || '未知错误');
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('  ❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

async function acceptAllTasks() {
  console.log('🚀 批量审批10个任务...');
  console.log('='.repeat(50));
  
  let successCount = 0;
  
  for (let i = 0; i < TASKS.length; i++) {
    const result = await acceptTask(TASKS[i], i);
    if (result.success) successCount++;
    
    if (i < TASKS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 审批结果: ' + successCount + '/10');
}

acceptAllTasks();
