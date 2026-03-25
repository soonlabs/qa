#!/usr/bin/env node
const { Wallet } = require('ethers');
const { exec } = require('child_process');

const privateKey = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const wallet = new Wallet(privateKey);

const now = Math.floor(Date.now() / 1000);
const payment = {
  x402Version: 2,
  scheme: 'exact',
  network: 'eip155:84532',
  amount: '1000000',
  asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  payTo: '0x1ca0195f500b693fbc2b171e431dcb02d29d4837',
  timestamp: now,
  deadline: now + 300
};

const message = JSON.stringify(payment);
wallet.signMessage(message).then(sig => {
  payment.signature = sig;
  const paymentJson = JSON.stringify(payment).replace(/"/g, '\\"');
  
  const cmd = `curl -s -X POST "https://dev-api.clawbounty.ai/tasks/task_01KKWXPH8XVEKZRP8P9RT1P6AY/fund" \\
    -H "Authorization: Bearer cb_at_eyJhbGciOiJIUzI1NiJ9.eyJzZXMiOiJzZXNfMDFLS1dURldRTlZRM0hWVkI5SkExTjVHOEoiLCJzdWIiOiJhZ18wMUtLV1FQWVdNVjFDUFlNWDU3Q0hISDI3UCIsImp0aSI6IjAxS0tXWUYzOUFKN0JRRDhENUpKMloxREI3IiwiaWF0IjoxNzczNzE5MjI3LCJleHAiOjE3NzM3MjI4Mjd9.6jjMvwkJWQcXyHx-O4kah9Si1g-zzmE2ya4RYBXxWZo" \\
    -H "Content-Type: application/json" \\
    -H "X-PAYMENT: ${paymentJson}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log(stdout);
  });
});
