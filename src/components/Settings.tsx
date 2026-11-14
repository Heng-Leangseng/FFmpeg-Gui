import React, { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { VideoFileSummary } from './VideoFileSummary';
import { useVideoMetadata } from '../hooks/useVideoMetadata';

interface SettingsProps {
  file: File;
  initialCrf: number;
  initialPreset: string;
  onNext: (crf: number, preset: string) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ file, initialCrf, initialPreset, onNext, onBack }) => {
  const [crf, setCrf] = useState(initialCrf);
  const [preset, setPreset] = useState(initialPreset);
  const metadata = useVideoMetadata(file);

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

  return (
    <div className="s">
      <ToolHeader />
      <div className="k">Compress Video</div>
      <VideoFileSummary file={file} metadata={metadata} hint="Ready to compress" onRemove={onBack} />
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
