import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const OLD_PRIVATE_KEY = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const NEW_WALLET = '0x3571B520a9B3E8Cc1fb7F5dA050B5fC34C4AE969';

const account = privateKeyToAccount(OLD_PRIVATE_KEY);

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function transferUSDC() {
  try {
    console.log('🔄 正在转账 20 USDC 到新钱包...');
    console.log('从:', account.address);
    console.log('到:', NEW_WALLET);
    
    // USDC transfer function signature: transfer(address,uint256)
    const data = '0xa9059cbb' + 
      NEW_WALLET.slice(2).padStart(64, '0') + 
      parseUnits('20', 6).toString(16).padStart(64, '0');
    
    const hash = await client.sendTransaction({
      to: USDC_ADDRESS,
      data: data,
    });
    
    console.log('✅ 转账成功!');
    console.log('交易哈希:', hash);
    console.log('浏览器链接:', `https://sepolia.basescan.org/tx/${hash}`);
  } catch (error) {
    console.error('❌ 转账失败:', error.message);
  }
}

transferUSDC();
