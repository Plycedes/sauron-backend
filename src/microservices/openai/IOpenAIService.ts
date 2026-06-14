export interface IOpenAIService {
    embed(text: string): Promise<number[]>;
    chat(systemPrompt: string, userPrompt: string): Promise<string>;
}
