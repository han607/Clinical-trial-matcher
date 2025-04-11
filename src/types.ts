export interface Criterion {
  id: string
  type: 'inclusion' | 'exclusion'
  description: string
}

export interface ClinicalTrial {
  id: string
  name: string
  category: string
  inclusionCriteria: Criterion[]
  exclusionCriteria: Criterion[]
}

export interface Patient {
  id: string
  name: string
  selectedCategory: string
  selectedCriteria: string[]
}

export interface TrialEligibility {
  trialId: string
  isEligible: boolean
  reasons: string[]
} 