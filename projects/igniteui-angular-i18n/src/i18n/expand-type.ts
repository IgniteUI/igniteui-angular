/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @internal
 * Removes 'optional' attributes making properties required
 */
type MakeRequired<T> = { [K in keyof T]-?: T[K] };
