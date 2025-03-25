export interface Bunker {
  name: string;
  isActive: boolean;
  timestamp: number;
}

export interface BunkerStatus {
  bunkers: Bunker[];
  lastUpdate: number;
  source?: string;
  messageCount?: number;
}

export interface BunkerResponse {
  bunkers: {
    name: string;
    isActive: boolean;
    timestamp: string | number;
  }[];
}
