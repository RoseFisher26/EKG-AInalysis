export interface EKGAnalysis {
  technicalQuality: string;
  heartRate: number;
  rhythm: string;
  axis: string;
  intervals: {
    pr: string;
    qrs: string;
    qt: string;
    qtc: string;
  };
  stSegment: string;
  tWave: string;
  abnormalities: string[];
  preliminaryDiagnosis: string;
  differentialDiagnoses: string[];
  urgency: 'low' | 'moderate' | 'high';
  recommendations: string[];
  confidenceLevel: number; // 0-1
}

export interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  medicalHistory: string;
  createdAt: number;
  ownerId: string;
}

export interface EKGRecord {
  id: string;
  patientId: string;
  imageUrl: string;
  analysis: EKGAnalysis;
  notes: string;
  createdAt: number;
  ownerId: string;
}
