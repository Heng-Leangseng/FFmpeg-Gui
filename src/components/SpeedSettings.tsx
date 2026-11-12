import React, { useEffect, useState } from 'react';
import { formatFileName } from '../utils/formatFileName';
import { formatSize } from '../utils/formatSize';

interface SpeedSettingsProps {
  file: File;
  initialFactor: number;
  onNext: (factor: number) => void;
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

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

const SPEED_PRESETS = [0.5, 1, 1.5, 2];

const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const SpeedSettings: React.FC<SpeedSettingsProps> = ({ file, initialFactor, onNext, onBack }) => {
  const [factor, setFactor] = useState(initialFactor);
  const [metadata, setMetadata] = useState<{ duration?: number; width?: number; height?: number }>({});

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
      <div className="k">Change Speed</div>
      <div className="c" style={{ marginTop: '-6px' }}>
        <div className="k" style={{ marginBottom: '12px' }}>Input file</div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div className="f"><FileIcon /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nm" title={file.name}>{formatFileName(file.name)}</div>
            <div className="m" style={{ fontSize: '13px', color: '#B4C8D9', marginTop: '4px' }}>
              {metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : 'Ready to change speed'}
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
        <div className="k" style={{ marginBottom: '12px' }}>Speed</div>
        <div style={{ textAlign: 'center', fontSize: '40px', fontWeight: 700, lineHeight: 1, color: '#3E92CC', margin: '4px 0 14px' }}>
          {factor}x
        </div>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={factor}
          onChange={(e) => setFactor(Number(e.target.value))}
          aria-label="Playback speed"
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#B4C8D9', marginTop: '4px' }}>
          <span>0.25x slower</span>
          <span>4x faster</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px' }}>
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={preset === factor ? 'b' : 'b g'}
              onClick={() => setFactor(preset)}
              style={{ height: '44px', fontSize: '14px' }}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onBack} style={{ marginBottom: '8px' }}>Back</button>
      <button className="b" onClick={() => onNext(factor)}>Change speed</button>
    </div>
  );
};
