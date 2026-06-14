import OpenAI from "openai";
import { IOpenAIService } from "./IOpenAIService";
import env from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export class OpenAIService implements IOpenAIService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({ apiKey: env.openaiApiKey });
    }

    async embed(text: string): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: env.openaiEmbeddingModel,
                input: text,
            });
            return response.data[0].embedding;
        } catch (err) {
            throw new ApiError(500, `OpenAI embed failed: ${(err as Error).message}`);
        }
    }

    async chat(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: env.openaiChatModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
            });
            return response.choices[0].message.content ?? "";
        } catch (err) {
            throw new ApiError(500, `OpenAI chat failed: ${(err as Error).message}`);
        }
    }
}
