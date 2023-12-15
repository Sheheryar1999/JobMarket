require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_URL = "https://eth-sepolia.g.alchemy.com/v2/hNiDapUtTHk2ohcDCizxDZhiLzZmMwsI";
const PRIVATE_KEY1 = "21deede86dc7039ea1d7609a48592ceef307ba49b87f95530397f532de4d61fc"
// const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;
// const PRIVATE_KEY3 = process.env.PRIVATE_KEY3;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY1],
    },
  },
};
