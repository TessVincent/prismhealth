"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { PrismHealthAddresses } from "@/abi/PrismHealthAddresses";
import { PrismHealthABI } from "@/abi/PrismHealthABI";

/**
 * Get PrismHealth contract configuration for a given chain ID
 * @param chainId - The chain ID to get configuration for
 * @returns Contract ABI and address information
 */
function getPrismHealthByChainId(
  chainId: number | undefined
): {
  abi: typeof PrismHealthABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
} {
  if (!chainId) {
    return { abi: PrismHealthABI.abi };
  }

  const entry =
    PrismHealthAddresses[chainId.toString() as keyof typeof PrismHealthAddresses];

  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: PrismHealthABI.abi, chainId };
  }

  return {
    address: entry.address as `0x${string}`,
    chainId: entry.chainId,
    chainName: entry.chainName,
    abi: PrismHealthABI.abi,
  };
}

export const usePrismHealth = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [healthRecordCount, setHealthRecordCount] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const contractRef = useRef<{
    abi: typeof PrismHealthABI.abi;
    address?: `0x${string}`;
    chainId?: number;
    chainName?: string;
  } | undefined>(undefined);

  const contract = useMemo(() => {
    const c = getPrismHealthByChainId(chainId);
    contractRef.current = c;
    if (!c.address) {
      setMessage(`PrismHealth deployment not found for chainId=${chainId}.`);
    }
    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    return Boolean(contract.address && contract.address !== ethers.ZeroAddress);
  }, [contract.address]);

  const refreshRecordCount = useCallback(async () => {
    if (!contract.address || !ethersReadonlyProvider || !sameChain.current(chainId)) {
      return;
    }

    try {
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        ethersReadonlyProvider
      );
      const count = await contractInstance.getHealthRecordCount();
      setHealthRecordCount(count);
    } catch (e) {
      setMessage(`Failed to get health record count: ${e}`);
    }
  }, [contract.address, contract.abi, ethersReadonlyProvider, chainId, sameChain]);

  useEffect(() => {
    if (isDeployed) {
      refreshRecordCount();
    }
  }, [isDeployed, refreshRecordCount]);

  const addHealthRecord = useCallback(
    async (data: {
      systolicBP: number;
      diastolicBP: number;
      bloodGlucose: number;
      heartRate: number;
      weight: number;
    }) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        setMessage("Missing required parameters for adding health record");
        return;
      }

      setIsLoading(true);
      setMessage("Encrypting health data...");

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersSigner
        );

        const input = instance.createEncryptedInput(
          contract.address,
          ethersSigner.address
        );

        input.add16(data.systolicBP);
        input.add16(data.diastolicBP);
        input.add16(data.bloodGlucose);
        input.add16(data.heartRate);
        input.add16(data.weight);

        setMessage("Encrypting...");
        const enc = await input.encrypt();

        if (
          !sameChain.current(chainId) ||
          !sameSigner.current(ethersSigner)
        ) {
          setMessage("Transaction cancelled");
          return;
        }

        setMessage("Submitting transaction...");
        const tx = await contractInstance.addHealthRecord(
          enc.handles[0],
          enc.inputProof,
          enc.handles[1],
          enc.inputProof,
          enc.handles[2],
          enc.inputProof,
          enc.handles[3],
          enc.inputProof,
          enc.handles[4],
          enc.inputProof
        );

        setMessage(`Waiting for transaction: ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Health record added successfully!");
          await refreshRecordCount();
        } else {
          setMessage("Transaction failed");
        }
      } catch (e: any) {
        setMessage(`Failed to add health record: ${e?.message || e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      contract.abi,
      instance,
      ethersSigner,
      chainId,
      refreshRecordCount,
      sameChain,
      sameSigner,
    ]
  );

  const getHealthRecord = useCallback(
    async (recordId: number) => {
      if (!contract.address || !ethersReadonlyProvider || !sameChain.current(chainId)) {
        return null;
      }

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersReadonlyProvider
        );
        const record = await contractInstance.getHealthRecord(recordId);
        return record;
      } catch (e) {
        setMessage(`Failed to get health record: ${e}`);
        return null;
      }
    },
    [contract.address, contract.abi, ethersReadonlyProvider, chainId, sameChain]
  );

  const decryptHealthRecord = useCallback(
    async (recordId: number) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        return null;
      }

      setIsLoading(true);
      setMessage("Decrypting health record...");

      try {
        const record = await getHealthRecord(recordId);
        if (!record) {
          return null;
        }

        if (!instance) {
          setMessage("FHEVM instance not ready. Please ensure wallet is connected and try again.");
          return null;
        }

        if (!ethersSigner) {
          setMessage("Signer not available. Please ensure wallet is connected.");
          return null;
        }

        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          setMessage("Failed to generate decryption signature. Check browser console for details.");
          console.error("[decryptHealthRecord] Failed to generate decryption signature");
          console.error("[decryptHealthRecord] Instance:", instance);
          console.error("[decryptHealthRecord] Contract address:", contract.address);
          return null;
        }

        setMessage("Decrypting...");
        const decrypted = await instance.userDecrypt(
          [
            { handle: record.systolicBP, contractAddress: contract.address },
            { handle: record.diastolicBP, contractAddress: contract.address },
            { handle: record.bloodGlucose, contractAddress: contract.address },
            { handle: record.heartRate, contractAddress: contract.address },
            { handle: record.weight, contractAddress: contract.address },
          ],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const systolicBP = (decrypted as any)[record.systolicBP as string] ?? (decrypted as any)[record.systolicBP as any];
        const diastolicBP = (decrypted as any)[record.diastolicBP as string] ?? (decrypted as any)[record.diastolicBP as any];
        const bloodGlucose = (decrypted as any)[record.bloodGlucose as string] ?? (decrypted as any)[record.bloodGlucose as any];
        const heartRate = (decrypted as any)[record.heartRate as string] ?? (decrypted as any)[record.heartRate as any];
        const weight = (decrypted as any)[record.weight as string] ?? (decrypted as any)[record.weight as any];

        return {
          timestamp: Number(record.timestamp),
          systolicBP: Number(systolicBP),
          diastolicBP: Number(diastolicBP),
          bloodGlucose: Number(bloodGlucose),
          heartRate: Number(heartRate),
          weight: Number(weight),
        };
      } catch (e: any) {
        setMessage(`Failed to decrypt: ${e?.message || e}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      instance,
      ethersSigner,
      chainId,
      getHealthRecord,
      fhevmDecryptionSignatureStorage,
      sameChain,
      sameSigner,
    ]
  );

  const calculateHealthScore = useCallback(async () => {
    if (
      !contract.address ||
      !instance ||
      !ethersSigner ||
      !sameChain.current(chainId) ||
      !sameSigner.current(ethersSigner)
    ) {
      setMessage("Missing required parameters");
      return null;
    }

    setIsLoading(true);
    setMessage("Calculating health score...");

    try {
      const contractInstance = new ethers.Contract(
        contract.address,
        contract.abi,
        ethersSigner
      );

      setMessage("Calling storeHealthScore...");
      const storeTx = await contractInstance.storeHealthScore();
      await storeTx.wait();

      setMessage("Getting health score handles...");
      const score = await contractInstance.getHealthScore();

      // All score fields are encrypted (euint8), we need to decrypt them
      const handles = [
        { handle: score.totalScore, contractAddress: contract.address },
        { handle: score.cardiovascular, contractAddress: contract.address },
        { handle: score.metabolic, contractAddress: contract.address },
        { handle: score.exercise, contractAddress: contract.address },
        { handle: score.medication, contractAddress: contract.address },
        { handle: score.riskLevel, contractAddress: contract.address },
      ];

      setMessage("Generating decryption signature...");
      
      if (!instance) {
        setMessage("FHEVM instance not ready. Please ensure wallet is connected and try again.");
        return null;
      }

      if (!ethersSigner) {
        setMessage("Signer not available. Please ensure wallet is connected.");
        return null;
      }

      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contract.address],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        setMessage("Failed to generate decryption signature. Check browser console for details.");
        console.error("[calculateHealthScore] Failed to generate decryption signature");
        console.error("[calculateHealthScore] Instance:", instance);
        console.error("[calculateHealthScore] Contract address:", contract.address);
        return null;
      }

      setMessage("Decrypting health score values...");
      const decrypted = await instance.userDecrypt(
        handles,
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      // Debug: log decrypted values
      console.log("Decrypted values:", decrypted);
      console.log("Score handles:", {
        totalScore: score.totalScore,
        cardiovascular: score.cardiovascular,
        metabolic: score.metabolic,
        exercise: score.exercise,
        medication: score.medication,
        riskLevel: score.riskLevel,
      });

      // Try multiple ways to access decrypted values
      const getDecryptedValue = (handle: any): any => {
        const decryptedAny = decrypted as any;
        // Try as string key
        if (typeof handle === 'string' && decryptedAny[handle] !== undefined) {
          return decryptedAny[handle];
        }
        // Try as hex string (lowercase)
        const handleLower = typeof handle === 'string' ? handle.toLowerCase() : handle;
        if (decryptedAny[handleLower] !== undefined) {
          return decryptedAny[handleLower];
        }
        // Try all keys
        for (const key in decryptedAny) {
          if (key.toLowerCase() === (typeof handle === 'string' ? handle.toLowerCase() : String(handle).toLowerCase())) {
            return decryptedAny[key];
          }
        }
        // Try direct access
        return decryptedAny[handle as any] ?? null;
      };

      const totalScoreValue = getDecryptedValue(score.totalScore);
      const cardiovascularValue = getDecryptedValue(score.cardiovascular);
      const metabolicValue = getDecryptedValue(score.metabolic);
      const exerciseValue = getDecryptedValue(score.exercise);
      const medicationValue = getDecryptedValue(score.medication);
      const riskLevelValue = getDecryptedValue(score.riskLevel);

      console.log("Extracted values:", {
        totalScore: totalScoreValue,
        cardiovascular: cardiovascularValue,
        metabolic: metabolicValue,
        exercise: exerciseValue,
        medication: medicationValue,
        riskLevel: riskLevelValue,
      });

      setMessage("Health score calculated successfully!");

      return {
        timestamp: Number(score.timestamp),
        totalScore: totalScoreValue,
        cardiovascular: cardiovascularValue,
        metabolic: metabolicValue,
        exercise: exerciseValue,
        medication: medicationValue,
        riskLevel: riskLevelValue,
      };
    } catch (e: any) {
      setMessage(`Failed to calculate health score: ${e?.message || e}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    contract.address,
    contract.abi,
    instance,
    ethersSigner,
    chainId,
    fhevmDecryptionSignatureStorage,
    sameChain,
    sameSigner,
  ]);

  const verifyInRange = useCallback(
    async (
      recordId: number,
      indicatorType: number,
      minValue: number,
      maxValue: number
    ) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        return null;
      }

      setIsLoading(true);
      setMessage("Verifying range...");

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersSigner
        );

        const input = instance.createEncryptedInput(
          contract.address,
          ethersSigner.address
        );

        input.add16(minValue);
        input.add16(maxValue);

        const enc = await input.encrypt();

        setMessage("Calling verifyInRange...");
        // IMPORTANT: In FHEVM, when a function returns an encrypted value, we need to:
        // 1. Send a REAL transaction (not staticCall) because FHE.allow() only executes in real transactions
        // 2. The transaction will authorize the return value's handle
        // 3. In Hardhat tests, calling the function directly returns the handle that was authorized
        // 4. In ethers.js, we need to use .then() or await the promise to get the return value
        // 
        // However, ethers.js v6 doesn't return values from non-view functions directly.
        // We need to call the function and extract the return value from the transaction.
        // But FHE operations are deterministic only if we use the same inputs, so we can
        // use staticCall after the transaction to get the same handle (if the inputs are the same).
        
        // However, there's a problem: FHE operations might create new handles even with same inputs
        // if there's any randomness or state involved. So we need to get the handle from the transaction itself.
        
        // In Hardhat with FHEVM plugin, calling a function directly returns the value:
        // const result = await contract.verifyInRange(...);
        // This works because Hardhat's FHEVM plugin intercepts the call.
        
        // In frontend with ethers.js, we need a different approach:
        // Option 1: Use staticCall (but this creates a NEW handle, not the authorized one)
        // Option 2: Extract return value from transaction (ethers.js doesn't support this directly)
        // Option 3: Call the function and wait, then use the return value from the promise
        
        // Let's try Option 3: In some cases, ethers.js might return the value if we await the transaction promise
        setMessage("Sending verification transaction...");
        
        // Send the transaction and try to get return value
        // Note: In ethers.js v6, calling a non-view function returns a TransactionResponse
        // But we can try to get the return value by calling it as a promise
        const txPromise = contractInstance.verifyInRange(
          recordId,
          indicatorType,
          enc.handles[0],
          enc.inputProof,
          enc.handles[1],
          enc.inputProof
        );
        
        // Wait for transaction to complete
        const tx = await txPromise;
        setMessage("Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        
        if (!receipt || receipt.status !== 1) {
          setMessage("Transaction failed");
          return null;
        }
        
        // Extract the authorized handle from the transaction event logs
        // The contract emits VerificationResult event with the resultHandle
        setMessage("Extracting result handle from transaction logs...");
        let resultHandle: any = null;
        
        // Find the VerificationResult event in the transaction logs
        if (receipt.logs && receipt.logs.length > 0) {
          const verificationResultTopic = ethers.id("VerificationResult(address,uint256,uint8,bytes32)");
          
          for (const log of receipt.logs) {
            if (log.topics && log.topics[0] === verificationResultTopic) {
              // Decode the event data
              // Event signature: VerificationResult(address indexed user, uint256 indexed recordId, uint8 indicatorType, bytes32 resultHandle)
              // Topics: [event signature, user (indexed), recordId (indexed)]
              // Data: [indicatorType (uint8), resultHandle (bytes32)]
              try {
                const decodedLog = contractInstance.interface.parseLog({
                  topics: log.topics as string[],
                  data: log.data
                });
                
                if (decodedLog && decodedLog.name === "VerificationResult") {
                  // The resultHandle is the last argument (bytes32)
                  resultHandle = decodedLog.args[3]; // resultHandle is the 4th argument (0-indexed: 3)
                  console.log('Extracted handle from event:', resultHandle);
                  break;
                }
              } catch (decodeError) {
                console.warn('Failed to decode event log:', decodeError);
              }
            }
          }
        }
        
        // Fallback: If we couldn't extract from event, try staticCall
        // This should work if FHE operations are deterministic
        if (!resultHandle) {
          console.warn('Could not extract handle from event, trying staticCall as fallback...');
          try {
            resultHandle = await contractInstance.verifyInRange.staticCall(
              recordId,
              indicatorType,
              enc.handles[0],
              enc.inputProof,
              enc.handles[1],
              enc.inputProof
            );
            console.log('Got result handle via staticCall (fallback):', resultHandle);
          } catch (staticCallError: any) {
            setMessage(`Failed to get result: ${staticCallError?.message || staticCallError}`);
            console.error('staticCall failed:', staticCallError);
            return null;
          }
        }
        
        if (!resultHandle) {
          setMessage("Failed to get result handle from transaction");
          return null;
        }

        // Debug: log the raw resultHandle
        console.log('Raw resultHandle:', resultHandle, 'type:', typeof resultHandle);
        
        // Ensure resultHandle is a string
        // Handle might be returned as bytes32, string, or other format
        let handleString: string;
        if (typeof resultHandle === 'string') {
          handleString = resultHandle;
        } else if (resultHandle && typeof resultHandle === 'object') {
          // If it's a BigNumber or similar, convert to hex string
          if ('toHexString' in resultHandle && typeof resultHandle.toHexString === 'function') {
            handleString = resultHandle.toHexString();
          } else if ('toString' in resultHandle && typeof resultHandle.toString === 'function') {
            // Try hex conversion (base 16)
            try {
              const hexStr = resultHandle.toString(16);
              handleString = hexStr.startsWith('0x') ? hexStr : '0x' + hexStr;
            } catch {
              handleString = String(resultHandle);
            }
          } else {
            // Try JSON.stringify to see what we have
            console.warn('Unknown object type:', JSON.stringify(resultHandle));
            handleString = String(resultHandle);
          }
        } else if (resultHandle === null || resultHandle === undefined) {
          setMessage('Result handle is null or undefined');
          console.error('Result handle is null or undefined');
          return null;
        } else {
          handleString = String(resultHandle);
        }

        console.log('Converted handleString (before normalization):', handleString, 'length:', handleString.length);

        // Normalize handle format (ensure it starts with 0x and is 66 chars)
        if (!handleString.startsWith('0x')) {
          handleString = '0x' + handleString.replace(/^0x/, '');
        }
        
        // Remove any whitespace
        handleString = handleString.trim();
        
        // Pad to 66 characters (0x + 64 hex chars)
        // FHEVM handles are exactly 66 characters: 0x + 64 hex digits
        if (handleString.length < 66) {
          // Pad with zeros on the LEFT (after 0x)
          const hexPart = handleString.slice(2);
          handleString = '0x' + hexPart.padStart(64, '0');
        } else if (handleString.length > 66) {
          // Truncate to 66 characters (keep 0x prefix)
          handleString = handleString.slice(0, 66);
        }

        console.log('Normalized handleString:', handleString, 'length:', handleString.length);

        // Validate handle format - FHEVM handles should be 66 chars (0x + 64 hex)
        if (!handleString || handleString.length !== 66 || !handleString.startsWith('0x')) {
          setMessage(`Invalid handle format: ${handleString} (length: ${handleString.length})`);
          console.error('Invalid handle format:', handleString);
          console.error('Raw resultHandle:', resultHandle);
          return null;
        }
        
        // Additional validation: check if handle looks like a valid FHEVM handle
        // Valid handles should have specific patterns, not all zeros in the middle
        if (handleString === '0x' + '0'.repeat(64)) {
          setMessage(`Invalid handle: all zeros`);
          console.error('Invalid handle: all zeros');
          return null;
        }
        
        // Check if handle looks suspicious (like the one in the error)
        if (handleString.includes('000bec0000000c')) {
          console.warn('Suspicious handle pattern detected:', handleString);
          // This might be a formatting issue, but let's continue and see what happens
        }

        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          setMessage("Failed to generate decryption signature. Check browser console for details.");
          console.error("[verifyInRange] Failed to generate decryption signature");
          console.error("[verifyInRange] Instance:", instance);
          console.error("[verifyInRange] Contract address:", contract.address);
          return null;
        }

        setMessage("Decrypting verification result...");
        
        // Decrypt the ebool result
        // For ebool, userDecrypt should return a boolean value
        const decrypted = await instance.userDecrypt(
          [{ handle: handleString, contractAddress: contract.address }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        // Extract the decrypted boolean value
        // The handle might be used as a key in different formats
        const decryptedAny = decrypted as any;
        const resultValue = decryptedAny[handleString] 
          ?? decryptedAny[handleString.toLowerCase()]
          ?? decryptedAny[handleString.toUpperCase()]
          ?? Object.values(decryptedAny)[0];

        // For ebool, the decrypted value should be 0n (false) or 1n (true)
        const isInRange = resultValue !== undefined && resultValue !== null && resultValue !== BigInt(0) && resultValue !== 0;
        setMessage(isInRange ? "Verification passed!" : "Verification failed");

        return isInRange;
      } catch (e: any) {
        setMessage(`Verification failed: ${e?.message || e}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      contract.abi,
      instance,
      ethersSigner,
      chainId,
      fhevmDecryptionSignatureStorage,
      sameChain,
      sameSigner,
    ]
  );

  const addMedicationRecord = useCallback(
    async (data: {
      name: string;
      dosage: number;
      frequency: number;
      startDate: number;
      endDate: number;
    }) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        setMessage("Missing required parameters for adding medication record");
        return;
      }

      setIsLoading(true);
      setMessage("Encrypting medication data...");

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersSigner
        );

        const input = instance.createEncryptedInput(
          contract.address,
          ethersSigner.address
        );

        input.add16(data.dosage);
        input.add8(data.frequency);

        setMessage("Encrypting...");
        const enc = await input.encrypt();

        if (
          !sameChain.current(chainId) ||
          !sameSigner.current(ethersSigner)
        ) {
          setMessage("Transaction cancelled");
          return;
        }

        setMessage("Submitting transaction...");
        const tx = await contractInstance.addMedicationRecord(
          data.name,
          enc.handles[0],
          enc.inputProof,
          enc.handles[1],
          enc.inputProof,
          data.startDate,
          data.endDate
        );

        setMessage(`Waiting for transaction: ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Medication record added successfully!");
        } else {
          setMessage("Transaction failed");
        }
      } catch (e: any) {
        setMessage(`Failed to add medication record: ${e?.message || e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      contract.abi,
      instance,
      ethersSigner,
      chainId,
      sameChain,
      sameSigner,
    ]
  );

  const addExerciseRecord = useCallback(
    async (data: {
      exerciseType: string;
      duration: number;
      calories: number;
    }) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        setMessage("Missing required parameters for adding exercise record");
        return;
      }

      setIsLoading(true);
      setMessage("Encrypting exercise data...");

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersSigner
        );

        const input = instance.createEncryptedInput(
          contract.address,
          ethersSigner.address
        );

        input.add16(data.duration);
        input.add16(data.calories);

        setMessage("Encrypting...");
        const enc = await input.encrypt();

        if (
          !sameChain.current(chainId) ||
          !sameSigner.current(ethersSigner)
        ) {
          setMessage("Transaction cancelled");
          return;
        }

        setMessage("Submitting transaction...");
        const tx = await contractInstance.addExerciseRecord(
          data.exerciseType,
          enc.handles[0],
          enc.inputProof,
          enc.handles[1],
          enc.inputProof
        );

        setMessage(`Waiting for transaction: ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Exercise record added successfully!");
        } else {
          setMessage("Transaction failed");
        }
      } catch (e: any) {
        setMessage(`Failed to add exercise record: ${e?.message || e}`);
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      contract.abi,
      instance,
      ethersSigner,
      chainId,
      sameChain,
      sameSigner,
    ]
  );

  const generateVerificationProof = useCallback(
    async (verificationType: string, result: boolean) => {
      if (
        !contract.address ||
        !instance ||
        !ethersSigner ||
        !sameChain.current(chainId) ||
        !sameSigner.current(ethersSigner)
      ) {
        return null;
      }

      setIsLoading(true);
      setMessage("Generating verification proof...");

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          ethersSigner
        );

        // Create encrypted boolean
        const input = instance.createEncryptedInput(
          contract.address,
          ethersSigner.address
        );
        input.addBool(result);
        const enc = await input.encrypt();

        setMessage("Calling generateVerificationProof...");
        const tx = await contractInstance.generateVerificationProof(
          verificationType,
          enc.handles[0]
        );

        await tx.wait();

        const proofId = await contractInstance.getVerificationProofCount();
        const proof = await contractInstance.getVerificationProof(
          Number(proofId) - 1
        );

        setMessage("Verification proof generated successfully!");

        return {
          proofId: Number(proofId) - 1,
          timestamp: Number(proof.timestamp),
          verificationType: proof.verificationType,
          transactionHash: tx.hash,
        };
      } catch (e: any) {
        setMessage(`Failed to generate proof: ${e?.message || e}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract.address,
      contract.abi,
      instance,
      ethersSigner,
      chainId,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: contract.address,
    isDeployed,
    healthRecordCount,
    isLoading,
    message,
    addHealthRecord,
    getHealthRecord,
    decryptHealthRecord,
    calculateHealthScore,
    verifyInRange,
    refreshRecordCount,
    addMedicationRecord,
    addExerciseRecord,
    generateVerificationProof,
  };
};

