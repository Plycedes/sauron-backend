import jwt from "jsonwebtoken";
import env from "../config/env";

export type TokenType = "access" | "refresh";

export interface JwtPayload {
    userId: string;
    role?: string;
    tokenType: TokenType;
}

function sign(
    payload: Omit<JwtPayload, "tokenType">,
    type: TokenType,
    secret: string,
    expiresIn: string
): string {
    return jwt.sign(
        { ...payload, tokenType: type },
        secret,
        { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
    );
}

export function generateAccessToken(payload: Omit<JwtPayload, "tokenType">): string {
    return sign(payload, "access", env.jwtAccessSecret, env.jwtAccessExpiresIn);
}

export function generateRefreshToken(payload: Omit<JwtPayload, "tokenType">): string {
    return sign(payload, "refresh", env.jwtRefreshSecret, env.jwtRefreshExpiresIn);
}

function verify(token: string, secret: string, expectedType: TokenType): JwtPayload {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (decoded.tokenType !== expectedType) {
        throw new Error(`Expected ${expectedType} token, got ${decoded.tokenType}`);
    }
    return decoded;
}

export function verifyAccessToken(token: string): JwtPayload {
    return verify(token, env.jwtAccessSecret, "access");
}

export function verifyRefreshToken(token: string): JwtPayload {
    return verify(token, env.jwtRefreshSecret, "refresh");
}