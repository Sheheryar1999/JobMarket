require('dotenv').config()
const hre = require("hardhat");

async function main() {

  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy();

  await market.waitForDeployment();

  console.log("Deployed address: ", `${market.target}`);

  // const market = await hre.ethers.deployContract("Market");
  // await market.waitForDeployment();

  // console.log("deployed address: ", '${market.address}' );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


