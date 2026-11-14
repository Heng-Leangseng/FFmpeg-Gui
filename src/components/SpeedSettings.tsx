import React, { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { VideoFileSummary } from './VideoFileSummary';
import { useVideoMetadata } from '../hooks/useVideoMetadata';

interface SpeedSettingsProps {
  file: File;
  initialFactor: number;
  onNext: (factor: number) => void;
  onBack: () => void;
}

const SPEED_PRESETS = [0.5, 1, 1.5, 2];

export const SpeedSettings: React.FC<SpeedSettingsProps> = ({ file, initialFactor, onNext, onBack }) => {
  const [factor, setFactor] = useState(initialFactor);
  const metadata = useVideoMetadata(file);

  return (
    <div className="s">
      <ToolHeader />
      <div className="k">Change Speed</div>
      <VideoFileSummary file={file} metadata={metadata} hint="Ready to change speed" onRemove={onBack} />
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
