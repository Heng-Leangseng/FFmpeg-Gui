import React from 'react';

interface ErrorProps {
  onReset: () => void;
}

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
    <path d="M12 4v10M12 18v2" />
  </svg>
);

const RotateCcwIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M4 12h14M13 6l6 6-6 6" />
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M8 5l11 7-11 7z" />
  </svg>
);

export const Error: React.FC<ErrorProps> = ({ onReset }) => {
  return (
    <div className="s">
      <div className="h">
        <div className="lg" style={{ marginLeft: '52px' }}>
          <i><LogoIcon /></i>
          <span>FFmpeg-<b>Gui</b></span>
        </div>
      </div>
      <div className="c error-card" style={{ borderColor: '#F2877A', padding: '20px' }}>
        <div style={{ width: '56px', height: '56px', background: '#F2877A', color: '#0A1622', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', borderRadius: '0' }}>
          <ErrorIcon />
        </div>
        <h1 className="t" style={{ fontSize: '28px', marginTop: '18px' }}>Compression failed</h1>
        <p className="d">Something went wrong while processing this video. Try again, or choose a different file or setting.</p>
      </div>
      <div className="c">
        <div className="k" style={{ marginBottom: '12px' }}>Input file</div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div className="f f-small" style={{ width: '48px', height: '48px' }}><FileIcon /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nm" style={{ fontSize: '16px' }}>video.mp4</div>
            <div className="m error-text" style={{ fontSize: '12px', marginTop: '4px' }}>Stopped at 42%</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button className="b" onClick={onReset}>
        <RotateCcwIcon />Try again
      </button>
      <button className="b g" onClick={onReset}>Choose another video</button>
    </div>
  );
};