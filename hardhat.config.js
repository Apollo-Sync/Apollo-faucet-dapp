require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
