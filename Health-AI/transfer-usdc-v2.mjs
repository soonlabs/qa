import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const OLD_PRIVATE_KEY = '0xd69488bd1bbd31e6b9886d19824349f62bea632cd327c4bff2bcb93ff97b7b5c';
const NEW_WALLET = '0xB3C5Cc751707B23DF6573eEbf7a1Aef998595532';

const account = privateKeyToAccount(OLD_PRIVATE_KEY);

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function transferUSDC() {
  try {
    console.log('🔄 转账 10 USDC 到新钱包...');
    console.log('从:', account.address);
    console.log('到:', NEW_WALLET);
    
    const data = '0xa9059cbb' + 
      NEW_WALLET.slice(2).padStart(64, '0') + 
      parseUnits('10', 6).toString(16).padStart(64, '0');
    
    const hash = await client.sendTransaction({
      to: USDC_ADDRESS,
      data: data,
    });
    
    console.log('✅ 转账成功!');
    console.log('交易哈希:', hash);
  } catch (error) {
    console.error('❌ 转账失败:', error.message);
  }
}

transferUSDC();
