import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
    PORT: Joi.number().default(5000),
    CORS: Joi.string().default("*"),
    NODE_ENV: Joi.string().required(),
    MONGODB_URI: Joi.string().required(),

    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default("7d"),

    OPENAI_API_KEY: Joi.string().required(),
    OPENAI_EMBEDDING_MODEL: Joi.string().default("text-embedding-3-small"),
    OPENAI_CHAT_MODEL: Joi.string().default("gpt-4o"),
}).unknown(); // allow extra env vars

const { value: envVars, error } = envSchema.validate(process.env, {
    abortEarly: false,
});

if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
}

const env = {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
    cors: envVars.CORS,
    mongodbURI: envVars.MONGODB_URI,

    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN,

    cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
    cloudinaryAPIKey: envVars.CLOUDINARY_API_KEY,
    cloudinaryAPISecret: envVars.CLOUDINARY_API_SECRET,

    openaiApiKey: envVars.OPENAI_API_KEY,
    openaiEmbeddingModel: envVars.OPENAI_EMBEDDING_MODEL,
    openaiChatModel: envVars.OPENAI_CHAT_MODEL,
};

export default env;
