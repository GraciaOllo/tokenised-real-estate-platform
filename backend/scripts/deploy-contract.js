const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  console.log('Deploying PropertyRegistryERC721 contract to Ganache...');
  
  try {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Use the first account from Ganache (account 0)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Connected to Ganache');
    console.log('Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');
    
    // Load the compiled contract
    const artifactPath = path.join(__dirname, '../src/contracts/compiled/PropertyRegistryERC721.json');
    
    if (!fs.existsSync(artifactPath)) {
      console.error('Contract artifact not found. Please compile the contract first.');
      console.log('Run: node scripts/compile-contract.js');
      process.exit(1);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet
    );
    
    console.log('Deploying contract...');
    
    // Deploy the contract
    const contract = await contractFactory.deploy('PropertyRegistry', 'PROP');
    
    console.log('Waiting for deployment...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed successfully!');
    console.log('Contract address:', contractAddress);
    
    // Save the contract address to a file
    const addressPath = path.join(__dirname, '../src/contracts/compiled/contract-address.json');
    fs.writeFileSync(addressPath, JSON.stringify({
      contractAddress,
      network: 'ganache',
      deployedAt: new Date().toISOString()
    }, null, 2));
    
    console.log('Contract address saved to:', addressPath);
    
    // Test the contract
    console.log('\nTesting contract...');
    
    // Test createProperty function
    const testOwnerWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Ganache account 1
    const testIpfsMetadata = 'QmTest123456789';
    const testValuation = ethers.parseUnits('100000', 'ether'); // 100,000 ETH
    const testMonthlyRent = ethers.parseUnits('1000', 'ether'); // 1,000 ETH
    
    console.log('Creating test property...');
    const tx = await contract.createProperty(
      testOwnerWallet,
      testIpfsMetadata,
      testValuation,
      testMonthlyRent
    );
    
    await tx.wait();
    console.log('Test property created successfully!');
    
    // Get the created property
    const property = await contract.getProperty(1);
    console.log('Test property details:', {
      tokenId: Number(property.tokenId),
      ownerWallet: property.ownerWallet,
      ipfsMetadata: property.ipfsMetadata,
      valuation: ethers.formatUnits(property.valuation, 'ether'),
      monthlyRent: ethers.formatUnits(property.monthlyRent, 'ether')
    });
    
    console.log('\nDeployment and testing completed successfully!');
    console.log('You can now use this contract address in your application.');
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deployContract(); 