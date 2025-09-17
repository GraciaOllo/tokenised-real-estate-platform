const PropertyRegistryERC721 = artifacts.require("PropertyRegistryERC721");
const PropertyMarketplace = artifacts.require("PropertyMarketplace");

module.exports = async function(deployer) {
  try {
    console.log("🚀 Starting deployment of Property Market contracts...");
    
    // Step 1: Deploy the PropertyRegistryERC721 contract
    console.log(" Deploying PropertyRegistryERC721...");
    await deployer.deploy(PropertyRegistryERC721, "PropertyRegistry", "PROP");
    const propertyRegistry = await PropertyRegistryERC721.deployed();
    console.log("✅ PropertyRegistryERC721 deployed at:", propertyRegistry.address);

    // Step 2: Deploy the PropertyMarketplace contract
    console.log(" Deploying PropertyMarketplace...");
    await deployer.deploy(PropertyMarketplace);
    const marketplace = await PropertyMarketplace.deployed();
    console.log("✅ PropertyMarketplace deployed at:", marketplace.address);

    // Step 3: Configure marketplace with property registry address
    console.log("🔗 Configuring marketplace...");
    await marketplace.setPropertyRegistryAddress(propertyRegistry.address);
    console.log("✅ Marketplace configured with property registry");

    // Step 4: Set initial marketplace fee (2.5%)
    console.log("💰 Setting marketplace fee...");
    await marketplace.updateMarketplaceFee(250); // 250 basis points = 2.5%
    console.log("✅ Marketplace fee set to 2.5%");

    // Step 5: Save deployment information
    const deploymentInfo = {
      network: deployer.network,
      deployedAt: new Date().toISOString(),
      contracts: {
        PropertyRegistryERC721: propertyRegistry.address,
        PropertyMarketplace: marketplace.address
      },
      deployerAddress: deployer.networks[deployer.network].from
    };

    console.log("\n🎉 Property Market contracts deployed successfully!");
    console.log(" Deployment Summary:");
    console.log("   • Property Registry:", propertyRegistry.address);
    console.log("   • Property Marketplace:", marketplace.address);
    console.log("   • Marketplace Fee: 2.5%");
    
    // Save deployment info to a file for later use
    const fs = require('fs');
    const path = require('path');
    const buildDir = path.join(__dirname, '../build/contracts');
    
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(buildDir, 'deployment-info.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to build/contracts/deployment-info.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}; 