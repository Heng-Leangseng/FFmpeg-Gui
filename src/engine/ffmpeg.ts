import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface CompressOptions {
  crf: number;
  preset: string;
}

export class FFmpegEngine {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private logHandler: ((event: { message: string }) => void) | null = null;
  private progressHandler: ((event: { progress: number }) => void) | null = null;

  async load(onLog?: (message: string) => void): Promise<void> {
    if (this.loaded && this.ffmpeg) return;

    console.log('[FFmpegEngine] Creating FFmpeg instance...');
    this.ffmpeg = new FFmpeg();

    if (onLog) {
      this.logHandler = (event: { message: string }) => {
        onLog(event.message);
      };
      this.ffmpeg.on('log', this.logHandler);
      console.log('[FFmpegEngine] Log handler registered');
    }

    // Use local core files served from the same origin
    const baseURL = '/ffmpeg-core/';
    console.log('[FFmpegEngine] Loading core from:', baseURL);
    
    try {
      console.log('[FFmpegEngine] Fetching core.js...');
      const coreURL = await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript');
      console.log('[FFmpegEngine] core.js blob URL:', coreURL);
      
      console.log('[FFmpegEngine] Fetching core.wasm...');
      const wasmURL = await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm');
      console.log('[FFmpegEngine] core.wasm blob URL:', wasmURL);
      
      console.log('[FFmpegEngine] Calling ffmpeg.load()...');
      await this.ffmpeg.load({
        coreURL,
        wasmURL,
      });
      console.log('[FFmpegEngine] ffmpeg.load() completed');
    } catch (e) {
      console.error('[FFmpegEngine] Load failed:', e);
      throw e;
    }

    this.loaded = true;
    console.log('[FFmpegEngine] Load complete');
  }

  async compress(
    inputFile: File,
    options: CompressOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error('FFmpeg not loaded');
    }

    console.log('[FFmpegEngine] Starting compression...');
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    const data = await fetchFile(inputFile);
    const inputSize = data instanceof Uint8Array ? data.byteLength : (data as string).length;
    console.log('[FFmpegEngine] Input file size:', inputSize);
    await this.ffmpeg.writeFile(inputName, data);
    console.log('[FFmpegEngine] Input file written to FS');

    let progressValue = 0;
    this.progressHandler = (event: { progress: number }) => {
      progressValue = Math.max(0, Math.min(1, event.progress));
      console.log('[FFmpegEngine] Progress:', progressValue);
      if (onProgress) {
        onProgress(progressValue);
      }
    };
    this.ffmpeg.on('progress', this.progressHandler);

    try {
      console.log('[FFmpegEngine] Executing FFmpeg command...');
      await this.ffmpeg.exec([
        '-hide_banner',
        '-y',
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', options.preset,
        '-crf', options.crf.toString(),
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        outputName
      ]);
      console.log('[FFmpegEngine] FFmpeg exec completed');

      const outputData = await this.ffmpeg.readFile(outputName);
      const outputSize = outputData instanceof Uint8Array ? outputData.byteLength : (outputData as string).length;
      console.log('[FFmpegEngine] Output size:', outputSize);
      return outputData as Uint8Array;
    } finally {
      if (this.progressHandler) {
        this.ffmpeg.off('progress', this.progressHandler);
        this.progressHandler = null;
      }
    }
  }

  async cancel(): Promise<void> {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (e) {
        // ignore
      }
      this.ffmpeg = null;
      this.loaded = false;
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const ffmpegEngine = new FFmpegEngine();