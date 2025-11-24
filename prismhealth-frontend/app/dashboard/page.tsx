"use client";

import { useState, useEffect } from "react";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

export default function DashboardPage() {
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
    decryptHealthRecord,
    isLoading,
    message,
    isDeployed,
    refreshRecordCount,
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

  const [decryptedRecords, setDecryptedRecords] = useState<
    Array<{
      recordId: number;
      data: {
        timestamp: number;
        systolicBP: number;
        diastolicBP: number;
        bloodGlucose: number;
        heartRate: number;
        weight: number;
      } | null;
    }>
  >([]);

  useEffect(() => {
    if (isDeployed && healthRecordCount !== undefined) {
      refreshRecordCount();
    }
  }, [isDeployed, healthRecordCount, refreshRecordCount]);

  const handleDecrypt = async (recordId: number) => {
    const decrypted = await decryptHealthRecord(recordId);
    setDecryptedRecords((prev) => {
      const existing = prev.find((r) => r.recordId === recordId);
      if (existing) {
        return prev.map((r) =>
          r.recordId === recordId ? { ...r, data: decrypted } : r
        );
      }
      return [...prev, { recordId, data: decrypted }];
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">Please connect your wallet to view health records.</p>
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
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Health Records Dashboard</h1>
        <button
          onClick={refreshRecordCount}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: designTokens.colors.light.neutral[200] }}
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <p className="text-lg">
          Total Records: <span className="font-semibold">{recordCount}</span>
        </p>
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

      {recordCount === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No health records found.</p>
          <a
            href="/data-entry"
            className="inline-block px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            Add Your First Health Record
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: recordCount }, (_, i) => {
            const decrypted = decryptedRecords.find((r) => r.recordId === i);
            return (
              <div
                key={i}
                className="border rounded-lg p-6"
                style={{ backgroundColor: designTokens.colors.light.surface }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Record #{i + 1}</h3>
                  {!decrypted?.data && (
                    <button
                      onClick={() => handleDecrypt(i)}
                      disabled={isLoading || fhevmStatus !== "ready"}
                      className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                      style={{ backgroundColor: designTokens.colors.light.primary[500] }}
                    >
                      {isLoading ? "Decrypting..." : "Decrypt"}
                    </button>
                  )}
                </div>

                {decrypted?.data ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Systolic BP</p>
                      <p className="text-lg font-semibold">
                        {decrypted.data.systolicBP} mmHg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Diastolic BP</p>
                      <p className="text-lg font-semibold">
                        {decrypted.data.diastolicBP} mmHg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Glucose</p>
                      <p className="text-lg font-semibold">
                        {decrypted.data.bloodGlucose} mg/dL
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Heart Rate</p>
                      <p className="text-lg font-semibold">
                        {decrypted.data.heartRate} bpm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="text-lg font-semibold">
                        {decrypted.data.weight} kg
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-5">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-sm">
                        {new Date(decrypted.data.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Encrypted data - Click Decrypt to view</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
