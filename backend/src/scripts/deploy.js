const hre = require("hardhat");

async function main() {
const GreenToken = await hre.ethers.getContractFactory("GreenToken");
const green = await GreenToken.deploy("Green Property", "GRN", 100000);
await green.deployed();
console.log(`Deployed to: ${green.address}`);
}

main();
Run: