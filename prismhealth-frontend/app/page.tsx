"use client";

import Link from "next/link";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { designTokens } from "@/design-tokens";

export default function Home() {
  const { connect, isConnected, accounts } = useMetaMask();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: designTokens.colors.light.primary[500] }}>
            PrismHealth
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Privacy-First Health Data Management Platform
          </p>
          <p className="text-lg mb-8 text-gray-500">
            Your health data encrypted on-chain. Analysis without decryption. Privacy guaranteed.
          </p>
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: designTokens.colors.light.primary[500] }}
            >
              Get Started
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: designTokens.colors.light.primary[500] }}
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Encrypted Storage</h3>
              <p className="text-gray-600">
                All data encrypted on-chain. Only you can decrypt.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Encrypted Computing</h3>
              <p className="text-gray-600">
                Analyze health data without decryption using FHEVM.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Privacy Verification</h3>
              <p className="text-gray-600">
                Prove health indicators meet requirements without revealing values.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Data Ownership</h3>
              <p className="text-gray-600">
                You control your data. Update, delete, or export anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Insurance Application</h3>
              <p className="text-gray-600">
                Verify your health metrics meet insurance requirements without revealing exact values.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Medical Consultation</h3>
              <p className="text-gray-600">
                Share encrypted health data with doctors for analysis while maintaining privacy.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Health Planning</h3>
              <p className="text-gray-600">
                Create personalized health plans based on encrypted data analysis.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Statistical Analysis</h3>
              <p className="text-gray-600">
                Aggregate health statistics without exposing individual data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
