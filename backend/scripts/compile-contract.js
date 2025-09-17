const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Function to compile Solidity contracts
function compileContract() {
  console.log('Compiling PropertyRegistryERC721 contract...');
  
  // Read the contract source
  const contractPath = path.join(__dirname, '../src/contracts/PropertyRegistryERC721.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  
  // Prepare the input for solc
  const input = {
    language: 'Solidity',
    sources: {
      'PropertyRegistryERC721.sol': {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  
  // Compile the contract
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  // Check for compilation errors
  if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:');
      errors.forEach(error => console.error(error.formattedMessage));
      process.exit(1);
    }
  }
  
  // Extract the compiled contract
  const contractName = 'PropertyRegistryERC721';
  const compiledContract = output.contracts['PropertyRegistryERC721.sol'][contractName];
  
  if (!compiledContract) {
    console.error('Contract not found in compilation output');
    process.exit(1);
  }
  
  // Create the output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../src/contracts/compiled');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save the ABI
  const abiPath = path.join(outputDir, 'PropertyRegistryERC721.abi.json');
  fs.writeFileSync(abiPath, JSON.stringify(compiledContract.abi, null, 2));
  console.log(`ABI saved to: ${abiPath}`);
  
  // Save the bytecode
  const bytecodePath = path.join(outputDir, 'PropertyRegistryERC721.bytecode.json');
  fs.writeFileSync(bytecodePath, JSON.stringify({
    bytecode: compiledContract.evm.bytecode.object,
    deployedBytecode: compiledContract.evm.deployedBytecode.object
  }, null, 2));
  console.log(`Bytecode saved to: ${bytecodePath}`);
  
  // Create a combined artifact
  const artifactPath = path.join(outputDir, 'PropertyRegistryERC721.json');
  const artifact = {
    contractName,
    abi: compiledContract.abi,
    bytecode: compiledContract.evm.bytecode.object,
    deployedBytecode: compiledContract.evm.deployedBytecode.object,
    metadata: compiledContract.metadata
  };
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log(`Artifact saved to: ${artifactPath}`);
  
  console.log('Contract compilation completed successfully!');
}

// Run the compilation
try {
  compileContract();
} catch (error) {
  console.error('Compilation failed:', error);
  process.exit(1);
} 