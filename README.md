# FFmpeg-Gui

Browser-based FFmpeg GUI using @ffmpeg/ffmpeg (single-threaded WASM).

## Dev

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

After build, copy FFmpeg core to dist:
```powershell
Copy-Item -Path "public\ffmpeg-core" -Destination "dist" -Recurse -Force
```

Serve production build:
```powershell
node serve-static.mjs
```

## Dependencies
React 18, TypeScript, Vite 5, @ffmpeg/ffmpeg 0.12.x (single-threaded)
