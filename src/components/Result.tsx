import React, { useEffect, useMemo, useState } from 'react';
import { formatFileName } from '../utils/formatFileName';
import { formatSize } from '../utils/formatSize';

interface ResultProps {
  inputFile: File;
  outputData: Uint8Array;
  onReset: () => void;
  mode?: 'compress' | 'speed';
  speedFactor?: number;
}

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: '#0A1622', stroke: '#0A1622' }}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
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

const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

const canSaveViaShare = (() => {
  if (!isIOS || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([], 'video.mp4', { type: 'video/mp4' })] });
  } catch {
    return false;
  }
})();

export const Result: React.FC<ResultProps> = ({ inputFile, outputData, onReset, mode = 'compress', speedFactor = 1 }) => {
  const outputBlob = useMemo(() => {
    const bytes = new Uint8Array(outputData.byteLength);
    bytes.set(outputData);
    return new Blob([bytes.buffer], { type: 'video/mp4' });
  }, [outputData]);
  const [previewUrl, setPreviewUrl] = useState('');
  const outputSize = outputData.byteLength;
  const inputSize = inputFile.size;
  const saved = inputSize - outputSize;
  const savedPercent = inputSize > 0 ? ((saved / inputSize) * 100).toFixed(1) : '0';
  const outputPercent = inputSize > 0 ? ((outputSize / inputSize) * 100).toFixed(1) : '0';
  const baseName = inputFile.name.replace(/\.[^/.]+$/, '');
  const downloadName = mode === 'speed'
    ? `speed-${speedFactor}x_${baseName}.mp4`
    : `compressed_${baseName}.mp4`;

  useEffect(() => {
    const url = URL.createObjectURL(outputBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  const handleDownload = async () => {
    const file = new File([outputBlob], downloadName, { type: 'video/mp4' });
    if (canSaveViaShare) {
      try {
        await navigator.share({ files: [file], title: downloadName });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    const url = previewUrl || URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      if (url !== previewUrl) URL.revokeObjectURL(url);
    }, 60_000);
  };

  return (
    <div className="s">
      <div className="h">
        <div className="lg" style={{ marginLeft: '52px' }}>
          <i><LogoIcon /></i>
          <span>FFmpeg-<b>Gui</b></span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: '#3E92CC', color: '#0A1622', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', borderRadius: '0' }}>
          <SuccessIcon />
        </div>
        <div>
          <div className="k">Success</div>
          <h1 className="t" style={{ fontSize: '28px', marginTop: '4px' }}>
            {mode === 'speed' ? 'Speed change complete' : 'Compression complete'}
          </h1>
        </div>
      </div>
      <div className="c">
        <div className="k" style={{ marginBottom: '14px' }}>Result</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px' }}>
          <span style={{ color: '#B4C8D9' }}>Original</span>
          <b className="m">{formatSize(inputSize)}</b>
        </div>
        <div className="result-bar" style={{ width: '100%' }}>
          <div className="result-bar-fill" style={{ width: '100%' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', margin: '18px 0 8px' }}>
          <span style={{ color: '#B4C8D9' }}>{mode === 'speed' ? 'Output' : 'Compressed'}</span>
          <b className="m">{formatSize(outputSize)}</b>
        </div>
        <div className="result-bar" style={{ width: '100%' }}>
          <div className="result-bar-fill" style={{ width: `${outputPercent}%` }}></div>
        </div>
        {mode === 'speed' ? (
          <div className="st" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px' }}>
            <div>
              <div className="k">Output speed</div>
              <div style={{ fontSize: '28px' }}><span className="saved-amount">{speedFactor}x</span></div>
            </div>
            <span className="saved-badge">pitch preserved</span>
          </div>
        ) : (
          <div className="st" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px' }}>
            <div>
              <div className="k">Space saved</div>
              <div style={{ fontSize: '28px' }}><span className="saved-amount">−{formatSize(Math.abs(saved))}</span></div>
            </div>
            <span className="saved-badge">{saved >= 0 ? savedPercent : outputPercent}% {saved >= 0 ? 'smaller' : 'larger'}</span>
          </div>
        )}
      </div>
      <div className="c" style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px' }}>
        <div className="f f-small" style={{ width: '48px', height: '48px' }}><FileIcon /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm" style={{ fontSize: '16px' }} title={inputFile.name}>{formatFileName(inputFile.name)}</div>
          <div className="m" style={{ fontSize: '12px', color: '#B4C8D9', marginTop: '4px' }}>{formatSize(outputSize)} · MP4</div>
        </div>
      </div>
      <video className="video-preview" src={previewUrl} controls playsInline />
      <div style={{ flex: 1 }}></div>
      <button className="b" onClick={handleDownload} style={{ marginBottom: canSaveViaShare ? '4px' : '8px' }}>
        <DownloadIcon />Download
      </button>
      {canSaveViaShare && (
        <div className="d" style={{ fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>
          Choose “Save to Files” in the share sheet.
        </div>
      )}
      <button className="b g" onClick={onReset}>
        <RotateCcwIcon />{mode === 'speed' ? 'Change another video' : 'Compress another video'}
      </button>
    </div>
  );
};