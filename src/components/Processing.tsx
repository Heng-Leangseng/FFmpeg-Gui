import React from 'react';
import { formatFileName } from '../utils/formatFileName';

interface ProcessingProps {
  progress: number;
  onCancel: () => void;
  file?: File | null;
  metadata?: { duration?: number; width?: number; height?: number };
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

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const Processing: React.FC<ProcessingProps> = ({ progress, onCancel, file, metadata }) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clamped * 100);

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
        <div className="k">Compressing</div>
        <div className="m" style={{ fontSize: '88px', fontWeight: 700, lineHeight: 1, color: '#3E92CC', margin: '10px 0 18px', letterSpacing: '-0.04em' }}>
          {percent}%
        </div>
        <div className="progress-bar-container" style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${clamped * 100}%`,
              background: '#3E92CC',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: '#B4C8D9', textAlign: 'center', marginTop: '8px' }}>
          Progress may be approximate
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onCancel}>
        <CrossIcon />Cancel
      </button>
    </div>
  );
};