const PropertyTokenERC20 = artifacts.require("PropertyTokenERC20");

module.exports = function (deployer) {
  // Example parameters (replace with real property data)
  const name = "SunsetVillaToken";
  const symbol = "SVT";
  const propertyId = "PROP-001";
  const propertyValuation = web3.utils.toWei("1000000", "ether"); // $1,000,000 in wei
  const totalShares = web3.utils.toWei("100000", "ether");        // 100,000 shares
  const sharePrice = web3.utils.toWei("10", "ether");             // Share price: 10 tokens

  deployer.deploy(
    PropertyTokenERC20,
    name,
    symbol,
    propertyId,
    propertyValuation,
    totalShares,
    sharePrice
  )
  .then(() => {
    console.log("✅ PropertyTokenERC20 deployed successfully!");
    console.log("📍 Contract address:", PropertyTokenERC20.address);
  })
  .catch(error => {
    console.error("❌ Deployment failed:", error);
  });
};
