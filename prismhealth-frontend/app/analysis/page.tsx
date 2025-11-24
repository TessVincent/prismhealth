"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

export default function AnalysisPage() {
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
    calculateHealthScore,
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

  const [healthScore, setHealthScore] = useState<{
    totalScore: any;
    cardiovascular: any;
    metabolic: any;
    exercise: any;
    medication: any;
    riskLevel: any;
    timestamp: number;
  } | null>(null);

  // Helper function to check if score is zero (handles bigint, number, and string)
  const isZero = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'bigint') return value === BigInt(0);
    if (typeof value === 'number') return value === 0;
    if (typeof value === 'string') return value === '0' || value === '';
    return Number(value) === 0;
  };

  const hasNoData = healthScore && 
    isZero(healthScore.totalScore) && 
    isZero(healthScore.cardiovascular) && 
    isZero(healthScore.metabolic) && 
    isZero(healthScore.exercise) && 
    isZero(healthScore.medication);

  const handleCalculate = async () => {
    const score = await calculateHealthScore();
    if (score) {
      setHealthScore(score);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health Analysis</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">Please connect your wallet to analyze health data.</p>
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
        <h1 className="text-3xl font-bold mb-6">Health Analysis</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            PrismHealth contract is not deployed on this network.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Health Analysis</h1>

      <div className="mb-6">
        <button
          onClick={handleCalculate}
          disabled={isLoading || fhevmStatus !== "ready"}
          className="px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: designTokens.colors.light.primary[500] }}
        >
          {isLoading ? "Calculating..." : "Calculate Health Score"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes("success") || message.includes("Success")
              ? "bg-green-50 text-green-800"
              : message.includes("Failed") || message.includes("failed")
              ? "bg-red-50 text-red-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      {healthScore && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Health Score Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Score</p>
                <p className="text-4xl font-bold" style={{ color: designTokens.colors.light.primary[500] }}>
                  {healthScore.totalScore !== null && healthScore.totalScore !== undefined
                    ? (typeof healthScore.totalScore === 'bigint' 
                        ? (Number(healthScore.totalScore) / 100).toFixed(1)
                        : typeof healthScore.totalScore === 'number'
                        ? (healthScore.totalScore / 100).toFixed(1)
                        : (Number(healthScore.totalScore) / 100).toFixed(1))
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">(0-100 scale, weighted sum)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                <p className="text-4xl font-bold" style={{ color: designTokens.colors.light.accent[500] }}>
                  {healthScore.riskLevel !== null && healthScore.riskLevel !== undefined
                    ? (typeof healthScore.riskLevel === 'bigint' 
                        ? Number(healthScore.riskLevel).toString()
                        : typeof healthScore.riskLevel === 'number'
                        ? healthScore.riskLevel.toString()
                        : Number(healthScore.riskLevel))
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">(0-5, lower is better)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Dimension Scores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cardiovascular</p>
                <p className="text-2xl font-semibold">
                  {healthScore.cardiovascular !== null && healthScore.cardiovascular !== undefined
                    ? (typeof healthScore.cardiovascular === 'bigint' 
                        ? Number(healthScore.cardiovascular).toString()
                        : typeof healthScore.cardiovascular === 'number'
                        ? healthScore.cardiovascular.toString()
                        : Number(healthScore.cardiovascular))
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Metabolic</p>
                <p className="text-2xl font-semibold">
                  {healthScore.metabolic !== null && healthScore.metabolic !== undefined
                    ? (typeof healthScore.metabolic === 'bigint' 
                        ? Number(healthScore.metabolic).toString()
                        : typeof healthScore.metabolic === 'number'
                        ? healthScore.metabolic.toString()
                        : Number(healthScore.metabolic))
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Exercise</p>
                <p className="text-2xl font-semibold">
                  {healthScore.exercise !== null && healthScore.exercise !== undefined
                    ? (typeof healthScore.exercise === 'bigint' 
                        ? Number(healthScore.exercise).toString()
                        : typeof healthScore.exercise === 'number'
                        ? healthScore.exercise.toString()
                        : Number(healthScore.exercise))
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Medication</p>
                <p className="text-2xl font-semibold">
                  {healthScore.medication !== null && healthScore.medication !== undefined
                    ? (typeof healthScore.medication === 'bigint' 
                        ? Number(healthScore.medication).toString()
                        : typeof healthScore.medication === 'number'
                        ? healthScore.medication.toString()
                        : Number(healthScore.medication))
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Calculated at: {new Date(healthScore.timestamp * 1000).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Note: Scores are calculated in encrypted form using FHEVM. The total score is a weighted sum (cardiovascular 30%, metabolic 25%, exercise 25%, medication 20%).
            </p>
          </div>
        </div>
      )}

      {!healthScore && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            Click "Calculate Health Score" to analyze your encrypted health data.
          </p>
          <p className="text-sm text-gray-500">
            The analysis is performed on encrypted data without decryption, preserving your privacy.
          </p>
        </div>
      )}

      {hasNoData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Health Data Found</h3>
          <p className="text-yellow-700 mb-4">
            Your health score is 0 because no health data has been recorded yet.
          </p>
          <p className="text-sm text-yellow-600 mb-4">
            To get a meaningful health score, please add:
          </p>
          <ul className="text-sm text-yellow-600 list-disc list-inside mb-4 space-y-1">
            <li>Health records (blood pressure, glucose, heart rate, weight)</li>
            <li>Exercise records</li>
            <li>Medication records</li>
          </ul>
          <Link
            href="/data-entry"
            className="inline-block px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            Go to Data Entry
          </Link>
        </div>
      )}
    </div>
  );
}
