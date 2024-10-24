// src/app/models/patient-dto.model.ts
export interface PatientDto {
    patientId: number;                // Assuming PatientId is a number
    name: string;                     // Assuming Name is a string
    gender: string;                   // Assuming Gender is a string
    phoneNumber: string;              // Assuming PhoneNumber is a string
    address: string;                  // Assuming Address is a string
    age: number;                      // Assuming Age is a number
    hypertension: boolean;            // Assuming Hypertension is a boolean
    diabetes: boolean;                // Assuming Diabetes is a boolean
    stomachAche: boolean;             // Assuming StomachAche is a boolean
    periodontalDisease: boolean;      // Assuming PeriodontalDisease is a boolean
    isPregnant: boolean;              // Assuming IsPregnant is a boolean
    isBreastfeeding: boolean;         // Assuming IsBreastfeeding is a boolean
    isSmoking: boolean;                // Assuming IsSmoking is a boolean
    kidneyDiseases: boolean;          // Assuming KidneyDiseases is a boolean
    heartDiseases: boolean;           // Assuming HeartDiseases is a boolean
}
