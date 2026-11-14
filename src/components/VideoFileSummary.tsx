import React from 'react';
import { FileIcon, CloseIcon } from './icons';
import { formatFileName } from '../utils/formatFileName';
import { formatSize } from '../utils/formatSize';
import { formatDuration } from '../utils/formatDuration';
import type { VideoMetadata } from '../hooks/useVideoMetadata';

interface VideoFileSummaryProps {
  file: File;
  metadata: VideoMetadata;
  hint: string;
  onRemove: () => void;
}

export const VideoFileSummary: React.FC<VideoFileSummaryProps> = ({ file, metadata, hint, onRemove }) => (
  <div className="c" style={{ marginTop: '-6px' }}>
    <div className="k" style={{ marginBottom: '12px' }}>Input file</div>
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div className="f"><FileIcon /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="nm" title={file.name}>{formatFileName(file.name)}</div>
        <div className="m" style={{ fontSize: '13px', color: '#B4C8D9', marginTop: '4px' }}>
          {metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : hint}
        </div>
      </div>
      <button className="ib" aria-label="Remove file" onClick={onRemove}><CloseIcon /></button>
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
);
