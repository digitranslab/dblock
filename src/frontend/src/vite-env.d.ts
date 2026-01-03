/// <reference types="vite/client" />

declare module "*.svg" {
  const content: string;
  export default content;
}

// Vitest globals for test files
declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function expect<T>(actual: T): {
    toBe(expected: T): void;
    toBeNull(): void;
    toEqual(expected: T): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toContain(expected: unknown): void;
    toHaveLength(expected: number): void;
    toThrow(expected?: string | RegExp): void;
    not: {
      toBe(expected: T): void;
      toBeNull(): void;
      toEqual(expected: T): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toContain(expected: unknown): void;
    };
  };
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
}
