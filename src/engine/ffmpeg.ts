import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface CompressOptions {
  crf: number;
  preset: string;
}

const VIDEO_EXTENSION = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i;

const inputNameFor = (file: File): string => {
  const match = file.name.match(VIDEO_EXTENSION);
  return `input${match ? match[0].toLowerCase() : '.mp4'}`;
};

export function buildAtempo(factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new Error('Invalid speed factor');
  }

  const filters: string[] = [];
  let remaining = factor;

  while (remaining > 2) {
    filters.push('atempo=2');
    remaining /= 2;
  }

  while (remaining < 0.5) {
    filters.push('atempo=0.5');
    remaining /= 0.5;
  }

  filters.push(`atempo=${remaining.toFixed(5)}`);
  return filters.join(',');
}

export class FFmpegEngine {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private logHandler: ((event: { message: string }) => void) | null = null;

  async load(onLog?: (message: string) => void): Promise<void> {
    if (this.loaded && this.ffmpeg) return;

    this.ffmpeg = new FFmpeg();

    if (onLog) {
      this.logHandler = (event: { message: string }) => {
        onLog(event.message);
      };
      this.ffmpeg.on('log', this.logHandler);
    }

    const baseURL = `${import.meta.env.BASE_URL}ffmpeg-core/`;

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

  private async runJob(
    inputFile: File,
    outputName: string,
    args: string[],
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    const ffmpeg = this.ffmpeg;
    if (!ffmpeg || !this.loaded) {
      throw new Error('FFmpeg not loaded');
    }

    const inputName = inputNameFor(inputFile);
    const data = await fetchFile(inputFile);
    await ffmpeg.writeFile(inputName, data);

    const progressHandler = (event: { progress: number }) => {
      const progressValue = Math.max(0, Math.min(1, event.progress));
      if (onProgress) {
        onProgress(progressValue);
      }
    };
    ffmpeg.on('progress', progressHandler);

    try {
      const exitCode = await ffmpeg.exec([
        '-hide_banner',
        '-y',
        '-i', inputName,
        ...args,
        outputName,
      ]);

      if (exitCode !== 0) {
        throw new Error(`FFmpeg exited with code ${exitCode}`);
      }

      const outputData = await ffmpeg.readFile(outputName);
      return outputData as Uint8Array;
    } finally {
      ffmpeg.off('progress', progressHandler);
      try {
        await ffmpeg.deleteFile(inputName);
      } catch {
        // worker may already be terminated after a cancel
      }
      try {
        await ffmpeg.deleteFile(outputName);
      } catch {
        // worker may already be terminated after a cancel
      }
    }
  }

  async compress(
    inputFile: File,
    options: CompressOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    return this.runJob(
      inputFile,
      'output.mp4',
      [
        '-c:v', 'libx264',
        '-preset', options.preset,
        '-crf', options.crf.toString(),
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
      ],
      onProgress
    );
  }

  async changeSpeed(
    inputFile: File,
    factor: number,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    return this.runJob(
      inputFile,
      'output.mp4',
      [
        '-filter:v', `setpts=PTS/${factor}`,
        '-filter:a', buildAtempo(factor),
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
      ],
      onProgress
    );
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
