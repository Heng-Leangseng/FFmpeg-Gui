import React from 'react';
import { formatFileName } from '../utils/formatFileName';
import { formatSize } from '../utils/formatSize';
import type { LoadProgress } from '../engine/ffmpeg';

interface ProcessingProps {
  progress: number;
  onCancel: () => void;
  file?: File | null;
  metadata?: { duration?: number; width?: number; height?: number };
  title?: string;
  stage: 'loading' | 'processing';
  loadProgress: LoadProgress;
}

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M8 5l11 7-11 7z" />
  </svg>
);

const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Processing: React.FC<ProcessingProps> = ({
  progress,
  onCancel,
  file,
  metadata,
  title = 'Compressing',
  stage,
  loadProgress,
}) => {
  const isDownload = stage === 'loading' && loadProgress.phase === 'download';
  const isStarting = stage === 'loading' && loadProgress.phase === 'starting';
  const knownTotal = loadProgress.total > 0;

  const ratio = isDownload
    ? knownTotal
      ? Math.min(1, loadProgress.loaded / loadProgress.total)
      : 0
    : isStarting
    ? 1
    : Math.min(1, Math.max(0, progress));

  const label = isDownload ? 'Loading engine' : isStarting ? 'Starting engine' : title;
  const percentLabel = isDownload && !knownTotal ? null : Math.round(ratio * 100);

  return (
    <div className="s">
      <div className="h">
        <div className="lg" style={{ marginLeft: '52px' }}>
          <i><LogoIcon /></i>
          <span>FFmpeg-<b>Gui</b></span>
        </div>
      </div>
      <div className="c" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px' }}>
        <div className="f f-small" style={{ width: '48px', height: '48px' }}><FileIcon /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm" style={{ fontSize: '16px' }} title={file?.name}>{formatFileName(file?.name || 'video.mp4')}</div>
          <div className="m" style={{ fontSize: '12px', color: '#B4C8D9', marginTop: '4px' }}>
            {file ? `${formatSize(file.size)}${metadata?.width && metadata?.height ? ` · ${metadata.width}×${metadata.height}` : ''}` : '248.6 MB · 1920×1080'}
          </div>
        </div>
      </div>
      <div>
        <div className="k">{label}</div>
        <div className="processing-percent">
          {percentLabel === null ? '…' : `${percentLabel}%`}
        </div>
        <div className="progress-bar-container" style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${ratio * 100}%`,
              background: '#3E92CC',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: '#B4C8D9', textAlign: 'center', marginTop: '8px' }}>
          {isDownload
            ? knownTotal
              ? `${formatSize(loadProgress.loaded)} / ${formatSize(loadProgress.total)}`
              : `${formatSize(loadProgress.loaded)} downloaded`
            : isStarting
            ? 'Preparing video engine'
            : 'Progress may be approximate'}
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onCancel}>
        <CrossIcon />Cancel
      </button>
    </div>
  );
};