import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrismHealth, PrismHealth__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrismHealth")) as PrismHealth__factory;
  const contract = (await factory.deploy()) as PrismHealth;
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress };
}

describe("PrismHealth Debug", function () {
  let signers: Signers;
  let contract: PrismHealth;
  let contractAddress: string;

  before(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  it("should calculate and decrypt health score", async function () {
    // Add health record with user's actual data
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(120) // systolicBP
      .add16(90)  // diastolicBP
      .add16(60)  // bloodGlucose
      .add16(75)  // heartRate
      .add16(65)  // weight
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addHealthRecord(
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        encryptedInput.handles[2],
        encryptedInput.inputProof,
        encryptedInput.handles[3],
        encryptedInput.inputProof,
        encryptedInput.handles[4],
        encryptedInput.inputProof
      );
    await tx.wait();

    // Calculate and store health score
    tx = await contract.connect(signers.alice).storeHealthScore();
    await tx.wait();

    const score = await contract.connect(signers.alice).getHealthScore();
    expect(score.timestamp).to.be.gt(0);

    // Decrypt scores
    const totalScore = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      score.totalScore,
      contractAddress,
      signers.alice
    );
    const cardiovascular = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      score.cardiovascular,
      contractAddress,
      signers.alice
    );
    const metabolic = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      score.metabolic,
      contractAddress,
      signers.alice
    );

    console.log("Decrypted scores:");
    console.log("  Total Score:", totalScore.toString());
    console.log("  Cardiovascular:", cardiovascular.toString());
    console.log("  Metabolic:", metabolic.toString());

    // Should have non-zero scores
    expect(Number(totalScore)).to.be.gt(0);
    expect(Number(cardiovascular)).to.be.gt(0);
    expect(Number(metabolic)).to.be.gt(0);
  });
});
