import { useState, useCallback, useRef } from 'react';
import { SelectVideo } from './components/SelectVideo';
import { ConvertSettings } from './components/ConvertSettings';
import { Processing } from './components/Processing';
import { Result } from './components/Result';
import { Error } from './components/Error';
import { ffmpegEngine } from './engine/ffmpeg';
import type { LoadProgress } from './engine/ffmpeg';
import type { TargetFormat } from './config/formats';

type Screen = 'select' | 'settings' | 'processing' | 'result' | 'error';

function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<TargetFormat>('mp4');
  const [progress, setProgress] = useState(0);
  const [outputData, setOutputData] = useState<Uint8Array | null>(null);
  const [stage, setStage] = useState<'loading' | 'processing'>('loading');
  const [loadProgress, setLoadProgress] = useState<LoadProgress>({ loaded: 0, total: 0, phase: 'download' });
  const cancelRequestedRef = useRef(false);
  const convertingRef = useRef(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setScreen('settings');
  }, []);

  const startConversion = useCallback(async (target: TargetFormat) => {
    if (!file || convertingRef.current) return;

    convertingRef.current = true;
    cancelRequestedRef.current = false;
    setProgress(0);
    setStage('loading');
    setLoadProgress({ loaded: 0, total: 0, phase: 'download' });

    try {
      await ffmpegEngine.load(
        (msg) => console.log('[FFmpeg]', msg),
        (p) => setLoadProgress(p)
      );
      setStage('processing');

      const result = await ffmpegEngine.convert(file, target, (p) => setProgress(p));

      if (cancelRequestedRef.current) return;

      setOutputData(result);
      setScreen('result');
    } catch (err: unknown) {
      if (cancelRequestedRef.current) return;
      console.error('[App] Conversion error:', err);
      setScreen('error');
    } finally {
      convertingRef.current = false;
    }
  }, [file]);

  const handleFormatNext = useCallback((selectedFormat: TargetFormat) => {
    setFormat(selectedFormat);
    setScreen('processing');
    startConversion(selectedFormat);
  }, [startConversion]);

  const handleCancel = useCallback(async () => {
    cancelRequestedRef.current = true;
    try {
      await ffmpegEngine.cancel();
    } catch {
      // ignore
    }
    setScreen('settings');
    setOutputData(null);
    setProgress(0);
  }, []);

  const handleReset = useCallback(() => {
    setScreen('select');
    setFile(null);
    setOutputData(null);
    setProgress(0);
  }, []);

  return (
    <div className="app">
      {screen === 'select' && <SelectVideo onFileSelect={handleFileSelect} />}
      {screen === 'settings' && file && (
        <ConvertSettings file={file} initialFormat={format} onNext={handleFormatNext} onBack={handleReset} />
      )}
      {screen === 'processing' && (
        <Processing
          progress={progress}
          onCancel={handleCancel}
          file={file}
          title="Converting"
          stage={stage}
          loadProgress={loadProgress}
        />
      )}
      {screen === 'result' && file && outputData && (
        <Result inputFile={file} outputData={outputData} format={format} onReset={handleReset} />
      )}
      {screen === 'error' && <Error onReset={handleReset} />}
    </div>
  );
}

export default App;
