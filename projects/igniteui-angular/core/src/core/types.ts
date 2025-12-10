export type KeyOfOrString<T, K = keyof T> = K extends keyof T ? K : string;
