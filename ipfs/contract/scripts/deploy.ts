import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const IpfsActivity = await ethers.getContractFactory("IpfsActivity");
  const ipfsActivity = await IpfsActivity.deploy();

  await ipfsActivity.waitForDeployment();

  console.log("IpfsActivity deployed to:", await ipfsActivity.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
