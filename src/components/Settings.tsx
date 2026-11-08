import React, { useEffect, useState } from 'react';
import { formatFileName } from '../utils/formatFileName';

interface SettingsProps {
  file: File;
  onNext: (crf: number, preset: string) => void;
  onBack: () => void;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const FileIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24">
    <path d="M8 5l11 7-11 7z" />
  </svg>
);

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const Settings: React.FC<SettingsProps> = ({ file, onNext, onBack }) => {
  const [crf, setCrf] = useState(30);
  const [preset, setPreset] = useState('veryfast');
  const [metadata, setMetadata] = useState<{ duration?: number; width?: number; height?: number }>({});

  const presets = [
    { value: 'ultrafast', label: 'ultrafast' },
    { value: 'superfast', label: 'superfast' },
    { value: 'veryfast', label: 'veryfast' },
    { value: 'faster', label: 'faster' },
    { value: 'fast', label: 'fast' },
    { value: 'medium', label: 'medium' },
    { value: 'slow', label: 'slow' },
    { value: 'slower', label: 'slower' },
    { value: 'veryslow', label: 'veryslow' },
  ];

  useEffect(() => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setMetadata({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  }, [file]);



  return (
    <div className="s">
      <div className="h">
        <div className="lg" style={{ marginLeft: '52px' }}>
          <i><LogoIcon /></i>
          <span>FFmpeg-<b>Gui</b></span>
        </div>
      </div>
      <div className="k">Compress Video</div>
      <div className="c" style={{ marginTop: '-6px' }}>
        <div className="k" style={{ marginBottom: '12px' }}>Input file</div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div className="f"><FileIcon /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nm" title={file.name}>{formatFileName(file.name)}</div>
            <div className="m" style={{ fontSize: '13px', color: '#B4C8D9', marginTop: '4px' }}>
              {metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : 'Ready to compress'}
            </div>
          </div>
          <button className="ib" aria-label="Remove file" onClick={onBack}><CloseIcon /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '8px', marginTop: '14px' }}>
          <div className="st">
            <div className="k">Size</div>
            <div><span className="m">{formatSize(file.size)}</span></div>
          </div>
          <div className="st">
            <div className="k">Length</div>
            <div><span className="m">{formatDuration(metadata.duration)}</span></div>
          </div>
          <div className="st">
            <div className="k">Resolution</div>
            <div><span className="m">{metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : 'Unknown'}</span></div>
          </div>
        </div>
      </div>
      <div className="c">
        <div className="k" style={{ marginBottom: '12px' }}>Compression</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#B4C8D9' }}>Smaller</span>
          <input
            type="range"
            min="28"
            max="32"
            step="0.1"
            value={crf}
            onChange={(e) => setCrf(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '14px', color: '#B4C8D9' }}>Better quality</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}>{Math.round(crf) === 28 ? 'Smaller' : Math.round(crf) === 32 ? 'Better quality' : Math.round(crf) === 30 ? 'Balanced' : Math.round(crf) < 30 ? 'Smaller' : 'Better quality'}</div>
      </div>
      <div className="c">
        <div className="k" style={{ marginBottom: '12px' }}>Speed</div>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          style={{
            height: '48px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            font: '600 15px var(--sans)',
            padding: '0 12px',
            borderRadius: '0',
          }}
        >
          {presets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onBack} style={{ marginBottom: '8px' }}>Back</button>
      <button className="b" onClick={() => onNext(crf, preset)}>Compress</button>
    </div>
  );
};

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);