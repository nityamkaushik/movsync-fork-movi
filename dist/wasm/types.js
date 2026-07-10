/**
 * WASM Types - Type definitions for WASM module with Asyncify
 */
// StreamInfo struct layout (matches C struct)
// 336 = end of color_range; +4 projection (336) +4 is_attached_pic placeholder
// (340); padded to 8-byte alignment (int64 bit_rate) → 344. Keep in sync with
// sizeof(StreamInfo) in movi.h after any field change, and clear
// node_modules/.vite after build:wasm so the new layout is picked up.
export const STREAM_INFO_SIZE = 344;
export const STREAM_INFO_OFFSETS = {
    index: 0,
    type: 4,
    codecId: 8,
    codecName: 12, // 32 bytes
    width: 44,
    height: 48,
    frameRate: 56, // double
    channels: 64,
    sampleRate: 68,
    duration: 72, // double
    bitRate: 80, // int64
    extradataSize: 88,
    profile: 92,
    level: 96,
    language: 100, // 8 bytes (char[8])
    label: 108, // 64 bytes (char[64])
    rotation: 172, // 4 bytes (int)
    colorPrimaries: 176, // 32 bytes
    colorTransfer: 208, // 32 bytes
    colorMatrix: 240, // 32 bytes
    pixelFormat: 272, // 32 bytes
    colorRange: 304, // 32 bytes
    projection: 336, // 4 bytes (int) — AVSphericalProjection+1, 0 = none
    isAttachedPic: 340, // 4 bytes (int)
};
// PacketInfo struct layout. Contains doubles (8-byte alignment), so the trailing
// is_idr(36)+is_rasl(40) ints pad the struct from 44 up to 48 bytes — keep this
// in sync with sizeof(PacketInfo) in movi.h.
export const PACKET_INFO_SIZE = 48;
export const PACKET_INFO_OFFSETS = {
    streamIndex: 0,
    keyframe: 4,
    timestamp: 8, // double
    dts: 16, // double
    duration: 24, // double
    size: 32,
    isIdr: 36, // int — occupies the padding after `size`
    isRasl: 40, // int
};
//# sourceMappingURL=types.js.map