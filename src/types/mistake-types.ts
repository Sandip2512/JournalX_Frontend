export interface Mistake {
    id: string;
    name: string;
    category: 'Behavioral' | 'Psychological' | 'Cognitive' | 'Technical';
    severity: 'High' | 'Medium' | 'Low';
    impact: 'Critical' | 'Moderate' | 'Minor';
    description?: string;
    user_id: string;
    count: number;
    created_at?: string;
}

export interface MistakeCreate {
    name: string;
    category: 'Behavioral' | 'Psychological' | 'Cognitive' | 'Technical';
    severity: 'High' | 'Medium' | 'Low';
    impact: 'Critical' | 'Moderate' | 'Minor';
    description?: string;
    user_id: string;
}

export interface MistakeAnalytics {
    totalMistakes: number;
    mostCommon: Mistake | null;
    improvement: number;
    distribution: { category: string; count: number }[];
    customMistakes: Mistake[];
}

export interface FrequencyData {
    date: string;
    count: number;
}
