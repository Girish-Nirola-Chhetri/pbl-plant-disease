export type DiseaseContext = {
    description: string;
    symptoms: string[];
    treatment: string[];
    prevention: string[];
};

export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export type ChatRequest = {
    crop: string;
    disease: string;
    context: DiseaseContext;
    messages: ChatMessage[];
};

export type ChatResponse = {
    reply: string;
};