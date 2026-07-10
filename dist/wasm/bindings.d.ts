/**
 * Bindings - High-level TypeScript bindings for WASM functions with Asyncify
 *
 * Uses async I/O callbacks instead of WORKERFS.
 */
import type { MoviWasmModule, StreamInfo, PacketInfo } from "./types";
import { LogLevel } from "../utils/Logger";
/**
 * Data source interface for async I/O
 */
export interface DataSource {
    /** Get total file size */
    getSize(): Promise<number>;
    /** Read data at offset */
    read(offset: number, size: number): Promise<Uint8Array>;
}
/**
 * WasmBindings - High-level interface to WASM functions with Asyncify
 */
export declare class WasmBindings {
    private module;
    private contextPtr;
    private packetBuffer;
    private packetBufferSize;
    private dataSource;
    private fileSize;
    private lastError;
    constructor(module: MoviWasmModule);
    /**
     * Map FFmpeg AVERROR codes to user-friendly messages
     */
    private getHumanReadableError;
    /**
     * Setup async I/O handlers for Asyncify callbacks
     */
    private setupAsyncHandlers;
    /**
     * Fulfill a pending read request
     */
    private fulfillRead;
    /**
     * Fulfill a pending seek request
     * newPosition must be a BigInt for files >= 2GB to maintain precision
     */
    private fulfillSeek;
    /**
     * Set the data source for async I/O
     */
    setDataSource(source: DataSource): void;
    /**
     * Set file size (required before open for proper seeking)
     * @param size File size in bytes
     */
    setFileSize(size: number): void;
    /**
     * Create a new demuxer context
     */
    create(): boolean;
    /**
     * Destroy the demuxer context
     */
    destroy(): void;
    /**
     * Open media from data source (async due to Asyncify)
     * Returns the number of streams found
     */
    open(): Promise<number>;
    /**
     * Get media duration in seconds
     */
    getDuration(): number;
    /**
     * Get Media Time(PTS) start time in seconds
     */
    getStartTime(): number;
    /**
     * Get container format name (e.g., "mov,mp4,m4a,3gp,3g2,mj2")
     */
    getFormatName(): string;
    /**
     * Get title from metadata
     */
    getMetadataTitle(): string;
    /**
     * Get number of streams
     */
    getStreamCount(): number;
    /**
     * Get stream info
     */
    getStreamInfo(streamIndex: number): StreamInfo | null;
    /**
     * Get extradata for a stream
     */
    getExtradata(streamIndex: number): Uint8Array | null;
    /**
     * Read the cached attached_pic data for a stream — typically a full
     * PNG/JPEG file extracted from ID3v2 APIC, FLAC PICTURE, MP4 covr atom
     * or Matroska attachment. Returns null when the stream has no attached
     * picture (i.e. it's a real video stream, not embedded cover art).
     *
     * Size is read from StreamInfo.bitRate of the synthetic attached_pic
     * stream — FFmpeg stores it via codecpar->bit_rate when populating the
     * picture, but to keep the JS side oblivious of that detail we use a
     * growing buffer: start at 1 MB (covers ~all real cover art), grow on
     * ENOBUFS up to a sane cap.
     */
    getAttachedPicData(streamIndex: number): Uint8Array | null;
    /**
     * Get number of chapters in the media
     */
    getChapterCount(): number;
    /**
     * Get all chapters from the media
     */
    getChapters(): Array<{
        title: string;
        start: number;
        end: number;
    }>;
    /**
     * Seek to timestamp (async due to Asyncify)
     */
    seek(timestamp: number, streamIndex?: number, flags?: number): Promise<void>;
    /**
     * Read next frame/packet (async due to Asyncify)
     */
    readFrame(): Promise<{
        info: PacketInfo;
        data: Uint8Array;
    } | null>;
    /**
     * Set log level (FFmpeg log level constant)
     */
    setLogLevel(level: number): void;
    /**
     * Set log level from MoviPlayer LogLevel enum
     */
    setLogLevelFromMovi(level: LogLevel): void;
    enableDecoder(streamIndex: number, extradata?: Uint8Array): number;
    sendPacket(streamIndex: number, data: Uint8Array, pts: number, dts: number, keyframe: boolean): number;
    receiveFrame(streamIndex: number): number;
    /**
     * Decode a subtitle packet
     */
    decodeSubtitle(streamIndex: number, data: Uint8Array, timestamp: number, duration?: number): Promise<number>;
    /**
     * Get decoded subtitle text
     */
    getSubtitleText(): Promise<string | null>;
    /**
     * Get subtitle start and end times
     */
    getSubtitleTimes(): Promise<{
        start: number;
        end: number;
    } | null>;
    /**
     * Scan the entire subtitle stream and return every cue at once. Used to
     * support negative subtitle delay, where the renderer needs cues from
     * stream positions ahead of the demuxer's natural read cursor. Leaves
     * the demuxer at EOF — the caller must seek back to playback position.
     * Returns the array of cues, or null on failure.
     */
    prefetchSubtitleCues(streamIndex: number): Promise<{
        start: number;
        end: number;
        text: string;
    }[] | null>;
    /**
     * Get subtitle image info (for bitmap/image subtitles like PGS)
     * Returns { width, height, x, y } or null if not an image subtitle
     */
    getSubtitleImageInfo(): Promise<{
        width: number;
        height: number;
        x: number;
        y: number;
    } | null>;
    /**
     * Get subtitle image data as RGBA (for bitmap/image subtitles like PGS)
     * Returns Uint8Array with RGBA data or null if not an image subtitle
     */
    getSubtitleImageData(): Promise<Uint8Array | null>;
    /**
     * Free decoded subtitle
     */
    freeSubtitle(): Promise<void>;
    getFrameWidth(): number;
    getFrameHeight(): number;
    getFrameFormat(): number;
    getFrameLinesize(plane: number): number;
    getFrameSamples(): number;
    getFrameChannels(): number;
    getFrameSampleRate(): number;
    getFrameDataPointer(plane: number): number;
    enableAudioDownmix(enable: boolean): void;
    /**
     * Get the context pointer (for remuxer)
     */
    getContextPtr(): number;
    getFramePts(streamIndex: number): number;
    flushDecoder(streamIndex: number): void;
    /**
     * Get decoded frame as RGBA data (converts any format including 10-bit HDR)
     * This is useful for software decoding where YUV output is in non-standard formats
     */
    getFrameRGBA(targetWidth?: number, targetHeight?: number): Uint8Array | null;
    /**
     * Set frames to skip during decoding
     * 0: None, 1: NonRef, 2: Bidir, 3: NonKey, 4: All
     */
    setSkipFrame(trackIndex: number, skip: number): void;
}
/**
 * Update FFmpeg log level for all active WasmBindings instances
 * This is called when MoviPlayer.setLogLevel() is invoked
 */
