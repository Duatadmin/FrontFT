/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// ManagedMediaSource API declarations for iOS Safari 17+
declare global {
  interface Window {
    ManagedMediaSource?: typeof ManagedMediaSource;
  }

  class ManagedMediaSource extends MediaSource {
    constructor();
    readonly streaming: boolean;
    onstartstreaming: ((this: ManagedMediaSource, ev: Event) => any) | null;
    onendstreaming: ((this: ManagedMediaSource, ev: Event) => any) | null;
    static isTypeSupported(type: string): boolean;
    
    addEventListener(type: "startstreaming", listener: (this: ManagedMediaSource, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: "endstreaming", listener: (this: ManagedMediaSource, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof MediaSourceEventMap>(type: K, listener: (this: ManagedMediaSource, ev: MediaSourceEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener(type: "startstreaming", listener: (this: ManagedMediaSource, ev: Event) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: "endstreaming", listener: (this: ManagedMediaSource, ev: Event) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof MediaSourceEventMap>(type: K, listener: (this: ManagedMediaSource, ev: MediaSourceEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }
}
