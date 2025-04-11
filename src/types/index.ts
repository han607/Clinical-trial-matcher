export interface Criterion {
  id: string;
  description: string;
  type: 'inclusion' | 'exclusion';
}

export interface ClinicalTrial {
  id: string;
  name: string;
  description: string;
  category: string;
  inclusionCriteria: Criterion[];
  exclusionCriteria: Criterion[];
}

export interface Patient {
  id: string;
  name: string;
  selectedCategory: string;
  characteristics: string[]; // Array of criterion IDs that apply to this patient
}

export interface TrialEligibility {
  trialId: string;
  isEligible: boolean;
  reasons: string[];
} 