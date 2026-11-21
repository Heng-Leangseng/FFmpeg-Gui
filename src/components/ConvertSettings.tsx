import React, { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { VideoFileSummary } from './VideoFileSummary';
import { useVideoMetadata } from '../hooks/useVideoMetadata';
import { FORMAT_OPTIONS, type TargetFormat } from '../config/formats';

interface ConvertSettingsProps {
  file: File;
  initialFormat: TargetFormat;
  onNext: (format: TargetFormat) => void;
  onBack: () => void;
}

export const ConvertSettings: React.FC<ConvertSettingsProps> = ({ file, initialFormat, onNext, onBack }) => {
  const [format, setFormat] = useState(initialFormat);
  const metadata = useVideoMetadata(file);

  return (
    <div className="s">
      <ToolHeader />
      <div className="k">Convert Media</div>
      <VideoFileSummary file={file} metadata={metadata} hint="Ready to convert" onRemove={onBack} />
      <div className="c">
        <div className="k" style={{ marginBottom: '12px' }}>Output format</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === format ? 'b' : 'b g'}
              onClick={() => setFormat(option.id)}
              style={{ height: '52px', fontSize: '14px' }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b g" onClick={onBack} style={{ marginBottom: '8px' }}>Back</button>
      <button className="b" onClick={() => onNext(format)}>Convert</button>
    </div>
  );
};
