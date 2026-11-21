export type TargetFormat = 'mp4' | 'webm' | 'mp3' | 'wav';

export const MEDIA_EXTENSION = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp|mp3|m4a|aac|wav|flac|ogg|opus|png|jpg|jpeg|webp|gif)$/i;

export const isSupportedMedia = (file: File): boolean => MEDIA_EXTENSION.test(file.name);

export interface FormatOption {
  id: TargetFormat;
  label: string;
  ext: string;
  mime: string;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'mp4', label: 'MP4 (H.264 + AAC)', ext: 'mp4', mime: 'video/mp4' },
  { id: 'webm', label: 'WebM (VP8 + Opus)', ext: 'webm', mime: 'video/webm' },
  { id: 'mp3', label: 'MP3', ext: 'mp3', mime: 'audio/mpeg' },
  { id: 'wav', label: 'WAV', ext: 'wav', mime: 'audio/wav' },
];

export const getFormat = (format: TargetFormat): FormatOption =>
  FORMAT_OPTIONS.find((option) => option.id === format) ?? FORMAT_OPTIONS[0];

export const formatMime = (format: TargetFormat): string => getFormat(format).mime;

export const formatExt = (format: TargetFormat): string => getFormat(format).ext;
