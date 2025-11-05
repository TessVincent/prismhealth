// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, ebool, externalEuint8, externalEuint16} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PrismHealth - Privacy-First Health Data Management Platform
/// @author PrismHealth Team
/// @notice A FHEVM-based platform for encrypted health data storage and analysis
/// @dev Uses FHEVM v0.9 for fully homomorphic encryption operations
contract PrismHealth is ZamaEthereumConfig {
    // ============ Structs ============
    
    struct HealthRecord {
        uint256 timestamp;
        euint16 systolicBP;      // 收缩压
        euint16 diastolicBP;    // 舒张压
        euint16 bloodGlucose;   // 血糖 (mg/dL)
        euint16 heartRate;      // 心率 (bpm)
        euint16 weight;         // 体重 (kg)
    }

    struct MedicationRecord {
        uint256 timestamp;
        string name;            // 药物名称（明文）
        euint16 dosage;         // 剂量 (mg)
        euint8 frequency;       // 频率 (每天次数)
        uint256 startDate;
        uint256 endDate;
    }

    struct ExerciseRecord {
        uint256 timestamp;
        string exerciseType;    // 运动类型（明文）
        euint16 duration;       // 时长 (分钟)
        euint16 calories;       // 卡路里 (kcal)
    }

    struct HealthScore {
        euint16 totalScore;      // 总评分 (0-10000, 加权总分，显示时除以100)
        euint8 cardiovascular;  // 心血管健康 (0-150)
        euint8 metabolic;       // 代谢健康 (0-100)
        euint8 exercise;       // 运动健康 (0-50)
        euint8 medication;      // 用药依从性 (0-50)
        euint8 riskLevel;       // 风险等级 (0-5)
        uint256 timestamp;
    }

    struct VerificationProof {
        uint256 timestamp;
        string verificationType;
        ebool result;
        bytes32 transactionHash;
    }

    // ============ Storage ============
    
    mapping(address => HealthRecord[]) private healthRecords;
    mapping(address => MedicationRecord[]) private medicationRecords;
    mapping(address => ExerciseRecord[]) private exerciseRecords;
    mapping(address => HealthScore) private healthScores;
    mapping(address => VerificationProof[]) private verificationProofs;
    mapping(address => mapping(uint256 => bool)) private deletedHealthRecords; // recordId => deleted
    mapping(address => bytes32) private lastVerificationHandle; // Store last verification result handle

    // ============ Events ============
    
    event HealthRecordAdded(address indexed user, uint256 indexed recordId, uint256 timestamp);
    event MedicationRecordAdded(address indexed user, uint256 indexed recordId, uint256 timestamp);
    event ExerciseRecordAdded(address indexed user, uint256 indexed recordId, uint256 timestamp);
    event HealthScoreCalculated(address indexed user, uint256 timestamp);
    event VerificationProofGenerated(address indexed user, uint256 indexed proofId, string verificationType);
    event HealthRecordDeleted(address indexed user, uint256 indexed recordId);
    event VerificationResult(
        address indexed user,
        uint256 indexed recordId,
        uint8 indicatorType,
        bytes32 resultHandle
    );

    // ============ Health Record Functions ============
    
    /// @notice Add a health record with encrypted data
    /// @param systolicBP External encrypted systolic blood pressure
    /// @param systolicProof Proof for systolic BP
    /// @param diastolicBP External encrypted diastolic blood pressure
    /// @param diastolicProof Proof for diastolic BP
    /// @param bloodGlucose External encrypted blood glucose
    /// @param glucoseProof Proof for blood glucose
    /// @param heartRate External encrypted heart rate
    /// @param heartRateProof Proof for heart rate
    /// @param weight External encrypted weight
    /// @param weightProof Proof for weight
    function addHealthRecord(
        externalEuint16 systolicBP,
        bytes calldata systolicProof,
        externalEuint16 diastolicBP,
        bytes calldata diastolicProof,
        externalEuint16 bloodGlucose,
        bytes calldata glucoseProof,
        externalEuint16 heartRate,
        bytes calldata heartRateProof,
        externalEuint16 weight,
        bytes calldata weightProof
    ) external {
        // Convert and authorize systolic BP
        euint16 encryptedSystolic = FHE.fromExternal(systolicBP, systolicProof);
        FHE.allowThis(encryptedSystolic);
        FHE.allow(encryptedSystolic, msg.sender);

        // Convert and authorize diastolic BP
        euint16 encryptedDiastolic = FHE.fromExternal(diastolicBP, diastolicProof);
        FHE.allowThis(encryptedDiastolic);
        FHE.allow(encryptedDiastolic, msg.sender);

        // Convert and authorize glucose
        euint16 encryptedGlucose = FHE.fromExternal(bloodGlucose, glucoseProof);
        FHE.allowThis(encryptedGlucose);
        FHE.allow(encryptedGlucose, msg.sender);

        // Convert and authorize heart rate
        euint16 encryptedHeartRate = FHE.fromExternal(heartRate, heartRateProof);
        FHE.allowThis(encryptedHeartRate);
        FHE.allow(encryptedHeartRate, msg.sender);

        // Convert and authorize weight
        euint16 encryptedWeight = FHE.fromExternal(weight, weightProof);
        FHE.allowThis(encryptedWeight);
        FHE.allow(encryptedWeight, msg.sender);

        // Create and store record
        healthRecords[msg.sender].push(HealthRecord({
            timestamp: block.timestamp,
            systolicBP: encryptedSystolic,
            diastolicBP: encryptedDiastolic,
            bloodGlucose: encryptedGlucose,
            heartRate: encryptedHeartRate,
            weight: encryptedWeight
        }));

        uint256 recordId = healthRecords[msg.sender].length - 1;
        emit HealthRecordAdded(msg.sender, recordId, block.timestamp);
    }

    /// @notice Get a health record (encrypted)
    /// @param recordId The index of the record
    /// @return The encrypted health record
    function getHealthRecord(uint256 recordId) external view returns (HealthRecord memory) {
        require(recordId < healthRecords[msg.sender].length, "Record not found");
        require(!deletedHealthRecords[msg.sender][recordId], "Record deleted");
        return healthRecords[msg.sender][recordId];
    }

    /// @notice Get the number of health records for the caller
    /// @return The number of records
    function getHealthRecordCount() external view returns (uint256) {
        return healthRecords[msg.sender].length;
    }

    /// @notice Delete a health record (mark as deleted)
    /// @param recordId The index of the record to delete
    function deleteHealthRecord(uint256 recordId) external {
        require(recordId < healthRecords[msg.sender].length, "Record not found");
        require(!deletedHealthRecords[msg.sender][recordId], "Already deleted");
        deletedHealthRecords[msg.sender][recordId] = true;
        emit HealthRecordDeleted(msg.sender, recordId);
    }

    // ============ Medication Record Functions ============
    
    /// @notice Add a medication record
    /// @param name Medication name (plaintext)
    /// @param dosage External encrypted dosage
    /// @param dosageProof Proof for dosage
    /// @param frequency External encrypted frequency
    /// @param frequencyProof Proof for frequency
    /// @param startDate Start date timestamp
    /// @param endDate End date timestamp
    function addMedicationRecord(
        string calldata name,
        externalEuint16 dosage,
        bytes calldata dosageProof,
        externalEuint8 frequency,
        bytes calldata frequencyProof,
        uint256 startDate,
        uint256 endDate
    ) external {
        euint16 encryptedDosage = FHE.fromExternal(dosage, dosageProof);
        euint8 encryptedFrequency = FHE.fromExternal(frequency, frequencyProof);

        MedicationRecord memory record = MedicationRecord({
            timestamp: block.timestamp,
            name: name,
            dosage: encryptedDosage,
            frequency: encryptedFrequency,
            startDate: startDate,
            endDate: endDate
        });

        medicationRecords[msg.sender].push(record);

        FHE.allowThis(encryptedDosage);
        FHE.allow(encryptedDosage, msg.sender);
        FHE.allowThis(encryptedFrequency);
        FHE.allow(encryptedFrequency, msg.sender);

        uint256 recordId = medicationRecords[msg.sender].length - 1;
        emit MedicationRecordAdded(msg.sender, recordId, block.timestamp);
    }

    /// @notice Get a medication record
    /// @param recordId The index of the record
    /// @return The medication record
    function getMedicationRecord(uint256 recordId) external view returns (MedicationRecord memory) {
        require(recordId < medicationRecords[msg.sender].length, "Record not found");
        return medicationRecords[msg.sender][recordId];
    }

    // ============ Exercise Record Functions ============
    
    /// @notice Add an exercise record
    /// @param exerciseType Exercise type (plaintext)
    /// @param duration External encrypted duration
    /// @param durationProof Proof for duration
    /// @param calories External encrypted calories
    /// @param caloriesProof Proof for calories
    function addExerciseRecord(
        string calldata exerciseType,
        externalEuint16 duration,
        bytes calldata durationProof,
        externalEuint16 calories,
        bytes calldata caloriesProof
    ) external {
        euint16 encryptedDuration = FHE.fromExternal(duration, durationProof);
        euint16 encryptedCalories = FHE.fromExternal(calories, caloriesProof);

        ExerciseRecord memory record = ExerciseRecord({
            timestamp: block.timestamp,
            exerciseType: exerciseType,
            duration: encryptedDuration,
            calories: encryptedCalories
        });

        exerciseRecords[msg.sender].push(record);

        FHE.allowThis(encryptedDuration);
        FHE.allow(encryptedDuration, msg.sender);
        FHE.allowThis(encryptedCalories);
        FHE.allow(encryptedCalories, msg.sender);

        uint256 recordId = exerciseRecords[msg.sender].length - 1;
        emit ExerciseRecordAdded(msg.sender, recordId, block.timestamp);
    }

    /// @notice Get an exercise record
    /// @param recordId The index of the record
    /// @return The exercise record
    function getExerciseRecord(uint256 recordId) external view returns (ExerciseRecord memory) {
        require(recordId < exerciseRecords[msg.sender].length, "Record not found");
        return exerciseRecords[msg.sender][recordId];
    }

    // ============ Health Score Functions ============
    
    /// @notice Calculate health score based on encrypted data
    /// @dev Uses weighted calculation: cardiovascular (30%), metabolic (25%), exercise (25%), medication (20%)
    function calculateHealthScore() external returns (HealthScore memory) {
        HealthRecord[] memory allRecords = healthRecords[msg.sender];
        MedicationRecord[] memory meds = medicationRecords[msg.sender];
        ExerciseRecord[] memory exercises = exerciseRecords[msg.sender];

        // Use the latest record if records exist
        // For now, use the last record directly (index allRecords.length - 1)
        // TODO: Add proper deleted record filtering if needed
        if (allRecords.length == 0 && meds.length == 0 && exercises.length == 0) {
            // Return zero score if no data
            return HealthScore({
                totalScore: FHE.asEuint16(0),
                cardiovascular: FHE.asEuint8(0),
                metabolic: FHE.asEuint8(0),
                exercise: FHE.asEuint8(0),
                medication: FHE.asEuint8(0),
                riskLevel: FHE.asEuint8(0),
                timestamp: block.timestamp
            });
        }

        // Calculate cardiovascular score (based on BP and heart rate)
        // Normal BP: systolic 90-140, diastolic 60-90, heart rate 60-100
        euint8 cardiovascular = FHE.asEuint8(0);
        if (allRecords.length > 0) {
            // Simplified scoring: always give base score when data exists
            // cardiovascular = 50 + 50 + 50 = 150 (base score)
            cardiovascular = FHE.asEuint8(150);
        }

        // Calculate metabolic score (based on glucose and weight)
        // Normal glucose: 70-100 mg/dL, weight BMI considerations
        euint8 metabolic = FHE.asEuint8(0);
        if (allRecords.length > 0) {
            // Simplified: always give base score when data exists
            // metabolic = 50 + 50 = 100 (base score)
            metabolic = FHE.asEuint8(100);
        }

        // Calculate exercise score (based on exercise records)
        // If exercise records exist and recent, score is higher
        euint8 exercise = FHE.asEuint8(0);
        if (exercises.length > 0) {
            // If there are exercise records, assign score based on frequency
            // More records = higher score (simplified: 1 record = 25, 2+ = 50)
            ebool hasMultipleExercises = FHE.ge(FHE.asEuint8(uint8(exercises.length)), FHE.asEuint8(2));
            exercise = FHE.select(hasMultipleExercises, FHE.asEuint8(50), FHE.asEuint8(25));
        }

        // Calculate medication adherence
        // If medication records exist and current, score is higher
        euint8 medication = FHE.asEuint8(0);
        if (meds.length > 0) {
            // Check if there are active medications (not expired)
            // Simplified: if medication records exist, assign score
            ebool hasActiveMeds = FHE.ge(FHE.asEuint8(uint8(meds.length)), FHE.asEuint8(1));
            medication = FHE.select(hasActiveMeds, FHE.asEuint8(50), FHE.asEuint8(25));
        }

        // Weighted total score
        // Convert to euint16 for calculation to avoid overflow
        euint16 cardio16 = FHE.asEuint16(cardiovascular);
        euint16 metabolic16 = FHE.asEuint16(metabolic);
        euint16 exercise16 = FHE.asEuint16(exercise);
        euint16 medication16 = FHE.asEuint16(medication);
        
        euint16 weightedCardio = FHE.mul(cardio16, FHE.asEuint16(30));
        euint16 weightedMetabolic = FHE.mul(metabolic16, FHE.asEuint16(25));
        euint16 weightedExercise = FHE.mul(exercise16, FHE.asEuint16(25));
        euint16 weightedMedication = FHE.mul(medication16, FHE.asEuint16(20));
        
        euint16 totalScore = FHE.add(weightedCardio, weightedMetabolic);
        totalScore = FHE.add(totalScore, weightedExercise);
        totalScore = FHE.add(totalScore, weightedMedication);

        // Calculate risk level (compare totalScore to 5000, which represents 50.0 on 0-100 scale)
        euint8 riskLevel = FHE.asEuint8(0);
        ebool lowScore = FHE.lt(totalScore, FHE.asEuint16(5000));
        riskLevel = FHE.select(lowScore, FHE.asEuint8(5), FHE.asEuint8(0));

        return HealthScore({
            totalScore: totalScore,
            cardiovascular: cardiovascular,
            metabolic: metabolic,
            exercise: exercise,
            medication: medication,
            riskLevel: riskLevel,
            timestamp: block.timestamp
        });
    }

    /// @notice Get the stored health score for the caller
    /// @return The health score
    function getHealthScore() external view returns (HealthScore memory) {
        return healthScores[msg.sender];
    }

    /// @notice Store the calculated health score
    function storeHealthScore() external {
        // Calculate score directly (avoid external call)
        HealthRecord[] memory allRecords = healthRecords[msg.sender];
        MedicationRecord[] memory meds = medicationRecords[msg.sender];
        ExerciseRecord[] memory exercises = exerciseRecords[msg.sender];

        if (allRecords.length == 0 && meds.length == 0 && exercises.length == 0) {
            // Store zero score if no data
            healthScores[msg.sender] = HealthScore({
                totalScore: FHE.asEuint16(0),
                cardiovascular: FHE.asEuint8(0),
                metabolic: FHE.asEuint8(0),
                exercise: FHE.asEuint8(0),
                medication: FHE.asEuint8(0),
                riskLevel: FHE.asEuint8(0),
                timestamp: block.timestamp
            });
            emit HealthScoreCalculated(msg.sender, block.timestamp);
            return;
        }

        // Calculate scores based on actual health data ranges
        euint8 cardiovascular = FHE.asEuint8(0);
        euint8 metabolic = FHE.asEuint8(0);
        
        if (allRecords.length > 0) {
            HealthRecord memory latestRecord = allRecords[allRecords.length - 1];
            
            // Calculate cardiovascular score (based on BP and heart rate)
            // Normal BP: systolic 90-140, diastolic 60-90, heart rate 60-100
            euint16 systolicMin = FHE.asEuint16(90);
            euint16 systolicMax = FHE.asEuint16(140);
            ebool systolicGeMin = FHE.ge(latestRecord.systolicBP, systolicMin);
            ebool systolicLeMax = FHE.le(latestRecord.systolicBP, systolicMax);
            ebool systolicInRange = FHE.and(systolicGeMin, systolicLeMax);
            euint8 bpScore = FHE.select(systolicInRange, FHE.asEuint8(50), FHE.asEuint8(25));
            
            euint16 diastolicMin = FHE.asEuint16(60);
            euint16 diastolicMax = FHE.asEuint16(90);
            ebool diastolicGeMin = FHE.ge(latestRecord.diastolicBP, diastolicMin);
            ebool diastolicLeMax = FHE.le(latestRecord.diastolicBP, diastolicMax);
            ebool diastolicInRange = FHE.and(diastolicGeMin, diastolicLeMax);
            euint8 dpScore = FHE.select(diastolicInRange, FHE.asEuint8(50), FHE.asEuint8(25));
            
            euint16 hrMin = FHE.asEuint16(60);
            euint16 hrMax = FHE.asEuint16(100);
            ebool hrGeMin = FHE.ge(latestRecord.heartRate, hrMin);
            ebool hrLeMax = FHE.le(latestRecord.heartRate, hrMax);
            ebool hrInRange = FHE.and(hrGeMin, hrLeMax);
            euint8 hrScore = FHE.select(hrInRange, FHE.asEuint8(50), FHE.asEuint8(25));
            
            cardiovascular = FHE.add(FHE.add(bpScore, dpScore), hrScore);
            
            // Calculate metabolic score (based on glucose and weight)
            // Normal glucose: 70-100 mg/dL, weight 50-100 kg
            euint16 glucoseMin = FHE.asEuint16(70);
            euint16 glucoseMax = FHE.asEuint16(100);
            ebool glucoseGeMin = FHE.ge(latestRecord.bloodGlucose, glucoseMin);
            ebool glucoseLeMax = FHE.le(latestRecord.bloodGlucose, glucoseMax);
            ebool glucoseInRange = FHE.and(glucoseGeMin, glucoseLeMax);
            euint8 glucoseScore = FHE.select(glucoseInRange, FHE.asEuint8(50), FHE.asEuint8(25));
            
            euint16 weightMin = FHE.asEuint16(50);
            euint16 weightMax = FHE.asEuint16(100);
            ebool weightGeMin = FHE.ge(latestRecord.weight, weightMin);
            ebool weightLeMax = FHE.le(latestRecord.weight, weightMax);
            ebool weightInRange = FHE.and(weightGeMin, weightLeMax);
            euint8 weightScore = FHE.select(weightInRange, FHE.asEuint8(50), FHE.asEuint8(25));
            
            metabolic = FHE.add(glucoseScore, weightScore);
        }
        euint8 exercise = FHE.asEuint8(0);
        if (exercises.length > 0) {
            ebool hasMultipleExercises = FHE.ge(FHE.asEuint8(uint8(exercises.length)), FHE.asEuint8(2));
            exercise = FHE.select(hasMultipleExercises, FHE.asEuint8(50), FHE.asEuint8(25));
        }
        euint8 medication = FHE.asEuint8(0);
        if (meds.length > 0) {
            ebool hasActiveMeds = FHE.ge(FHE.asEuint8(uint8(meds.length)), FHE.asEuint8(1));
            medication = FHE.select(hasActiveMeds, FHE.asEuint8(50), FHE.asEuint8(25));
        }

        // Weighted total score
        // Convert to euint16 for calculation to avoid overflow
        euint16 cardio16 = FHE.asEuint16(cardiovascular);
        euint16 metabolic16 = FHE.asEuint16(metabolic);
        euint16 exercise16 = FHE.asEuint16(exercise);
        euint16 medication16 = FHE.asEuint16(medication);
        
        euint16 weightedCardio = FHE.mul(cardio16, FHE.asEuint16(30));
        euint16 weightedMetabolic = FHE.mul(metabolic16, FHE.asEuint16(25));
        euint16 weightedExercise = FHE.mul(exercise16, FHE.asEuint16(25));
        euint16 weightedMedication = FHE.mul(medication16, FHE.asEuint16(20));
        
        euint16 totalScore = FHE.add(weightedCardio, weightedMetabolic);
        totalScore = FHE.add(totalScore, weightedExercise);
        totalScore = FHE.add(totalScore, weightedMedication);

        // Calculate risk level (0-5 scale based on totalScore)
        // 0-40: Risk Level 5 (极高风险) - 更严格的阈值，低分都是高风险
        // 41-55: Risk Level 4 (高风险)
        // 56-70: Risk Level 3 (中等风险)
        // 71-85: Risk Level 2 (低风险)
        // 86-100: Risk Level 1 (极低风险)
        // 由于 FHE 不支持复杂的条件分支，使用多级 select 判断
        euint8 riskLevel = FHE.asEuint8(5); // 默认最高风险
        
        // Check if score >= 8600 (86.0) -> Risk Level 1
        ebool excellent = FHE.ge(totalScore, FHE.asEuint16(8600));
        riskLevel = FHE.select(excellent, FHE.asEuint8(1), riskLevel);
        
        // Check if score >= 7100 (71.0) and < 8600 -> Risk Level 2
        ebool good = FHE.and(FHE.ge(totalScore, FHE.asEuint16(7100)), FHE.lt(totalScore, FHE.asEuint16(8600)));
        riskLevel = FHE.select(good, FHE.asEuint8(2), riskLevel);
        
        // Check if score >= 5600 (56.0) and < 7100 -> Risk Level 3
        ebool medium = FHE.and(FHE.ge(totalScore, FHE.asEuint16(5600)), FHE.lt(totalScore, FHE.asEuint16(7100)));
        riskLevel = FHE.select(medium, FHE.asEuint8(3), riskLevel);
        
        // Check if score >= 4100 (41.0) and < 5600 -> Risk Level 4
        ebool low = FHE.and(FHE.ge(totalScore, FHE.asEuint16(4100)), FHE.lt(totalScore, FHE.asEuint16(5600)));
        riskLevel = FHE.select(low, FHE.asEuint8(4), riskLevel);
        
        // Score < 4100 (41.0) -> Risk Level 5 (already default)

        HealthScore memory score = HealthScore({
            totalScore: totalScore,
            cardiovascular: cardiovascular,
            metabolic: metabolic,
            exercise: exercise,
            medication: medication,
            riskLevel: riskLevel,
            timestamp: block.timestamp
        });
        
        // Authorize all encrypted score values for user decryption
        FHE.allowThis(score.totalScore);
        FHE.allow(score.totalScore, msg.sender);
        
        FHE.allowThis(score.cardiovascular);
        FHE.allow(score.cardiovascular, msg.sender);
        
        FHE.allowThis(score.metabolic);
        FHE.allow(score.metabolic, msg.sender);
        
        FHE.allowThis(score.exercise);
        FHE.allow(score.exercise, msg.sender);
        
        FHE.allowThis(score.medication);
        FHE.allow(score.medication, msg.sender);
        
        FHE.allowThis(score.riskLevel);
        FHE.allow(score.riskLevel, msg.sender);
        
        healthScores[msg.sender] = score;
        emit HealthScoreCalculated(msg.sender, block.timestamp);
    }

    // ============ Verification Functions ============
    
    /// @notice Verify if an indicator is within a normal range
    /// @param recordId The health record index
    /// @param indicatorType 0=systolicBP, 1=diastolicBP, 2=bloodGlucose, 3=heartRate, 4=weight
    /// @param minValue External encrypted minimum value
    /// @param minProof Proof for minimum value
    /// @param maxValue External encrypted maximum value
    /// @param maxProof Proof for maximum value
    /// @return Encrypted boolean result (true if in range)
    function verifyInRange(
        uint256 recordId,
        uint8 indicatorType,
        externalEuint16 minValue,
        bytes calldata minProof,
        externalEuint16 maxValue,
        bytes calldata maxProof
    ) external returns (ebool) {
        require(recordId < healthRecords[msg.sender].length, "Record not found");
        require(!deletedHealthRecords[msg.sender][recordId], "Record deleted");

        HealthRecord memory record = healthRecords[msg.sender][recordId];
        euint16 min = FHE.fromExternal(minValue, minProof);
        euint16 max = FHE.fromExternal(maxValue, maxProof);

        euint16 indicator;
        if (indicatorType == 0) {
            indicator = record.systolicBP;
        } else if (indicatorType == 1) {
            indicator = record.diastolicBP;
        } else if (indicatorType == 2) {
            indicator = record.bloodGlucose;
        } else if (indicatorType == 3) {
            indicator = record.heartRate;
        } else if (indicatorType == 4) {
            indicator = record.weight;
        } else {
            revert("Invalid indicator type");
        }

        ebool geMin = FHE.ge(indicator, min);
        ebool leMax = FHE.le(indicator, max);
        ebool result = FHE.and(geMin, leMax);
        
        // Authorize the result for user decryption
        // Note: FHE.and creates a new ciphertext, so we must authorize it after creation
        // Follow the same pattern as other functions: allowThis first, then allow for specific user
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        // Store the result handle in a mapping so we can emit it as bytes32
        // In FHEVM, ebool is bytes32 internally, but we can't directly cast it
        // So we store it in a mapping and then use assembly or a workaround to get bytes32
        // Actually, we can use a storage variable to hold the handle
        // But wait - we can't store ebool in a bytes32 mapping directly either
        // Let's use a different approach: use assembly to convert ebool to bytes32
        // Or, we can use the fact that in FHEVM, ebool variables are stored as bytes32
        // Let's try using inline assembly to extract the bytes32 value
        bytes32 resultHandle;
        assembly {
            resultHandle := result
        }
        
        // Store handle for potential future retrieval
        lastVerificationHandle[msg.sender] = resultHandle;
        
        // Emit event with the result handle
        emit VerificationResult(msg.sender, recordId, indicatorType, resultHandle);
        
        return result;
    }

    /// @notice Verify if health score meets a threshold
    /// @param minScore External encrypted minimum score
    /// @param minProof Proof for minimum score
    /// @return Encrypted boolean result (true if score >= minScore)
    function verifyScoreThreshold(
        externalEuint16 minScore,
        bytes calldata minProof
    ) external returns (ebool) {
        HealthScore memory score = healthScores[msg.sender];
        euint16 min = FHE.fromExternal(minScore, minProof);
        return FHE.ge(score.totalScore, min);
    }

    /// @notice Generate a verification proof
    /// @param verificationType Type of verification (e.g., "insurance", "medical")
    /// @param result Encrypted boolean result
    /// @return proofId The index of the generated proof
    function generateVerificationProof(
        string calldata verificationType,
        ebool result
    ) external returns (uint256) {
        VerificationProof memory proof = VerificationProof({
            timestamp: block.timestamp,
            verificationType: verificationType,
            result: result,
            transactionHash: keccak256(abi.encodePacked(block.timestamp, msg.sender, verificationType))
        });

        verificationProofs[msg.sender].push(proof);

        uint256 proofId = verificationProofs[msg.sender].length - 1;
        emit VerificationProofGenerated(msg.sender, proofId, verificationType);

        return proofId;
    }

    /// @notice Get a verification proof
    /// @param proofId The index of the proof
    /// @return The verification proof
    function getVerificationProof(uint256 proofId) external view returns (VerificationProof memory) {
        require(proofId < verificationProofs[msg.sender].length, "Proof not found");
        return verificationProofs[msg.sender][proofId];
    }

    /// @notice Get the number of verification proofs for the caller
    /// @return The number of proofs
    function getVerificationProofCount() external view returns (uint256) {
        return verificationProofs[msg.sender].length;
    }
}

