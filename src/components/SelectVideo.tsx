import { useState, DragEvent, ChangeEvent } from 'react';

interface SelectVideoProps {
  onFileSelect: (file: File) => void;
}

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

const FileDropIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" />
    <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
  </svg>
);

const VIDEO_EXTENSION = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i;

const isVideoFile = (file: File) =>
  file.type.startsWith('video/') || VIDEO_EXTENSION.test(file.name);

export const SelectVideo: React.FC<SelectVideoProps> = ({ onFileSelect }) => {
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    if (isVideoFile(file)) {
      setError('');
      onFileSelect(file);
    } else {
      setError('That file is not a video. Choose an MP4, MOV, WebM, or similar.');
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  };

  return (
    <div className="s">
      <div className="h">
        <div className="lg" style={{ marginLeft: '52px' }}>
          <i><LogoIcon /></i>
          <span>FFmpeg-<b>Gui</b></span>
        </div>
      </div>
      <div>
        <h1 className="t" style={{ marginTop: '8px' }}>Compress Video</h1>
      </div>
      <label className="z" onDragOver={handleDragOver} onDrop={handleDrop}>
        <input
          type="file"
          className="z-input"
          accept="video/*,.mp4,.m4v,.mov,.webm,.mkv,.avi"
          onChange={handleChange}
          aria-label="Choose a video file"
        />
        <span style={{ width: '72px', height: '72px', background: '#18435A', color: '#3E92CC', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0' }}>
          <FileDropIcon />
        </span>
        <span style={{ fontSize: '22px', fontWeight: 700 }}>Choose a video</span>
        <span style={{ background: '#2A628F', color: '#fff', padding: '12px 22px', fontSize: '15px', fontWeight: 600, borderRadius: '0' }}>Browse files</span>
      </label>
      {error && (
        <div className="d error-text" role="alert">{error}</div>
      )}
    </div>
  );
};
