import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const Chat = await ethers.getContractFactory("Chat");
  const chat = await Chat.deploy();

  await chat.waitForDeployment();

  console.log("Chat deployed to:", await chat.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
