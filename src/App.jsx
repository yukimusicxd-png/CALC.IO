import React, { useEffect, useState } from 'react';
import HeaderMarquee from './components/HeaderMarquee';
import MathModule from './components/MathModule';
import PhysicsModule from './components/PhysicsModule';
import ChemistryModule from './components/ChemistryModule';
import CalculatorModule from './components/CalculatorModule';
import NotesModule from './components/NotesModule';
import ScribbleModule from './components/ScribbleModule';
import GeographicModule from './components/GeographicModule';
import SystemReference from './components/SystemReference';
import AboutModule from './components/AboutModule';
import OptionsModule from './components/OptionsModule';
import FooterStatusBar from './components/FooterStatusBar';
import ScreensaverModal from './components/ScreensaverModal';
import SplashScreen from './components/SplashScreen';
import { playClickSound, playKeypressSound } from './utils/soundEngine';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('math');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScreensaverOpen, setIsScreensaverOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'Classic Royal Blue',
    enableSplash: true,
    runAtStartup: false,
    soundEnabled: true,
    soundVolume: 75,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem('calcio_app_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore malformed settings
      }
    }
  }, []);

  const applyTheme = (theme) => {
    const colors = {
      'Classic Royal Blue': ['#000080', '#1084D7'],
      'Cyber Neon Purple': ['#3D0F5A', '#B240FF'],
      'Matrix Emerald Green': ['#0A3D0A', '#35FF7F'],
      'Vaporwave Pink/Magenta': ['#3F005D', '#FF4FDB'],
      'Sunset Crimson Red': ['#5F0000', '#FF5151'],
      'Amber CRT': ['#7A4300', '#FFC853'],
      'Deep Indigo': ['#11003F', '#5B4BFF'],
      'Monochrome Charcoal': ['#111111', '#666666'],
      'Ocean Turquoise': ['#004A5F', '#2CEAE8'],
      'Gold Metallic': ['#443200', '#FFD27A'],
      'Blood Orange': ['#6C1100', '#FF6A2B'],
      'Electric Cyan': ['#003F4F', '#37F3FF'],
    };
    const [dark, bright] = colors[theme] || colors['Classic Royal Blue'];
    document.documentElement.style.setProperty('--theme-dark', dark);
    document.documentElement.style.setProperty('--theme-bright', bright);
  };

  useEffect(() => {
    window.localStorage.setItem('calcio_app_settings', JSON.stringify(settings));
    window.localStorage.setItem('calcio_sound_enabled', settings.soundEnabled ? '1' : '0');
    window.localStorage.setItem('calcio_sound_volume', String(settings.soundVolume));
    applyTheme(settings.theme);
  }, [settings]);

  useEffect(() => {
    if (!settings.enableSplash) {
      setIsInitializing(false);
      return;
    }
    const timeout = setTimeout(() => setIsInitializing(false), 3000);
    return () => clearTimeout(timeout);
  }, [settings.enableSplash]);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      const target = event.target;
      if (!target) return;
      if (
        target.closest('button, a, input, textarea, select, label, [role="button"], [role="tab"]')
      ) {
        playClickSound();
      }
    };

    const handleGlobalKeyDown = (event) => {
      const target = event.target;
      if (!target) return;
      if (event.defaultPrevented) return;
      if (event.key.length !== 1) return;
      if (
        target.closest('input, textarea, [contenteditable="true"], [role="textbox"]')
      ) {
        playKeypressSound();
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, []);

  useEffect(() => {
    const checkForUpdates = async () => {
      if (typeof window === 'undefined' || !window.__TAURI__) return;

      try {
        const updater = await import('@tauri-apps/plugin-updater');
        const process = await import('@tauri-apps/plugin-process');
        const update = await updater.check();

        if (update?.available) {
          const version = update.manifest?.version || update.version || 'new version';
          const releaseNotes = update.manifest?.notes || update.body || 'Release notes unavailable.';
          const accept = window.confirm(
            `CALC.IO update available: ${version}\n\n${releaseNotes}\n\nInstall and relaunch now?`
          );
          if (!accept) return;
          await update.downloadAndInstall();
          await process.relaunch();
        }
      } catch (error) {
        console.warn('Update check failed', error);
      }
    };

    checkForUpdates();
  }, []);

  const modules = [
    { id: 'math', name: 'Mathematics', icon: '∑' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'physics', name: 'Physics', icon: '⚡' },
    { id: 'chemistry', name: 'Chemistry', icon: '⚗' },
    { id: 'geographic', name: 'Geographic', icon: '🌐' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'scribble', name: 'Scribble', icon: '✎' },
    { id: 'reference', name: 'Reference', icon: '📊' },
    { id: 'about', name: 'About', icon: 'ℹ' },
    { id: 'options', name: 'Options', icon: '⚙' },
  ];

  return (
    <>
      {isInitializing && <SplashScreen />}
      <div className="calc-io-container" style={{ filter: isInitializing ? 'blur(2px)' : 'none', opacity: isInitializing ? 0.25 : 1, pointerEvents: isInitializing ? 'none' : 'auto' }}>
        <HeaderMarquee />
        
        <div className="main-content">
        <div className="module-nav">
          <div className="nav-header">MODULES</div>
          {modules.slice(0, -1).map((module) => (
            <button
              key={module.id}
              className={`module-btn ${activeModule === module.id ? 'active' : ''}`}
              onClick={() => setActiveModule(module.id)}
            >
              <span className="icon">{module.icon}</span>
              <span className="label">{module.name}</span>
            </button>
          ))}
          <div className="nav-footer-spacer" />
          <button
            type="button"
            className={`module-btn ${activeModule === 'options' ? 'active' : ''} options-btn`}
            onClick={() => setActiveModule('options')}
          >
            <span className="icon">⚙</span>
            <span className="label">Options</span>
          </button>
        </div>

        <div className="module-content">
          {activeModule === 'math' && <MathModule />}
          {activeModule === 'calculator' && <CalculatorModule />}
          {activeModule === 'physics' && <PhysicsModule />}
          {activeModule === 'chemistry' && <ChemistryModule />}
          {activeModule === 'geographic' && <GeographicModule />}
          {activeModule === 'notes' && <NotesModule />}
          {activeModule === 'scribble' && <ScribbleModule />}
          {activeModule === 'reference' && <SystemReference />}
          {activeModule === 'about' && <AboutModule />}
          {activeModule === 'options' && <OptionsModule settings={settings} onSettingsChange={setSettings} />}
        </div>
        </div>

        {isScreensaverOpen && (
          <ScreensaverModal onClose={() => setIsScreensaverOpen(false)} />
        )}
        <FooterStatusBar onOpenScreensaver={() => setIsScreensaverOpen(true)} />
      </div>
    </>
  );
}

export default App;
