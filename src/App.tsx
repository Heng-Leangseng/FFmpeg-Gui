import { useState, useCallback, useRef } from 'react';
import { SelectVideo } from './components/SelectVideo';
import { Settings } from './components/Settings';
import { SpeedSettings } from './components/SpeedSettings';
import { Processing } from './components/Processing';
import { Result } from './components/Result';
import { Error } from './components/Error';
import { ffmpegEngine } from './engine/ffmpeg';
import { ToolSidebar, ToolSidebarTrigger } from './components/ToolSidebar';
import { ToolOperation } from './config/toolCatalog';

type Screen = 'select' | 'settings' | 'processing' | 'result' | 'error';
type Operation = 'compress' | 'speed';

function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(30);
  const [preset, setPreset] = useState('veryfast');
  const [progress, setProgress] = useState(0);
  const [outputData, setOutputData] = useState<Uint8Array | null>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>('compress');
  const [speedFactor, setSpeedFactor] = useState(1);
  const cancelRequestedRef = useRef(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setScreen('settings');
  }, []);

  const handleSelectOperation = useCallback((op: ToolOperation & { category: string; subcategory: string }) => {
    if (isCompressing) {
      alert('A compression job is running. Cancel it first or wait for it to finish.');
      return;
    }
    if (op.id === 'compress-video') {
      setOperation('compress');
      setScreen(file ? 'settings' : 'select');
      return;
    }
    if (op.id === 'change-speed') {
      setOperation('speed');
      setScreen(file ? 'settings' : 'select');
      return;
    }
    alert(`${op.name} (${op.status})\nComing soon.`);
  }, [isCompressing, file]);

  const startCompression = useCallback(async (options: { crf: number; preset: string }) => {
    if (!file || isCompressing) return;

    cancelRequestedRef.current = false;
    setIsCompressing(true);
    setProgress(0);

    try {
      await ffmpegEngine.load((msg) => {
        console.log('[FFmpeg]', msg);
      });

      const result = await ffmpegEngine.compress(
        file,
        { crf: Math.round(options.crf), preset: options.preset },
        (p) => setProgress(p)
      );

      if (cancelRequestedRef.current) return;

      setOutputData(result);
      setScreen('result');
    } catch (err: unknown) {
      if (cancelRequestedRef.current) return;
      console.error('[App] Compression error:', err);
      setScreen('error');
    } finally {
      setIsCompressing(false);
    }
  }, [file, isCompressing]);

  const handleSettingsNext = useCallback((selectedCrf: number, selectedPreset: string) => {
    setCrf(selectedCrf);
    setPreset(selectedPreset);
    setScreen('processing');
    startCompression({ crf: selectedCrf, preset: selectedPreset });
  }, [startCompression]);

  const startSpeedChange = useCallback(async (options: { factor: number }) => {
    if (!file || isCompressing) return;

    cancelRequestedRef.current = false;
    setIsCompressing(true);
    setProgress(0);

    try {
      await ffmpegEngine.load((msg) => {
        console.log('[FFmpeg]', msg);
      });

      const result = await ffmpegEngine.changeSpeed(
        file,
        options.factor,
        (p) => setProgress(p)
      );

      if (cancelRequestedRef.current) return;

      setOutputData(result);
      setScreen('result');
    } catch (err: unknown) {
      if (cancelRequestedRef.current) return;
      console.error('[App] Speed change error:', err);
      setScreen('error');
    } finally {
      setIsCompressing(false);
    }
  }, [file, isCompressing]);

  const handleSpeedNext = useCallback((factor: number) => {
    setSpeedFactor(factor);
    setScreen('processing');
    startSpeedChange({ factor });
  }, [startSpeedChange]);

  const handleCancel = useCallback(async () => {
    cancelRequestedRef.current = true;
    try {
      await ffmpegEngine.cancel();
    } catch (e) {
      // ignore
    }
    setScreen('settings');
    setOutputData(null);
    setProgress(0);
    setIsCompressing(false);
  }, []);

  const handleReset = useCallback(() => {
    setScreen('select');
    setFile(null);
    setOutputData(null);
    setProgress(0);
    setIsCompressing(false);
  }, []);

  return (
    <div className="app" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
        <ToolSidebarTrigger onClick={() => setSidebarOpen(true)} />
      </div>
      <ToolSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectOperation={handleSelectOperation}
        isEncoding={isCompressing}
      />
      {screen === 'select' && (
        <SelectVideo
          onFileSelect={handleFileSelect}
          title={operation === 'speed' ? 'Change Speed' : 'Compress Video'}
        />
      )}
      {screen === 'settings' && file && operation === 'compress' && (
        <Settings file={file} initialCrf={crf} initialPreset={preset} onNext={handleSettingsNext} onBack={handleReset} />
      )}
      {screen === 'settings' && file && operation === 'speed' && (
        <SpeedSettings file={file} initialFactor={speedFactor} onNext={handleSpeedNext} onBack={handleReset} />
      )}
      {screen === 'processing' && (
        <Processing
          progress={progress}
          onCancel={handleCancel}
          file={file}
          title={operation === 'speed' ? 'Changing speed' : 'Compressing'}
        />
      )}
      {screen === 'result' && file && outputData && (
        <Result
          inputFile={file}
          outputData={outputData}
          onReset={handleReset}
          mode={operation}
          speedFactor={speedFactor}
        />
      )}
      {screen === 'error' && <Error onReset={handleReset} />}
    </div>
  );
}

export default App;