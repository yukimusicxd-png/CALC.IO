import React, { useEffect, useRef, useState } from 'react';
import '../styles/ScribbleModule.css';

const STORAGE_KEY = 'calcio_saved_scribbles';
const DEFAULT_BRUSHES = {
  thin: 2,
  medium: 5,
  thick: 10,
};
const DEFAULT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Retro Green', value: '#00FF66' },
  { name: 'Neon Blue', value: '#00D4FF' },
  { name: 'Yellow', value: '#FFEB00' },
  { name: 'Red', value: '#FF4B4B' },
];

const createScribble = () => ({
  id: `scribble-${Date.now()}`,
  title: 'Untitled Scribble',
  dataUrl: '',
  updatedAt: new Date().toISOString(),
});

const formatDate = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

const hexToRgba = (hex) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, 255];
};

const hsvToRgb = (h, s, v) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;

const formatTimer = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || null;
};

const downloadRecording = (blob) => {
  const url = URL.createObjectURL(blob);
  const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
  const filename = `scribble-session-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export default function ScribbleModule() {
  const [scribbles, setScribbles] = useState([]);
  const [activeScribbleId, setActiveScribbleId] = useState(null);
  const [title, setTitle] = useState('');
  const [brushSize, setBrushSize] = useState('medium');
  const [color, setColor] = useState(DEFAULT_COLORS[1].value);
  const [customColor, setCustomColor] = useState('#00FF66');
  const [isEraser, setIsEraser] = useState(false);
  const [tool, setTool] = useState('brush');
  const [undoStack, setUndoStack] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const undoStackRef = useRef([]);
  const moduleRef = useRef(null);
  const canvasRef = useRef(null);
  const colorWheelRef = useRef(null);
  const containerRef = useRef(null);
  const pointerPosition = useRef({ x: 0, y: 0 });
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingStreamRef = useRef(null);

  const activeScribble = scribbles.find((scribble) => scribble.id === activeScribbleId) || null;
  const drawColor = isEraser ? '#0D0D0D' : color;
  const brushWidth = DEFAULT_BRUSHES[brushSize] || DEFAULT_BRUSHES.medium;
  const effectiveColor = isEraser ? '#0D0D0D' : color;

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScribbles(Array.isArray(parsed) ? parsed : []);
      } catch {
        setScribbles([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scribbles));
  }, [scribbles]);

  useEffect(() => {
    if (!activeScribble) {
      setTitle('');
      setUndoStack([]);
      undoStackRef.current = [];
      return;
    }

    setTitle(activeScribble.title);
    const initialStack = [activeScribble.dataUrl || ''];
    setUndoStack(initialStack);
    undoStackRef.current = initialStack;
    drawFromDataUrl(activeScribble.dataUrl || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScribbleId, activeScribble?.dataUrl]);

  useEffect(() => {
    const handleResize = () => resizeCanvas();
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === moduleRef.current);
      setTimeout(() => resizeCanvas(), 100);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreen, activeScribbleId]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const sortedScribbles = [...scribbles].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushWidth;
    context.strokeStyle = isEraser ? '#090909' : color;
    return context;
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    drawFromDataUrl(activeScribble?.dataUrl || '', context, rect.width, rect.height);
  };

  const drawFromDataUrl = (dataUrl, contextOverride, width, height) => {
    const canvas = canvasRef.current;
    const context = contextOverride || canvas?.getContext('2d');
    if (!canvas || !context) return;

    const rect = { width: width || canvas.width / (window.devicePixelRatio || 1), height: height || canvas.height / (window.devicePixelRatio || 1) };
    context.clearRect(0, 0, rect.width, rect.height);

    if (!dataUrl) return;

    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, rect.width, rect.height);
    };
    image.src = dataUrl;
  };

  const saveActiveScribble = (updates) => {
    if (!activeScribbleId) return;
    setScribbles((current) =>
      current.map((scribble) =>
        scribble.id === activeScribbleId
          ? { ...scribble, ...updates, updatedAt: new Date().toISOString() }
          : scribble
      )
    );
  };

  const updateCanvasSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeScribbleId) return;
    const dataUrl = canvas.toDataURL('image/png');
    saveActiveScribble({ dataUrl });
    setUndoStack((stack) => [...stack, dataUrl]);
  };

  const handleCreateScribble = () => {
    const newScribble = createScribble();
    setScribbles((current) => [newScribble, ...current]);
    setActiveScribbleId(newScribble.id);
  };

  const handleOpenScribble = (scribbleId) => {
    setActiveScribbleId(scribbleId);
  };

  const handleDeleteScribble = (scribbleId) => {
    setScribbles((current) => current.filter((scribble) => scribble.id !== scribbleId));
    if (activeScribbleId === scribbleId) {
      setActiveScribbleId(null);
    }
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    saveActiveScribble({ title: value });
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const drawColorWheel = () => {
    const canvas = colorWheelRef.current;
    if (!canvas) return;
    const size = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const radius = size / 2;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x - radius;
        const dy = y - radius;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const index = (y * size + x) * 4;

        if (distance > radius) {
          data[index + 3] = 0;
          continue;
        }

        const saturation = distance / radius;
        const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        const [r, g, b] = hsvToRgb(hue, saturation, 1);
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleWheelClick = (event) => {
    const canvas = colorWheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.min(rect.width, rect.height);
    const radius = size / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > radius) return;

    const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const saturation = distance / radius;
    const [r, g, b] = hsvToRgb(hue, saturation, 1);
    const hex = rgbToHex(r, g, b);
    setColor(hex);
    setCustomColor(hex);
    setIsEraser(false);
    setTool('brush');
  };

  useEffect(() => {
    if (showColorDialog) {
      drawColorWheel();
    }
  }, [showColorDialog]);

  const handleFillBucket = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeScribbleId) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const point = getCanvasPoint(event);
    const x = Math.floor(point.x * dpr);
    const y = Math.floor(point.y * dpr);
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    const getPixel = (xPos, yPos) => {
      const index = (yPos * width + xPos) * 4;
      return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    const setPixel = (xPos, yPos, rgba) => {
      const index = (yPos * width + xPos) * 4;
      data[index] = rgba[0];
      data[index + 1] = rgba[1];
      data[index + 2] = rgba[2];
      data[index + 3] = rgba[3];
    };

    const targetColor = getPixel(x, y);
    const fillColor = isEraser ? [9, 9, 9, 255] : hexToRgba(color);
    const sameColor = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    if (sameColor(targetColor, fillColor)) return;

    const stack = [{ x, y }];
    while (stack.length) {
      const { x: currentX, y: currentY } = stack.pop();
      if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) continue;
      if (!sameColor(getPixel(currentX, currentY), targetColor)) continue;
      setPixel(currentX, currentY, fillColor);
      stack.push({ x: currentX + 1, y: currentY });
      stack.push({ x: currentX - 1, y: currentY });
      stack.push({ x: currentX, y: currentY + 1 });
      stack.push({ x: currentX, y: currentY - 1 });
    }

    context.putImageData(imageData, 0, 0);
    setUndoStack((stack) => [...stack, canvas.toDataURL('image/png')]);
    saveActiveScribble({ dataUrl: canvas.toDataURL('image/png') });
  };

  const pushUndoState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setUndoStack((stack) => {
      const next = [...stack, dataUrl];
      undoStackRef.current = next;
      return next;
    });
    undoStackRef.current = [...undoStackRef.current, dataUrl];
  };

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === 'bucket') {
      event.preventDefault();
      pushUndoState();
      handleFillBucket(event);
      return;
    }

    const context = getCanvasContext();
    if (!context) return;
    event.preventDefault();
    const point = getCanvasPoint(event);
    pointerPosition.current = point;
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
    pushUndoState();
  };

  const handlePointerMove = (event) => {
    if (!isDrawing || tool === 'bucket') return;
    const context = getCanvasContext();
    if (!context) return;
    event.preventDefault();
    const point = getCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    pointerPosition.current = point;
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    pushUndoState();
    saveActiveScribble({ dataUrl });
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const dataUrl = canvas.toDataURL('image/png');
    setUndoStack((stack) => [...stack, dataUrl]);
    const scaledWidth = canvas.width / (window.devicePixelRatio || 1);
    const scaledHeight = canvas.height / (window.devicePixelRatio || 1);
    context.clearRect(0, 0, scaledWidth, scaledHeight);
    saveActiveScribble({ dataUrl: '' });
  };

  const handleUndo = () => {
    const currentStack = undoStackRef.current;
    if (currentStack.length < 2) return;
    const nextStack = currentStack.slice(0, -1);
    const lastDataUrl = nextStack[nextStack.length - 1] || '';
    undoStackRef.current = nextStack;
    setUndoStack(nextStack);
    drawFromDataUrl(lastDataUrl);
    saveActiveScribble({ dataUrl: lastDataUrl });
  };

  const toggleFullscreen = async () => {
    if (!moduleRef.current) return;

    if (document.fullscreenElement === moduleRef.current) {
      await document.exitFullscreen();
    } else if (moduleRef.current.requestFullscreen) {
      await moduleRef.current.requestFullscreen();
    }
  };

  const currentColor = isEraser ? '#090909' : color;

  const sanitizeFilename = (value) => {
    return value
      .replace(/[^a-zA-Z0-9-_ ]+/g, '')
      .trim()
      .replace(/ /g, '')
      .replace(/ /g, '')
      .replace(/ /g, '-');
  };

  const downloadFile = (dataUrl, filename) => {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const exportCanvasImage = (type) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const titleText = sanitizeFilename(title || 'untitled-scribble');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scribble-${titleText}-${timestamp}.${type === 'jpeg' ? 'jpeg' : 'png'}`;

    if (type === 'jpeg') {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(canvas, 0, 0);
      const dataUrl = offscreen.toDataURL('image/jpeg', 0.92);
      downloadFile(dataUrl, filename);
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    downloadFile(dataUrl, filename);
  };

  const handleStartRecording = () => {
    if (isRecording || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30);
    if (!stream) {
      console.warn('Canvas captureStream not supported in this browser.');
      return;
    }

    const mimeType = getSupportedMimeType();
    const options = mimeType ? { mimeType } : {};
    try {
      const recorder = new MediaRecorder(stream, options);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        if (blob.size > 0) {
          downloadRecording(blob);
        }
        recordingChunksRef.current = [];
        recordingStreamRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      recordingStreamRef.current = stream;
      setIsRecording(true);
      setRecordTime(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordTime((time) => time + 1);
      }, 1000);
    } catch (error) {
      console.warn('Recording failed to start:', error);
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return;
    recorderRef.current.stop();
    recorderRef.current = null;
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      handleStartRecording();
    }
  };

  const recordTimeLabel = formatTimer(recordTime);

  return (
    <div ref={moduleRef} className={`scribble-module-container ${fullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="scribble-header">
        <div className="scribble-title">╔═══ SCRIBBLE WHITEBOARD ═══╗</div>
        <div className="scribble-subtitle">Draw ideas with an HD canvas and save multiple interactive sketches</div>
      </div>

      {!activeScribble && (
        <div className="scribble-list-view">
          <div className="scribble-list-actions">
            <button type="button" className="new-scribble-btn" onClick={handleCreateScribble}>
              + New Scribble
            </button>
          </div>
          {scribbles.length === 0 ? (
            <div className="empty-state">
              No saved scribbles yet. Start a new drawing for teaching diagrams and visual notes.
            </div>
          ) : (
            <div className="scribble-grid">
              {sortedScribbles.map((scribble) => (
                <div key={scribble.id} className="scribble-card">
                  <button
                    type="button"
                    className="scribble-card-main"
                    onClick={() => handleOpenScribble(scribble.id)}
                  >
                    <div className="scribble-preview-wrapper">
                      {scribble.dataUrl ? (
                        <img
                          className="scribble-preview"
                          src={scribble.dataUrl}
                          alt={`Preview of ${scribble.title || 'scribble'}`}
                        />
                      ) : (
                        <div className="scribble-preview-empty">Empty</div>
                      )}
                    </div>
                    <div className="scribble-card-title">{scribble.title || 'Untitled Scribble'}</div>
                    <div className="scribble-card-meta">Created {formatDate(scribble.updatedAt)}</div>
                  </button>
                  <button
                    type="button"
                    className="scribble-delete-btn"
                    onClick={() => handleDeleteScribble(scribble.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeScribble && (
        <div className="scribble-editor-view">
          <div className="scribble-editor-toolbar">
            <button type="button" className="back-btn" onClick={() => setActiveScribbleId(null)}>
              ← Back to Scribbles
            </button>
            <button type="button" className="fullscreen-btn" onClick={toggleFullscreen}>
              {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>

          <input
            type="text"
            className="scribble-title-input"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Scribble title"
          />

          <div className="scribble-canvas-wrapper" ref={containerRef}>
            <canvas
              ref={canvasRef}
              className="scribble-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrawing}
              onPointerLeave={endDrawing}
            />
            {isRecording && (
              <div className="recording-overlay">
                <span className="recording-dot">●</span>
                <span>{recordTimeLabel}</span>
              </div>
            )}
          </div>

          <div className="scribble-controls-bar">
            <div className="control-group">
              <span className="control-label">Brush</span>
              <button
                type="button"
                className={`control-pill ${brushSize === 'thin' ? 'active' : ''}`}
                onClick={() => setBrushSize('thin')}
              >
                Thin
              </button>
              <button
                type="button"
                className={`control-pill ${brushSize === 'medium' ? 'active' : ''}`}
                onClick={() => setBrushSize('medium')}
              >
                Medium
              </button>
              <button
                type="button"
                className={`control-pill ${brushSize === 'thick' ? 'active' : ''}`}
                onClick={() => setBrushSize('thick')}
              >
                Thick
              </button>
            </div>

            <div className="control-group">
              <span className="control-label">Tool</span>
              <button
                type="button"
                className={`control-pill ${tool === 'brush' ? 'active' : ''}`}
                onClick={() => setTool('brush')}
              >
                Brush
              </button>
              <button
                type="button"
                className={`control-pill ${tool === 'bucket' ? 'active' : ''}`}
                onClick={() => setTool('bucket')}
              >
                Bucket
              </button>
            </div>

            <div className="control-group color-wheel-group">
              <span className="control-label">Color</span>
              {DEFAULT_COLORS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`color-pill ${currentColor === option.value ? 'selected' : ''}`}
                  style={{ background: option.value }}
                  onClick={() => {
                    setColor(option.value);
                    setCustomColor(option.value);
                    setIsEraser(false);
                  }}
                />
              ))}
              <button type="button" className="color-wheel-open-btn" onClick={() => setShowColorDialog(true)}>
                Open Wheel
              </button>
              <input
                type="color"
                className="custom-color-picker"
                value={customColor}
                onChange={(event) => {
                  setCustomColor(event.target.value);
                  setColor(event.target.value);
                  setIsEraser(false);
                }}
              />
            </div>

            <div className="control-group actions-group">
              <button
                type="button"
                className={`control-pill ${isEraser ? 'active' : ''}`}
                onClick={() => {
                  setIsEraser((value) => !value);
                  setTool('brush');
                }}
              >
                {isEraser ? 'Eraser On' : 'Eraser'}
              </button>
              <button type="button" className="control-pill" onClick={handleClearCanvas}>
                Clear All
              </button>
              <button type="button" className="control-pill" onClick={handleUndo}>
                Undo
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={() => exportCanvasImage('png')}
              >
                Export PNG
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={() => exportCanvasImage('jpeg')}
              >
                Export JPEG
              </button>
              <button
                type="button"
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
              >
                {isRecording ? `● Recording ${recordTimeLabel}` : 'Record'}
              </button>
            </div>
          </div>

          {showColorDialog && (
            <div className="color-dialog-overlay" onClick={() => setShowColorDialog(false)}>
              <div className="color-dialog" onClick={(event) => event.stopPropagation()}>
                <div className="color-dialog-header">
                  <span>RGB Color Wheel</span>
                  <button type="button" className="color-dialog-close" onClick={() => setShowColorDialog(false)}>
                    ×
                  </button>
                </div>
                <div className="color-dialog-body">
                  <canvas
                    ref={colorWheelRef}
                    className="color-wheel-dialog"
                    onClick={handleWheelClick}
                  />
                  <div className="color-preview-row">
                    <div className="selected-color-swatch" style={{ background: currentColor }} />
                    <span>{currentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
