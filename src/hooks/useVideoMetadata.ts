import { useEffect, useState } from 'react';

export interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
}

export function useVideoMetadata(file: File): VideoMetadata {
  const [metadata, setMetadata] = useState<VideoMetadata>({});

  useEffect(() => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setMetadata({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
    };
    video.src = url;
    return () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.src = '';
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return metadata;
}
