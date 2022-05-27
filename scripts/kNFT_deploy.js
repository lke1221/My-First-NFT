const { ethers } = require("hardhat");

async function main() {
    const KeyNFT = await ethers.getContractFactory("KeyNFT")
  
    // Start deployment, returning a promise that resolves to a contract object
    const myNFT = await KeyNFT.deploy()
    await myNFT.deployed()
    console.log("Contract deployed to address:", myNFT.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })