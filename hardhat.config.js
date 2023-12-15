require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;
const PRIVATE_KEY3 = process.env.PRIVATE_KEY3;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY1,PRIVATE_KEY2, PRIVATE_KEY3],
    },
  },
};
