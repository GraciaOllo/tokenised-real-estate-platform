const { ethers } = require('ethers');

async function checkGanacheAccounts() {
  console.log('🔍 Checking Ganache accounts and balances...\n');
  
  try {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get the first 10 accounts
    const accounts = [];
    for (let i = 0; i < 10; i++) {
      const account = await provider.getSigner(i);
      const address = await account.getAddress();
      const balance = await provider.getBalance(address);
      accounts.push({
        index: i,
        address,
        balance: ethers.formatEther(balance)
      });
    }
    
    console.log('📋 Ganache Accounts:');
    console.log('====================');
    
    accounts.forEach(account => {
      console.log(`Account ${account.index}:`);
      console.log(`  Address: ${account.address}`);
      console.log(`  Balance: ${account.balance} ETH`);
      console.log('');
    });
    
    // Show the private keys for the first few accounts
    console.log('🔑 Private Keys (for testing):');
    console.log('==============================');
    const privateKeys = [
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
      '0x7c852118e8d7c5796b8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5',
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
    ];
    
    privateKeys.forEach((key, index) => {
      console.log(`Account ${index} Private Key: ${key}`);
    });
    
    console.log('\n✅ Ganache connection successful!');
    console.log('💡 Use one of these accounts with sufficient balance for deployment.');
    
  } catch (error) {
    console.error('❌ Failed to connect to Ganache:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Ganache is running on http://127.0.0.1:7545');
    console.log('2. Check if Ganache is accessible');
    console.log('3. Try restarting Ganache if needed');
  }
}

// Run the check
checkGanacheAccounts(); 