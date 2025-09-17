const PropertyMarketplace = artifacts.require("PropertyMarketplace");
const PropertyRegistryERC721 = artifacts.require("PropertyRegistryERC721");

module.exports = async function (deployer) {
  await deployer.deploy(PropertyMarketplace);
  const marketplace = await PropertyMarketplace.deployed();

  const registry = await PropertyRegistryERC721.deployed();

  // Set the registry address inside the marketplace
  await marketplace.setPropertyRegistryAddress(registry.address);

  console.log("✅ PropertyMarketplace deployed successfully!");
  console.log("📍 Contract address:", marketplace.address);
  console.log("🔗 Linked with PropertyRegistryERC721 at:", registry.address);
};
