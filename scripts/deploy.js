async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // ────────────────────────────────────────────────
  // 1. Deploy ApolloToken (APT) - giữ nguyên như cũ
  // ────────────────────────────────────────────────
  const ApolloToken = await ethers.getContractFactory("ApolloToken");
  const aptToken = await ApolloToken.deploy();
  await aptToken.waitForDeployment();
  console.log("ApolloToken (APT) deployed to:", aptToken.target);

  // Deploy TokenFaucet cho APT
  const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
  const aptFaucet = await TokenFaucet.deploy(aptToken.target);
  await aptFaucet.waitForDeployment();
  console.log("TokenFaucet (APT) deployed to:", aptFaucet.target);

  // Mint và nạp token vào faucet APT (10.000 APT)
  await aptToken.mint(deployer.address, ethers.parseEther("10000"));
  await aptToken.transfer(aptFaucet.target, ethers.parseEther("10000"));
  console.log("Funded APT faucet with 10,000 APT");

  // ────────────────────────────────────────────────
  // 2. Deploy APXToken
  // ────────────────────────────────────────────────
  const APXToken = await ethers.getContractFactory("APXToken");
  const apxToken = await APXToken.deploy();
  await apxToken.waitForDeployment();
  console.log("APXToken deployed to:", apxToken.target);

  // Deploy APXFaucet cho APX
  const APXFaucet = await ethers.getContractFactory("APXFaucet");
  const apxFaucet = await APXFaucet.deploy(apxToken.target);
  await apxFaucet.waitForDeployment();
  console.log("APXFaucet deployed to:", apxFaucet.target);

  // Mint và nạp token vào faucet APX (10.000 APX)
  await apxToken.mint(deployer.address, ethers.parseEther("10000"));
  await apxToken.transfer(apxFaucet.target, ethers.parseEther("10000"));
  console.log("Funded APX faucet with 10,000 APX");

  console.log("\nDeployment completed!");
  console.log("Summary:");
  console.log("- APT Token     :", aptToken.target);
  console.log("- APT Faucet    :", aptFaucet.target);
  console.log("- APX Token     :", apxToken.target);
  console.log("- APX Faucet    :", apxFaucet.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
