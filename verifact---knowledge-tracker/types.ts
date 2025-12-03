export interface Source {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[]; // Simplified for this demo
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface AnalysisResult {
  text: string;
  sources: Source[];
  groundingMetadata: GroundingMetadata | null;
  timestamp: number;
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  query: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}