import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export interface CompressOptions {
  crf: number;
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

export interface LoadProgress {
  loaded: number;
  total: number;
  phase: 'download' | 'starting';
}

async function fetchToBlobURL(
  url: string,
  mime: string,
  signal: AbortSignal,
  onBytes: (loaded: number) => void
): Promise<{ url: string; bytes: number }> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

  const chunks: BlobPart[] = [];
  let loaded = 0;

  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        onBytes(loaded);
      }
    }
  } else {
    const buffer = new Uint8Array(await response.arrayBuffer());
    chunks.push(buffer);
    loaded = buffer.byteLength;
    onBytes(loaded);
  }

  return {
    url: URL.createObjectURL(new Blob(chunks, { type: mime })),
    bytes: loaded,
  };
}

export class FFmpegEngine {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private logHandler: ((event: { message: string }) => void) | null = null;
  private loadAbort: AbortController | null = null;

  async load(
    onLog?: (message: string) => void,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<void> {
    if (this.loaded && this.ffmpeg) return;

    this.ffmpeg = new FFmpeg();

    if (onLog) {
      this.logHandler = (event: { message: string }) => {
        onLog(event.message);
      };
      this.ffmpeg.on('log', this.logHandler);
    }

    const baseURL = `${import.meta.env.BASE_URL}ffmpeg-core/`;
    const files = [
      { url: `${baseURL}ffmpeg-core.js`, type: 'text/javascript' },
      { url: `${baseURL}ffmpeg-core.wasm`, type: 'application/wasm' },
    ];

    const controller = new AbortController();
    this.loadAbort = controller;

    let coreURL = '';
    let wasmURL = '';
    const blobURLs: string[] = [];

    try {
      let total = 0;
      try {
        const sizes = await Promise.all(
          files.map(async (f) => {
            const res = await fetch(f.url, { method: 'HEAD', signal: controller.signal });
            return res.ok ? Number(res.headers.get('content-length')) || 0 : 0;
          })
        );
        if (sizes.every((s) => s > 0)) {
          total = sizes.reduce((a, b) => a + b, 0);
        }
      } catch {
        // HEAD unavailable; total stays 0 (unknown)
      }

      let completed = 0;
      let lastPercent = -1;

      for (const f of files) {
        const { url, bytes } = await fetchToBlobURL(
          f.url,
          f.type,
          controller.signal,
          (loaded: number) => {
            if (total > 0) {
              const pct = Math.floor(((completed + loaded) / total) * 100);
              if (pct !== lastPercent) {
                lastPercent = pct;
                onProgress?.({ loaded: completed + loaded, total, phase: 'download' });
              }
            }
          }
        );
        completed += bytes;
        blobURLs.push(url);
        if (f.url.endsWith('ffmpeg-core.js')) coreURL = url;
        else wasmURL = url;
      }

      if (total > 0) {
        onProgress?.({ loaded: total, total, phase: 'starting' });
      }

      await this.ffmpeg.load({ coreURL, wasmURL });
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // cancel() was called; swallow so caller can handle
        throw e;
      }
      console.error('[FFmpegEngine] Load failed:', e);
      if (this.ffmpeg) {
        try { await this.ffmpeg.terminate(); } catch { /* ignore */ }
        this.ffmpeg = null;
      }
      throw e;
    } finally {
      for (const u of blobURLs) URL.revokeObjectURL(u);
      blobURLs.length = 0;
      this.loadAbort = null;
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
        '-preset', 'veryfast',
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
    this.loadAbort?.abort();
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
