import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPrismHealth = await deploy("PrismHealth", {
    from: deployer,
    log: true,
  });

  console.log(`PrismHealth contract: `, deployedPrismHealth.address);
};
export default func;
func.id = "deploy_prismHealth"; // id required to prevent reexecution
func.tags = ["PrismHealth"];


