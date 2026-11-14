import React, { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { VideoFileSummary } from './VideoFileSummary';
import { useVideoMetadata } from '../hooks/useVideoMetadata';

interface SettingsProps {
  file: File;
  initialCrf: number;
  onNext: (crf: number) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ file, initialCrf, onNext, onBack }) => {
  const [crf, setCrf] = useState(initialCrf);
  const metadata = useVideoMetadata(file);

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
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onBack} style={{ marginBottom: '8px' }}>Back</button>
      <button className="b" onClick={() => onNext(crf)}>Compress</button>
    </div>
  );
};
