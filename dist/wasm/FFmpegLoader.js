/**
 * FFmpegLoader - Async loader for WASM module
 */
import { Logger } from '../utils/Logger';
// Static import of the generated module (bundled into index.js)
// @ts-ignore - movi.js is Emscripten-generated, no types available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import createMoviModule from '../../dist/wasm/movi.js';
const TAG = 'FFmpegLoader';
let modulePromise = null;
let loadedModule = null;
// Embedded WASM binary (will be set if WASM is bundled)
let embeddedWasmBinary = null;
/**
 * Load the WASM module (cached singleton for main playback)
 */
export async function loadWasmModule(options = {}) {
    if (loadedModule) {
        return loadedModule;
    }
    if (modulePromise) {
        return modulePromise;
    }
    modulePromise = (async () => {
        Logger.info(TAG, 'Loading WASM module...');
        // With SINGLE_FILE, WASM is embedded in movi.js, so wasmBinary is optional
        const wasmBinary = options.wasmBinary || embeddedWasmBinary;
        try {
            // Static import - movi.js is bundled into index.js
            const createModule = createMoviModule;
            // Create module - with SINGLE_FILE, WASM is embedded, so wasmBinary is optional
            const moduleOptions = {
                print: (text) => {
                    if (text && text.trim()) {
                        Logger.debug('WASM', text);
                    }
                },
                printErr: (text) => {
                    if (text && text.trim()) {
                        // FFmpeg uses stderr for all logging, including info/debug
                        // Map to debug to avoid flooding console with "errors"
                        Logger.debug('WASM', text);
                    }
                }
            };
            if (wasmBinary) {
                moduleOptions.wasmBinary = wasmBinary;
            }
            const module = await createModule(moduleOptions);
            Logger.info(TAG, 'WASM module loaded successfully');
            if (module.FS) {
                Logger.debug(TAG, 'FS is present on module');
            }
            else {
                Logger.error(TAG, 'FS is MISSING from module!');
            }
            loadedModule = module;
            return module;
        }
        catch (error) {
            Logger.error(TAG, 'Failed to load WASM module', error);
            modulePromise = null;
            throw error;
        }
    })();
    return modulePromise;
}
/**
 * Load a NEW WASM module instance (not cached).
 * Use this for preview pipeline to get completely isolated WASM memory.
 * Each call creates a separate WebAssembly.Memory - no sharing with main module.
 */
export async function loadWasmModuleNew(options = {}) {
    Logger.info(TAG, 'Loading NEW WASM module instance (isolated)...');
    const wasmBinary = options.wasmBinary || embeddedWasmBinary;
    try {
        const createModule = createMoviModule;
        const moduleOptions = {
            print: (text) => {
                if (text && text.trim()) {
                    Logger.debug('WASM', text);
                }
            },
            printErr: (text) => {
                if (text && text.trim()) {
                    Logger.debug('WASM', text);
                }
            }
        };
        if (wasmBinary) {
            moduleOptions.wasmBinary = wasmBinary;
        }
        // Always create fresh instance - no caching
        const module = await createModule(moduleOptions);
        Logger.info(TAG, 'NEW WASM module instance loaded');
        return module;
    }
    catch (error) {
        Logger.error(TAG, 'Failed to load new WASM module', error);
        throw error;
    }
}
/**
 * Get the loaded module (throws if not loaded)
 */
export function getWasmModule() {
    if (!loadedModule) {
        throw new Error('WASM module not loaded. Call loadWasmModule first.');
    }
    return loadedModule;
}
/**
 * Check if module is loaded
 */
export function isWasmModuleLoaded() {
    return loadedModule !== null;
}
//# sourceMappingURL=FFmpegLoader.js.map