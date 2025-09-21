// Core data types for FRA Atlas system

export interface FRAClaim {
  id: string
  villageId: string
  villageName: string
  district: string
  state: "Madhya Pradesh" | "Tripura" | "Odisha" | "Telangana"
  pattalHolderName: string
  coordinates: {
    latitude: number
    longitude: number
  }
  claimType: "IFR" | "CR" | "CFR" // Individual/Community/Community Forest Resource
  status: "pending" | "verified" | "granted" | "rejected"
  areaHectares: number
  submissionDate: string
  verificationDate?: string
  grantDate?: string
  documents: string[]
}

export interface AssetData {
  id: string
  coordinates: {
    latitude: number
    longitude: number
  }
  landUseType: "Agriculture" | "Forest" | "Water" | "Settlements" | "Degraded"
  areaHectares: number
  confidence: number
  lastUpdated: string
  satelliteSource: string
}

export interface Village {
  id: string
  name: string
  district: string
  state: "Madhya Pradesh" | "Tripura" | "Odisha" | "Telangana"
  coordinates: {
    latitude: number
    longitude: number
  }
  population: number
  forestCover: number
  waterIndex: number
  claims: FRAClaim[]
  assets: AssetData[]
}

export interface PolicyRecommendation {
  id: string
  villageId: string
  villageName: string
  recommendationType: "PM-KISAN" | "Jal Jeevan Mission" | "MGNREGA" | "Forest Conservation"
  priority: "High" | "Medium" | "Low"
  reasoning: string
  estimatedBenefit: string
  implementationSteps: string[]
  generatedDate: string
}

export interface OCRResult {
  extractedText: string
  confidence: number
  entities: {
    villageName?: string
    pattalHolderName?: string
    coordinates?: string
    claimType?: string
    status?: string
  }
}
