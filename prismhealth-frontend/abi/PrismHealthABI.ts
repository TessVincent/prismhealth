
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const PrismHealthABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ExerciseRecordAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "HealthRecordAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        }
      ],
      "name": "HealthRecordDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "HealthScoreCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "MedicationRecordAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proofId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "verificationType",
          "type": "string"
        }
      ],
      "name": "VerificationProofGenerated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "indicatorType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "resultHandle",
          "type": "bytes32"
        }
      ],
      "name": "VerificationResult",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "exerciseType",
          "type": "string"
        },
        {
          "internalType": "externalEuint16",
          "name": "duration",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "durationProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "calories",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "caloriesProof",
          "type": "bytes"
        }
      ],
      "name": "addExerciseRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint16",
          "name": "systolicBP",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "systolicProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "diastolicBP",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "diastolicProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "bloodGlucose",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "glucoseProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "heartRate",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "heartRateProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "weight",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "weightProof",
          "type": "bytes"
        }
      ],
      "name": "addHealthRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "externalEuint16",
          "name": "dosage",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "dosageProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint8",
          "name": "frequency",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "frequencyProof",
          "type": "bytes"
        },
        {
          "internalType": "uint256",
          "name": "startDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endDate",
          "type": "uint256"
        }
      ],
      "name": "addMedicationRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "calculateHealthScore",
      "outputs": [
        {
          "components": [
            {
              "internalType": "euint16",
              "name": "totalScore",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "cardiovascular",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "metabolic",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "exercise",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "medication",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "riskLevel",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct PrismHealth.HealthScore",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        }
      ],
      "name": "deleteHealthRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "verificationType",
          "type": "string"
        },
        {
          "internalType": "ebool",
          "name": "result",
          "type": "bytes32"
        }
      ],
      "name": "generateVerificationProof",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        }
      ],
      "name": "getExerciseRecord",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "exerciseType",
              "type": "string"
            },
            {
              "internalType": "euint16",
              "name": "duration",
              "type": "bytes32"
            },
            {
              "internalType": "euint16",
              "name": "calories",
              "type": "bytes32"
            }
          ],
          "internalType": "struct PrismHealth.ExerciseRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        }
      ],
      "name": "getHealthRecord",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "euint16",
              "name": "systolicBP",
              "type": "bytes32"
            },
            {
              "internalType": "euint16",
              "name": "diastolicBP",
              "type": "bytes32"
            },
            {
              "internalType": "euint16",
              "name": "bloodGlucose",
              "type": "bytes32"
            },
            {
              "internalType": "euint16",
              "name": "heartRate",
              "type": "bytes32"
            },
            {
              "internalType": "euint16",
              "name": "weight",
              "type": "bytes32"
            }
          ],
          "internalType": "struct PrismHealth.HealthRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getHealthRecordCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getHealthScore",
      "outputs": [
        {
          "components": [
            {
              "internalType": "euint16",
              "name": "totalScore",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "cardiovascular",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "metabolic",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "exercise",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "medication",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "riskLevel",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct PrismHealth.HealthScore",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        }
      ],
      "name": "getMedicationRecord",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "euint16",
              "name": "dosage",
              "type": "bytes32"
            },
            {
              "internalType": "euint8",
              "name": "frequency",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "startDate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endDate",
              "type": "uint256"
            }
          ],
          "internalType": "struct PrismHealth.MedicationRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proofId",
          "type": "uint256"
        }
      ],
      "name": "getVerificationProof",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "verificationType",
              "type": "string"
            },
            {
              "internalType": "ebool",
              "name": "result",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "transactionHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct PrismHealth.VerificationProof",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVerificationProofCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "storeHealthScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "indicatorType",
          "type": "uint8"
        },
        {
          "internalType": "externalEuint16",
          "name": "minValue",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "minProof",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint16",
          "name": "maxValue",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "maxProof",
          "type": "bytes"
        }
      ],
      "name": "verifyInRange",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint16",
          "name": "minScore",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "minProof",
          "type": "bytes"
        }
      ],
      "name": "verifyScoreThreshold",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

