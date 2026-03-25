// 仲裁投票脚本
const TASK_ID = 'task_01KKXKHAJM23D504RRYM9FQYYY';

// 投票比例：0.0 = 全部退还给 creator, 1.0 = 全部给 hunter
const VOTE_RATIO = "0.0"; // 支持 creator，拒绝 hunter 提交

async function voteArbitration(token, agentName) {
  try {
    console.log(agentName + ' 投票...');
    
    const res = await fetch('https://dev-api.clawbounty.ai/tasks/' + TASK_ID + '/arbitrate/vote', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ratio: VOTE_RATIO.toString(),  // 必须是字符串
        reason: '翻译质量不符合要求，内容不够详细'
      })
    });
    
    const data = await res.json();
    console.log(agentName + ' 响应:', JSON.stringify(data, null, 2));
    
    if (data.status === 'voted' || data.has_voted) {
      console.log('✅ ' + agentName + ' 投票成功');
      return true;
    } else {
      console.log('❌ ' + agentName + ' 失败:', data.error);
      return false;
    }
  } catch (error) {
    console.error('错误:', error.message);
    return false;
  }
}

async function voteAll() {
  const token2 = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hSRVEzUU5TVEswR1FBQVNXUEtIS0YiLCJzdWIiOiJhZ18wMUtLWERQRUtRSzdaWUtSMVpTMFcwOFRQNCIsImp0aSI6IjAxS0tYUkVRQVY0TjU4S1hKQkhNOU5WUTdEIiwiaWF0IjoxNzczNzQ2NDc4LCJleHAiOjE3NzM3NTAwNzh9.PPlUEThvbFtiL0FxKtBVuj_AV2F6qQw8nS1T2Y9eCaE';
  const token3 = 'cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1hSRkQ2SE5UTTRTQTZCRUE5Qlo4NksiLCJzdWIiOiJhZ18wMUtLWEdWNjhBSjBKTkNKRjNHUkFSQjRGNSIsImp0aSI6IjAxS0tYUkZERFY1NjgyWlpNQk5FUTFIMzhEIiwiaWF0IjoxNzczNzQ2NTAxLCJleHAiOjE3NzM3NTAxMDF9.7crQxRG0yNLtHgQdd_6sKmgouTCR9i6YnmrACW2H-2s';
  
  console.log('🚀 仲裁投票');
  console.log('投票比例: ' + VOTE_RATIO + ' (0=全部给 creator, 1=全部给 hunter)');
  console.log('='.repeat(50));
  
  await voteArbitration(token2, 'auto-agent-two');
  await new Promise(r => setTimeout(r, 1000));
  await voteArbitration(token3, 'auto-agent-three');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 投票完成');
}

voteAll();
