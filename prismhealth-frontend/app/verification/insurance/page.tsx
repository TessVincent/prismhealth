"use client";

import { useState } from "react";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

export default function InsurancePage() {
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

  const [insuranceForm, setInsuranceForm] = useState({
    recordId: "0",
    systolicMin: "90",
    systolicMax: "140",
    diastolicMin: "60",
    diastolicMax: "90",
  });

  const [verificationResult, setVerificationResult] = useState<{
    systolicPassed: boolean | null;
    diastolicPassed: boolean | null;
    proof: {
      proofId: number;
      timestamp: number;
      verificationType: string;
      transactionHash: string;
    } | null;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !isDeployed) {
      return;
    }

    const systolicResult = await verifyInRange(
      parseInt(insuranceForm.recordId),
      0, // Systolic BP
      parseInt(insuranceForm.systolicMin),
      parseInt(insuranceForm.systolicMax)
    );

    const diastolicResult = await verifyInRange(
      parseInt(insuranceForm.recordId),
      1, // Diastolic BP
      parseInt(insuranceForm.diastolicMin),
      parseInt(insuranceForm.diastolicMax)
    );

    if (systolicResult === true && diastolicResult === true) {
      const proof = await generateVerificationProof("insurance", true);
      setVerificationResult({
        systolicPassed: systolicResult,
        diastolicPassed: diastolicResult,
        proof: proof || null,
      });
    } else {
      setVerificationResult({
        systolicPassed: systolicResult,
        diastolicPassed: diastolicResult,
        proof: null,
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Insurance Application</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">Please connect your wallet to verify health data for insurance.</p>
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
        <h1 className="text-3xl font-bold mb-6">Insurance Application</h1>
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Insurance Health Verification</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Verify your blood pressure meets insurance requirements without revealing exact values.
          This verification proves your health indicators are within acceptable ranges for insurance eligibility.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Health Record ID
          </label>
          <input
            type="number"
            value={insuranceForm.recordId}
            onChange={(e) =>
              setInsuranceForm({ ...insuranceForm, recordId: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="0"
            max={Math.max(0, recordCount - 1)}
          />
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Blood Pressure Requirements</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Systolic BP Range (mmHg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={insuranceForm.systolicMin}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, systolicMin: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Min"
                />
                <span className="self-center">-</span>
                <input
                  type="number"
                  value={insuranceForm.systolicMax}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, systolicMax: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Diastolic BP Range (mmHg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={insuranceForm.diastolicMin}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, diastolicMin: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Min"
                />
                <span className="self-center">-</span>
                <input
                  type="number"
                  value={insuranceForm.diastolicMax}
                  onChange={(e) =>
                    setInsuranceForm({ ...insuranceForm, diastolicMax: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>
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

        {verificationResult && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                verificationResult.systolicPassed && verificationResult.diastolicPassed
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-semibold mb-2">Verification Results:</p>
              <div className="space-y-1 text-sm">
                <p>
                  Systolic BP:{" "}
                  {verificationResult.systolicPassed === null
                    ? "Pending..."
                    : verificationResult.systolicPassed
                    ? "✓ PASSED"
                    : "✗ FAILED"}
                </p>
                <p>
                  Diastolic BP:{" "}
                  {verificationResult.diastolicPassed === null
                    ? "Pending..."
                    : verificationResult.diastolicPassed
                    ? "✓ PASSED"
                    : "✗ FAILED"}
                </p>
              </div>
            </div>

            {verificationResult.proof && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Insurance Verification Proof
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Proof ID:</span>{" "}
                    {verificationResult.proof.proofId}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {verificationResult.proof.verificationType}
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>{" "}
                    {new Date(
                      verificationResult.proof.timestamp * 1000
                    ).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Transaction Hash:</span>{" "}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${verificationResult.proof.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {verificationResult.proof.transactionHash.slice(0, 10)}...
                    </a>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    You can share this proof with your insurance provider. The proof
                    verifies that your blood pressure is within acceptable ranges
                    without revealing the exact values.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || fhevmStatus !== "ready" || recordCount === 0}
          className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: designTokens.colors.light.primary[500] }}
        >
          {isLoading ? "Verifying..." : "Verify for Insurance"}
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


