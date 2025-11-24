//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);

  // Resolve EIP712 domains for KMSVerifier and InputVerifier so that
  // MockFhevmInstance internal assertions match on-chain values.
  let gatewayChainIdNum: number = 10901;
  let verifyingContractAddressInputVerification: `0x${string}` =
    "0x812b06e1CDCE800494b79fFE4f925A504a9A9810";
  let verifyingContractAddressDecryption: `0x${string}` =
    parameters.metadata.KMSVerifierAddress;

  try {
    const domainAbi = [
      "function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])",
    ];

    // KMSVerifier domain (used for decryption EIP712)
    const kmsVerifierContract = new Contract(
      parameters.metadata.KMSVerifierAddress,
      domainAbi,
      provider
    );
    const kmsDomain = await kmsVerifierContract.eip712Domain();

    // InputVerifier domain (used for encrypted input EIP712)
    const inputVerifierContract = new Contract(
      parameters.metadata.InputVerifierAddress,
      domainAbi,
      provider
    );
    const inputDomain = await inputVerifierContract.eip712Domain();

    console.log("[fhevmMockCreateInstance] KMSVerifier EIP712 domain:", kmsDomain);
    console.log(
      "[fhevmMockCreateInstance] InputVerifier EIP712 domain:",
      inputDomain
    );

    const kmsChainId = kmsDomain[3];
    const inputChainId = inputDomain[3];
    const kmsVerifying = kmsDomain[4] as `0x${string}`;
    const inputVerifying = inputDomain[4] as `0x${string}`;

    gatewayChainIdNum =
      typeof kmsChainId === "bigint" ? Number(kmsChainId) : kmsChainId;

    // Sanity check: KMS and InputVerifier should share the same gateway chainId
    const inputChainIdNum =
      typeof inputChainId === "bigint" ? Number(inputChainId) : inputChainId;
    if (gatewayChainIdNum !== inputChainIdNum) {
      console.warn(
        "[fhevmMockCreateInstance] KMSVerifier/InputVerifier chainId mismatch:",
        gatewayChainIdNum,
        inputChainIdNum
      );
    }

    verifyingContractAddressDecryption = kmsVerifying;
    verifyingContractAddressInputVerification = inputVerifying;

    console.log(
      "[fhevmMockCreateInstance] gatewayChainId:",
      gatewayChainIdNum
    );
    console.log(
      "[fhevmMockCreateInstance] verifyingContract (decryption/KMS):",
      verifyingContractAddressDecryption
    );
    console.log(
      "[fhevmMockCreateInstance] verifyingContract (input/InputVerifier):",
      verifyingContractAddressInputVerification
    );
  } catch (e) {
    console.warn(
      "[fhevmMockCreateInstance] Failed to query KMS/InputVerifier EIP712 domains, falling back to defaults:",
      e
    );
  }
  
  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: gatewayChainIdNum,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption,
      verifyingContractAddressInputVerification,
    },
    {
      // v0.3.0 requires the 4th parameter: properties
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  
  console.log("[fhevmMockCreateInstance] ✅ Mock FHEVM instance created successfully");
  console.log("[fhevmMockCreateInstance] Instance type:", typeof instance);
  
  // Log all available methods
  const instanceProto = Object.getPrototypeOf(instance);
  const methods = Object.getOwnPropertyNames(instanceProto);
  console.log("[fhevmMockCreateInstance] Instance methods:", methods);
  
  // Verify createEIP712 exists
  if (typeof (instance as any).createEIP712 === 'function') {
    console.log("[fhevmMockCreateInstance] createEIP712 method found ✓");
  } else {
    console.error("[fhevmMockCreateInstance] createEIP712 method NOT found ✗");
  }
  
  return instance as unknown as FhevmInstance;
};

