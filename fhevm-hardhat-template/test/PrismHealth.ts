import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrismHealth, PrismHealth__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrismHealth")) as PrismHealth__factory;
  const contract = (await factory.deploy()) as PrismHealth;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrismHealth", function () {
  let signers: Signers;
  let contract: PrismHealth;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should add a health record", async function () {
    const systolicBP = 130;
    const diastolicBP = 85;
    const bloodGlucose = 90;
    const heartRate = 72;
    const weight = 70;

    // Encrypt all values
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(systolicBP)
      .add16(diastolicBP)
      .add16(bloodGlucose)
      .add16(heartRate)
      .add16(weight)
      .encrypt();

    const tx = await contract
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

    const recordCount = await contract.connect(signers.alice).getHealthRecordCount();
    expect(recordCount).to.eq(1n);

    const record = await contract.connect(signers.alice).getHealthRecord(0);
    expect(record.timestamp).to.be.gt(0);

    // Decrypt and verify values
    const decryptedSystolic = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      record.systolicBP,
      contractAddress,
      signers.alice
    );
    expect(decryptedSystolic).to.eq(systolicBP);

    const decryptedDiastolic = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      record.diastolicBP,
      contractAddress,
      signers.alice
    );
    expect(decryptedDiastolic).to.eq(diastolicBP);
  });

  it("should add a medication record", async function () {
    const dosage = 100; // mg
    const frequency = 2; // times per day

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(dosage)
      .add8(frequency)
      .encrypt();

    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later

    const tx = await contract
      .connect(signers.alice)
      .addMedicationRecord(
        "Aspirin",
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        startDate,
        endDate
      );
    await tx.wait();

    const record = await contract.connect(signers.alice).getMedicationRecord(0);
    expect(record.name).to.eq("Aspirin");
    expect(record.startDate).to.eq(startDate);
    expect(record.endDate).to.eq(endDate);

    const decryptedDosage = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      record.dosage,
      contractAddress,
      signers.alice
    );
    expect(decryptedDosage).to.eq(dosage);
  });

  it("should add an exercise record", async function () {
    const duration = 30; // minutes
    const calories = 200; // kcal

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(duration)
      .add16(calories)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .addExerciseRecord(
        "Running",
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        encryptedInput.handles[1],
        encryptedInput.inputProof
      );
    await tx.wait();

    const record = await contract.connect(signers.alice).getExerciseRecord(0);
    expect(record.exerciseType).to.eq("Running");

    const decryptedDuration = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      record.duration,
      contractAddress,
      signers.alice
    );
    expect(decryptedDuration).to.eq(duration);
  });

  it("should calculate health score", async function () {
    // First add a health record
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(130) // systolicBP
      .add16(85)  // diastolicBP
      .add16(90)  // bloodGlucose
      .add16(72)  // heartRate
      .add16(70)  // weight
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
  });

  it("should verify indicator in range", async function () {
    // Add a health record first
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(130) // systolicBP
      .add16(85)  // diastolicBP
      .add16(90)  // bloodGlucose
      .add16(72)  // heartRate
      .add16(70)  // weight
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

    // Verify systolic BP is in range (120-140)
    const minValue = 120;
    const maxValue = 140;
    const encryptedRange = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(minValue)
      .add16(maxValue)
      .encrypt();

    const result = await contract
      .connect(signers.alice)
      .verifyInRange(
        0, // recordId
        0, // indicatorType: 0 = systolicBP
        encryptedRange.handles[0],
        encryptedRange.inputProof,
        encryptedRange.handles[1],
        encryptedRange.inputProof
      );

    // Decrypt result
    const decryptedResult = await fhevm.userDecryptEbool(
      result,
      contractAddress,
      signers.alice
    );

    // 130 is between 120 and 140, so result should be true
    expect(decryptedResult).to.be.true;
  });

  it("should delete a health record", async function () {
    // Add a health record
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(130)
      .add16(85)
      .add16(90)
      .add16(72)
      .add16(70)
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

    // Delete the record
    tx = await contract.connect(signers.alice).deleteHealthRecord(0);
    await tx.wait();

    // Try to get deleted record should revert
    await expect(contract.connect(signers.alice).getHealthRecord(0)).to.be.revertedWith("Record deleted");
  });

  it("should generate verification proof", async function () {
    // Calculate health score first
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(130)
      .add16(85)
      .add16(90)
      .add16(72)
      .add16(70)
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

    tx = await contract.connect(signers.alice).storeHealthScore();
    await tx.wait();

    // Create a verification result (true) - use ebool
    // For this test, we'll use a simple approach: verify in range first to get an ebool
    const encryptedRange = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add16(120)
      .add16(140)
      .encrypt();

    const verificationResult = await contract
      .connect(signers.alice)
      .verifyInRange(
        0,
        0, // systolicBP
        encryptedRange.handles[0],
        encryptedRange.inputProof,
        encryptedRange.handles[1],
        encryptedRange.inputProof
      );

    // Generate proof with the verification result
    tx = await contract
      .connect(signers.alice)
      .generateVerificationProof("insurance", verificationResult);
    await tx.wait();

    const proofCount = await contract.connect(signers.alice).getVerificationProofCount();
    expect(proofCount).to.eq(1n);
  });
});

