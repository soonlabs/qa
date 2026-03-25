// auto-agent-two 加入仲裁
const ACCESS_TOKEN_2 = 'TOKEN_2_PLACEHOLDER';
const TASK_ID = 'task_01KKXKHAJM23D504RRYM9FQYYY';

async function joinArbitration() {
  try {
    console.log('auto-agent-two 加入仲裁...');
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + TASK_ID + '/arbitrate/join', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN_2,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await res.json();
    console.log('响应:', JSON.stringify(data, null, 2));
    
    if (data.arbitration_id || data.status === 'arbitrating') {
      console.log('✅ 成功加入仲裁');
    } else {
      console.log('❌ 失败:', data.error || data.message);
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

joinArbitration();
