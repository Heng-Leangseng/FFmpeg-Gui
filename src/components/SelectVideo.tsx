import { useRef, DragEvent, ChangeEvent } from 'react';

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

export const SelectVideo: React.FC<SelectVideoProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLButtonElement>(null);

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      onFileSelect(file);
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
    if (file) handleFile(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
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
      <button
        ref={dropZoneRef}
        className="z"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Select video file"
      >
        <span style={{ width: '72px', height: '72px', background: '#18435A', color: '#3E92CC', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0' }}>
          <FileDropIcon />
        </span>
        <span style={{ fontSize: '22px', fontWeight: 700 }}>Choose a video</span>
        <span style={{ background: '#2A628F', color: '#fff', padding: '12px 22px', fontSize: '15px', fontWeight: 600, borderRadius: '0' }}>Browse files</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Video file input"
      />
    </div>
  );
};