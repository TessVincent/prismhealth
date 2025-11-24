"use client";

import { useState } from "react";
import { usePrismHealth } from "@/hooks/usePrismHealth";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { designTokens } from "@/design-tokens";

type TabType = "health" | "medication" | "exercise";

export default function DataEntryPage() {
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
    addHealthRecord,
    addMedicationRecord,
    addExerciseRecord,
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

  const [activeTab, setActiveTab] = useState<TabType>("health");
  const [healthFormData, setHealthFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
    bloodGlucose: "",
    heartRate: "",
    weight: "",
  });
  const [medicationFormData, setMedicationFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
  });
  const [exerciseFormData, setExerciseFormData] = useState({
    exerciseType: "",
    duration: "",
    calories: "",
  });

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      connect();
      return;
    }

    if (!isDeployed) {
      alert("Contract not deployed on this network");
      return;
    }

    const data = {
      systolicBP: parseInt(healthFormData.systolicBP),
      diastolicBP: parseInt(healthFormData.diastolicBP),
      bloodGlucose: parseInt(healthFormData.bloodGlucose),
      heartRate: parseInt(healthFormData.heartRate),
      weight: parseInt(healthFormData.weight),
    };

    if (
      isNaN(data.systolicBP) ||
      isNaN(data.diastolicBP) ||
      isNaN(data.bloodGlucose) ||
      isNaN(data.heartRate) ||
      isNaN(data.weight)
    ) {
      alert("Please fill in all fields with valid numbers");
      return;
    }

    await addHealthRecord(data);

    if (message.includes("successfully")) {
      setHealthFormData({
        systolicBP: "",
        diastolicBP: "",
        bloodGlucose: "",
        heartRate: "",
        weight: "",
      });
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !isDeployed) {
      return;
    }

    const data = {
      name: medicationFormData.name,
      dosage: parseInt(medicationFormData.dosage),
      frequency: parseInt(medicationFormData.frequency),
      startDate: Math.floor(new Date(medicationFormData.startDate).getTime() / 1000),
      endDate: Math.floor(new Date(medicationFormData.endDate).getTime() / 1000),
    };

    if (isNaN(data.dosage) || isNaN(data.frequency) || !data.name) {
      alert("Please fill in all fields correctly");
      return;
    }

    await addMedicationRecord(data);

    if (message.includes("successfully")) {
      setMedicationFormData({
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
      });
    }
  };

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !isDeployed) {
      return;
    }

    const data = {
      exerciseType: exerciseFormData.exerciseType,
      duration: parseInt(exerciseFormData.duration),
      calories: parseInt(exerciseFormData.calories),
    };

    if (isNaN(data.duration) || isNaN(data.calories) || !data.exerciseType) {
      alert("Please fill in all fields correctly");
      return;
    }

    await addExerciseRecord(data);

    if (message.includes("successfully")) {
      setExerciseFormData({
        exerciseType: "",
        duration: "",
        calories: "",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Data Entry</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-4">Please connect your wallet to add health records.</p>
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
        <h1 className="text-3xl font-bold mb-6">Data Entry</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            PrismHealth contract is not deployed on this network. Please deploy the contract first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add Health Data</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={`px-4 py-2 font-medium ${
            activeTab === "health"
              ? "border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            borderBottomColor:
              activeTab === "health"
                ? designTokens.colors.light.primary[500]
                : "transparent",
          }}
        >
          Health Record
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("medication")}
          className={`px-4 py-2 font-medium ${
            activeTab === "medication"
              ? "border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            borderBottomColor:
              activeTab === "medication"
                ? designTokens.colors.light.primary[500]
                : "transparent",
          }}
        >
          Medication
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("exercise")}
          className={`px-4 py-2 font-medium ${
            activeTab === "exercise"
              ? "border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            borderBottomColor:
              activeTab === "exercise"
                ? designTokens.colors.light.primary[500]
                : "transparent",
          }}
        >
          Exercise
        </button>
      </div>

      {/* Health Record Form */}
      {activeTab === "health" && (
        <form onSubmit={handleHealthSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Systolic Blood Pressure (mmHg)
          </label>
          <input
            type="number"
            value={healthFormData.systolicBP}
            onChange={(e) =>
              setHealthFormData({ ...healthFormData, systolicBP: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="50"
            max="250"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Diastolic Blood Pressure (mmHg)
          </label>
          <input
            type="number"
            value={healthFormData.diastolicBP}
            onChange={(e) =>
              setHealthFormData({ ...healthFormData, diastolicBP: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="30"
            max="150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Blood Glucose (mg/dL)
          </label>
          <input
            type="number"
            value={healthFormData.bloodGlucose}
            onChange={(e) =>
              setHealthFormData({ ...healthFormData, bloodGlucose: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="50"
            max="500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Heart Rate (bpm)
          </label>
          <input
            type="number"
            value={healthFormData.heartRate}
            onChange={(e) =>
              setHealthFormData({ ...healthFormData, heartRate: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="40"
            max="200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            value={healthFormData.weight}
            onChange={(e) =>
              setHealthFormData({ ...healthFormData, weight: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="20"
            max="300"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("successfully") || message.includes("success")
                ? "bg-green-50 text-green-800"
                : message.includes("Failed") || message.includes("failed")
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || fhevmStatus !== "ready"}
          className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: designTokens.colors.light.primary[500] }}
        >
          {isLoading ? "Processing..." : "Submit Health Record"}
        </button>
      </form>
      )}

      {/* Medication Record Form */}
      {activeTab === "medication" && (
        <form onSubmit={handleMedicationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Medication Name
            </label>
            <input
              type="text"
              value={medicationFormData.name}
              onChange={(e) =>
                setMedicationFormData({ ...medicationFormData, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Dosage (mg)
            </label>
            <input
              type="number"
              value={medicationFormData.dosage}
              onChange={(e) =>
                setMedicationFormData({ ...medicationFormData, dosage: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Frequency (times per day)
            </label>
            <input
              type="number"
              value={medicationFormData.frequency}
              onChange={(e) =>
                setMedicationFormData({ ...medicationFormData, frequency: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
              min="1"
              max="10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={medicationFormData.startDate}
                onChange={(e) =>
                  setMedicationFormData({ ...medicationFormData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={medicationFormData.endDate}
                onChange={(e) =>
                  setMedicationFormData({ ...medicationFormData, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("successfully") || message.includes("success")
                  ? "bg-green-50 text-green-800"
                  : message.includes("Failed") || message.includes("failed")
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || fhevmStatus !== "ready"}
            className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            {isLoading ? "Processing..." : "Submit Medication Record"}
          </button>
        </form>
      )}

      {/* Exercise Record Form */}
      {activeTab === "exercise" && (
        <form onSubmit={handleExerciseSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Exercise Type
            </label>
            <select
              value={exerciseFormData.exerciseType}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, exerciseType: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select exercise type</option>
              <option value="Running">Running</option>
              <option value="Walking">Walking</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="Weight Training">Weight Training</option>
              <option value="Yoga">Yoga</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={exerciseFormData.duration}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, duration: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Calories Burned (kcal)
            </label>
            <input
              type="number"
              value={exerciseFormData.calories}
              onChange={(e) =>
                setExerciseFormData({ ...exerciseFormData, calories: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
              min="1"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("successfully") || message.includes("success")
                  ? "bg-green-50 text-green-800"
                  : message.includes("Failed") || message.includes("failed")
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || fhevmStatus !== "ready"}
            className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: designTokens.colors.light.primary[500] }}
          >
            {isLoading ? "Processing..." : "Submit Exercise Record"}
          </button>
        </form>
      )}
    </div>
  );
}
