"use client";

import { useState } from "react";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

export default function VerificationPage() {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: isConnected,
  });

  const {
    healthRecordCount,
    verifyInRange,
    generateVerificationProof,
    isLoading,
    message,
    isDeployed,
  } = usePrismHealth({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [verificationForm, setVerificationForm] = useState({
    recordId: "0",
    indicatorType: "0",
    minValue: "",
    maxValue: "",
  });

  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [verificationProof, setVerificationProof] = useState<{
    proofId: number;
    timestamp: number;
    verificationType: string;
    transactionHash: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationForm.minValue || !verificationForm.maxValue) {
      alert("Please fill in min and max values");
      return;
    }

    const result = await verifyInRange(
      parseInt(verificationForm.recordId),
      parseInt(verificationForm.indicatorType),
      parseInt(verificationForm.minValue),
      parseInt(verificationForm.maxValue)
    );

    setVerificationResult(result);

    // Generate proof if verification passed
    if (result === true) {
      const proof = await generateVerificationProof(
        "range_verification",
        true
      );
      if (proof) {
        setVerificationProof(proof);
      }
    }
  };

  const indicatorTypes = [
    { value: "0", label: "Systolic Blood Pressure" },
    { value: "1", label: "Diastolic Blood Pressure" },
    { value: "2", label: "Blood Glucose" },
    { value: "3", label: "Heart Rate" },
    { value: "4", label: "Weight" },
  ];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Verification</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">Please connect your wallet to verify health data.</p>
          <button
            onClick={connect}
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Verification</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            PrismHealth contract is not deployed on this network.
          </p>
        </div>
      </div>
    );
  }

  const recordCount = healthRecordCount ? Number(healthRecordCount) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Health Verification</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Verify that your health indicators are within a normal range without revealing the exact values.
          The verification is performed on encrypted data.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Health Record ID
          </label>
          <input
            type="number"
            value={verificationForm.recordId}
            onChange={(e) =>
              setVerificationForm({ ...verificationForm, recordId: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="0"
            max={Math.max(0, recordCount - 1)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Available records: 0 to {Math.max(0, recordCount - 1)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Indicator Type
          </label>
          <select
            value={verificationForm.indicatorType}
            onChange={(e) =>
              setVerificationForm({ ...verificationForm, indicatorType: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            {indicatorTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Value
            </label>
            <input
              type="number"
              value={verificationForm.minValue}
              onChange={(e) =>
                setVerificationForm({ ...verificationForm, minValue: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Value
            </label>
            <input
              type="number"
              value={verificationForm.maxValue}
              onChange={(e) =>
                setVerificationForm({ ...verificationForm, maxValue: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("passed") || message.includes("success")
                ? "bg-green-50 text-green-800"
                : message.includes("failed") || message.includes("Failed")
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        {verificationResult !== null && (
          <div
            className={`p-4 rounded-lg ${
              verificationResult
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-semibold">
              Verification Result: {verificationResult ? "✓ PASSED" : "✗ FAILED"}
            </p>
            <p className="text-sm mt-2">
              {verificationResult
                ? "The indicator is within the specified range."
                : "The indicator is outside the specified range."}
            </p>
          </div>
        )}

        {verificationProof && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Proof</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Proof ID:</span>{" "}
                {verificationProof.proofId}
              </div>
              <div>
                <span className="font-medium">Type:</span>{" "}
                {verificationProof.verificationType}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>{" "}
                {new Date(verificationProof.timestamp * 1000).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Transaction Hash:</span>{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${verificationProof.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {verificationProof.transactionHash.slice(0, 10)}...
                </a>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || fhevmStatus !== "ready" || recordCount === 0}
          className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: designTokens.colors.light.primary[500] }}
        >
          {isLoading ? "Verifying..." : "Verify Range"}
        </button>
      </form>

      {recordCount === 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No health records available. Please add health records first.
          </p>
        </div>
      )}
    </div>
  );
}
