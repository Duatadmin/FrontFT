declare module 'zustand' {
  export type StateCreator<T = any, A extends any[] = [], B extends any[] = [], C = any> = (
    set: any,
    get: any,
    api?: any,
    ...a: any[]
  ) => any;

  export function create<T>(creator: StateCreator<T>): () => T;
  export function create<T>(): (creator: StateCreator<T>) => () => T;
}

declare module 'zustand/middleware' {
  import type { StateCreator } from 'zustand';
  export function devtools<T>(fn: StateCreator<T>, options?: any): StateCreator<T>;
  export function persist<T>(fn: StateCreator<T>, options: any): StateCreator<T>;
}
