export type { AuthMetadata } from "./AuthMetadata"

export type StandardJsonResponse<T extends Record<string, any> = Record<string, string>> = {
    success: boolean,
    message?: string,
    metadata: T
}