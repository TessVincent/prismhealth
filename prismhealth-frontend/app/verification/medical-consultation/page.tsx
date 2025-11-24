"use client";

import { useState } from "react";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

export default function MedicalConsultationPage() {
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
    contractAddress,
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

  const [selectedRecordId, setSelectedRecordId] = useState<string>("0");
  const [shareLink, setShareLink] = useState<string>("");

  const handleGenerateShareLink = () => {
    if (!contractAddress || !accounts || accounts.length === 0) {
      return;
    }

    const link = `${window.location.origin}/consultation?recordId=${selectedRecordId}&contract=${contractAddress}&user=${accounts[0]}`;
    setShareLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Medical Consultation</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">
            Please connect your wallet to share health data with medical professionals.
          </p>
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
        <h1 className="text-3xl font-bold mb-6">Medical Consultation</h1>
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
      <h1 className="text-3xl font-bold mb-6">Medical Consultation</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Share your encrypted health data with medical professionals. Doctors can
          access the encrypted data for analysis but cannot decrypt the exact values
          without your authorization.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Health Record to Share
          </label>
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={recordCount === 0}
          >
            {Array.from({ length: recordCount }, (_, i) => (
              <option key={i} value={i}>
                Record #{i + 1}
              </option>
            ))}
          </select>
          {recordCount === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No health records available. Please add health records first.
            </p>
          )}
        </div>

        <div>
          <button
            onClick={handleGenerateShareLink}
            disabled={recordCount === 0 || isLoading}
            className="px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            Generate Share Link
          </button>
        </div>

        {shareLink && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Share Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: designTokens.colors.light.secondary[500] }}
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this link with your doctor. They will be able to access the
              encrypted health record for consultation purposes.
            </p>
          </div>
        )}

        <div className="bg-gray-50 border rounded-lg p-6">
          <h3 className="font-semibold mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • Your health data is stored encrypted on the blockchain
            </li>
            <li>
              • Doctors receive a share link with encrypted data access
            </li>
            <li>
              • Medical professionals can analyze encrypted data without seeing exact values
            </li>
            <li>
              • Only you can decrypt and view the actual health metrics
            </li>
            <li>
              • Privacy is maintained throughout the consultation process
            </li>
          </ul>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
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
      </div>
    </div>
  );
}


