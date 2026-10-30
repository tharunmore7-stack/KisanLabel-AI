export type AiMode = 'online' | 'offline';

export type LanguageCode =
  | 'en'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'pa';

export interface LabelImage {
  id: string;
  dataUrl: string;
  name: string;
  mimeType: string;
}

export type Confidence = 'high' | 'medium' | 'low' | 'missing';

export interface ProductIdentification {
  productName?: string;
  manufacturer?: string;
  activeIngredient?: string;
  chemicalComposition?: string;
  formulationType?: string;
  registrationNumber?: string;
}

export interface CropPestInfo {
  crops: string[];
  pests: string[];
  approvedUsage?: string;
  applicationMethod?: string;
}

export interface DosageInfo {
  dosageInstructions?: string;
  dosageUnits?: string;
  tankCapacity?: string;
  tankCapacityMentioned: boolean;
  explanation?: string;
  unclearOrMissing: boolean;
}

export interface WaitingPeriodInfo {
  preHarvestInterval?: string;
  waitingPeriod?: string;
  reEntryInterval?: string;
  explanation?: string;
}

export interface SafetyInstructions {
  protectiveEquipment: string[];
  handlingPrecautions: string[];
  storageInstructions: string[];
  environmentalPrecautions: string[];
  disposalInstructions: string[];
  firstAid: string[];
}

export interface WarningCard {
  type: 'toxicity' | 'skin-eye' | 'environmental' | 'restricted' | 'missing-info';
  title: string;
  details: string;
  severity: 'high' | 'medium' | 'low';
}

export interface LabelAnalysis {
  productIdentification: ProductIdentification;
  cropPestInfo: CropPestInfo;
  dosage: DosageInfo;
  waitingPeriod: WaitingPeriodInfo;
  safetyInstructions: SafetyInstructions;
  warnings: WarningCard[];
  rawExtractedText?: string;
  overallConfidence: Confidence;
  missingFields: string[];
}

export interface ScanRecord {
  id: string;
  product_name: string | null;
  manufacturer: string | null;
  ai_mode: AiMode;
  language: LanguageCode;
  analysis: LabelAnalysis;
  image_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AiServiceStatus {
  online: boolean;
  offline: boolean;
  checking: boolean;
}
