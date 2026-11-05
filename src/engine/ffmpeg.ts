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

    this.ffmpeg = new FFmpeg();

    if (onLog) {
      this.logHandler = (event: { message: string }) => {
        onLog(event.message);
      };
      this.ffmpeg.on('log', this.logHandler);
    }

    const baseURL = '/ffmpeg-core/';

    try {
      const coreURL = await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm');

      await this.ffmpeg.load({ coreURL, wasmURL });
    } catch (e) {
      console.error('[FFmpegEngine] Load failed:', e);
      throw e;
    }

    this.loaded = true;
  }

  async compress(
    inputFile: File,
    options: CompressOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error('FFmpeg not loaded');
    }

    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    const data = await fetchFile(inputFile);
    await this.ffmpeg.writeFile(inputName, data);

    let progressValue = 0;
    this.progressHandler = (event: { progress: number }) => {
      progressValue = Math.max(0, Math.min(1, event.progress));
      if (onProgress) {
        onProgress(progressValue);
      }
    };
    this.ffmpeg.on('progress', this.progressHandler);

    try {
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

      const outputData = await this.ffmpeg.readFile(outputName);
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