export declare function updateAllBindingsLogLevel(level: LogLevel): void;
/**
 * ThumbnailBindings - Fast thumbnail generation using FFmpeg software decoding
 * Separate from main playback, uses its own demuxer and decoder context.
 */
export declare class ThumbnailBindings {
    private module;
    private contextPtr;
    private dataSource;
    private isOpened;
    private lastPacketPts;
    constructor(module: MoviWasmModule);
    /**
     * Set FFmpeg log level
     * @param level FFmpeg log level constant (e.g. AV_LOG_DEBUG)
     */
    setLogLevel(level: number): void;
    /**
     * Set log level from MoviPlayer LogLevel enum
     */
    setLogLevelFromMovi(level: LogLevel): void;
    /**
     * Setup async I/O handlers for thumbnail context
     */
    private setupAsyncHandlers;
    private fulfillRead;
    private fulfillSeek;
    setDataSource(dataSource: DataSource): void;
    create(fileSize: number): Promise<boolean>;
    open(): Promise<boolean>;
    /**
     * Seek and read keyframe at timestamp
     * Uses callback pattern - C calls JS when packet is ready
     */
    readKeyframe(timestamp: number): Promise<number>;
    /**
     * Get packet data pointer
     */
    getPacketData(): number;
    /**
     * Get a copy of the packet data from THIS module's memory
     * This is important because ThumbnailBindings uses an isolated WASM module
     */
    getPacketDataCopy(size: number): Uint8Array | null;
    /**
     * Get last packet PTS (from callback)
     */
    getPacketPts(): number;
    /**
     * Get stream info with HDR metadata (like main pipeline)
     */
    getStreamInfo(): StreamInfo | null;
    /**
     * Get extradata for the video stream
     */
    getExtradata(): Uint8Array | null;
    /**
     * Decode current packet to YUV (preserves HDR)
     */
    decodeCurrentPacketYUV(): {
        width: number;
        height: number;
        yPlane: Uint8Array;
        uPlane: Uint8Array;
        vPlane: Uint8Array;
        yStride: number;
        uStride: number;
        vStride: number;
    } | null;
    /**
     * Decode current packet (software fallback - SDR RGBA)
     */
    decodeCurrentPacket(width: number, height: number): Uint8Array | null;
    /**
     * Clear RGB buffer to free memory after thumbnail is copied
     * Call this after creating the ImageData/Blob to release memory
     */
    clearBuffer(): void;
    /**
     * Destroy thumbnail context
     */
    destroy(): void;
}
//# sourceMappingURL=bindings.d.ts.map