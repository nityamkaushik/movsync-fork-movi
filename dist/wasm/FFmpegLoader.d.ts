/**
 * FFmpegLoader - Async loader for WASM module
 */
import type { MoviWasmModule } from './types';
export interface LoaderOptions {
    wasmBinary?: Uint8Array;
    workerPath?: string;
}
/**
 * Load the WASM module (cached singleton for main playback)
 */
export declare function loadWasmModule(options?: LoaderOptions): Promise<MoviWasmModule>;
/**
 * Load a NEW WASM module instance (not cached).
 * Use this for preview pipeline to get completely isolated WASM memory.
 * Each call creates a separate WebAssembly.Memory - no sharing with main module.
 */
export declare function loadWasmModuleNew(options?: LoaderOptions): Promise<MoviWasmModule>;
/**
 * Get the loaded module (throws if not loaded)
 */
export declare function getWasmModule(): MoviWasmModule;
/**
 * Check if module is loaded
 */
export declare function isWasmModuleLoaded(): boolean;
//# sourceMappingURL=FFmpegLoader.d.ts.map