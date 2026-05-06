// types/api.ts

// Payload yang dikirim dari React ke Express
export interface AskUstadzPayload {
    sessionId: string;
    message: string;
}

// Data sumber referensi yang ditemukan di database
export interface ReferenceSource {
    id: number;
    title: string | null;
    similarity_score: number;
}

// Balasan dari Express ke React
export interface AskUstadzResponse {
    answer: string;
    sources: ReferenceSource[];
    isOutOfScope: boolean;
}
