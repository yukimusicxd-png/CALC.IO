import React, { useEffect, useState } from 'react';
import '../styles/OptionsModule.css';
import { playClickSound, playKeypressSound } from '../utils/soundEngine';

const STORAGE_KEY = 'calcio_app_settings';
const DEFAULT_SETTINGS = {
  theme: 'Classic Royal Blue',
  enableSplash: true,
  runAtStartup: false,
  soundEnabled: true,
  soundVolume: 75,
};

const THEMES = [
  'Classic Royal Blue',
  'Cyber Neon Purple',
  'Matrix Emerald Green',
  'Vaporwave Pink/Magenta',
  'Sunset Crimson Red',
  'Amber CRT',
  'Deep Indigo',
  'Monochrome Charcoal',
  'Ocean Turquoise',
  'Gold Metallic',
  'Blood Orange',
  'Electric Cyan',
];

export default function OptionsModule({ settings, onSettingsChange }) {
  const [currentSettings, setCurrentSettings] = useState(settings || DEFAULT_SETTINGS);

  useEffect(() => {
    setCurrentSettings(settings || DEFAULT_SETTINGS);
  }, [settings]);

  const handleThemeSelect = (theme) => {
    onSettingsChange?.((prev) => ({ ...prev, theme }));
  };

  const handleToggleSplash = () => {
    onSettingsChange?.((prev) => ({ ...prev, enableSplash: !prev.enableSplash }));
  };

  const handleToggleSound = () => {
    onSettingsChange?.((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleVolumeChange = (value) => {
    const volume = Number(value);
    onSettingsChange?.((prev) => ({ ...prev, soundVolume: volume }));
  };

  const handleTestSound = () => {
    playClickSound();
    setTimeout(playKeypressSound, 120);
  };

  const handleToggleStartup = async () => {
    const nextValue = !currentSettings.runAtStartup;
    if (typeof window !== 'undefined' && window.__TAURI__) {
      try {
        const autostart = await import('@tauri-apps/plugin-autostart');
        if (nextValue) {
          await autostart.enable();
        } else {
          await autostart.disable();
        }
      } catch (error) {
        console.warn('Autostart not available:', error);
      }
    }
    onSettingsChange?.((prev) => ({ ...prev, runAtStartup: nextValue }));
  };

  const handleResetStorage = () => {
    const confirmed = window.confirm(
      'Reset all saved app data? This will clear notes, scribbles, and preferences.'
    );
    if (!confirmed) return;

    window.localStorage.removeItem('calcio_saved_notes');
    window.localStorage.removeItem('calcio_saved_scribbles');
    window.localStorage.removeItem(STORAGE_KEY);
    onSettingsChange?.(() => ({ ...DEFAULT_SETTINGS }));
    setCurrentSettings(DEFAULT_SETTINGS);
    window.location.reload();
  };

  return (
    <div className="options-module">
      <div className="options-panel">
        <div className="options-header">
          <div className="options-title">OPTIONS & SETTINGS</div>
          <div className="options-subtitle">Customize CALC.IO experience</div>
        </div>

        <div className="options-section">
          <div className="section-heading">Theme Palette</div>
          <div className="theme-grid">
            {THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                className={`theme-swatch ${currentSettings.theme === theme ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme)}
              >
                <span>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="options-section">
          <div className="section-heading">Preferences</div>
          <div className="toggle-row">
            <label className="toggle-label">
              <span>Enable Startup Splash Animation</span>
              <input
                type="checkbox"
                checked={currentSettings.enableSplash}
                onChange={handleToggleSplash}
              />
            </label>
          </div>
          <div className="toggle-row">
            <label className="toggle-label">
              <span>Launch CALC.IO on Computer Startup</span>
              <input
                type="checkbox"
                checked={currentSettings.runAtStartup}
                onChange={handleToggleStartup}
              />
            </label>
          </div>
        </div>

        <div className="options-section">
          <div className="section-heading">Audio Preferences</div>
          <div className="toggle-row">
            <label className="toggle-label">
              <span>UI Sound Effects</span>
              <input
                type="checkbox"
                checked={currentSettings.soundEnabled}
                onChange={handleToggleSound}
              />
            </label>
          </div>
          <div className="slider-row">
            <label className="slider-label" htmlFor="master-volume">
              <span>Master Volume</span>
              <span>{currentSettings.soundVolume}%</span>
            </label>
            <input
              id="master-volume"
              type="range"
              min="0"
              max="100"
              value={currentSettings.soundVolume}
              onChange={(event) => handleVolumeChange(event.target.value)}
            />
          </div>
          <div className="sound-test-row">
            <button type="button" className="accent-button" onClick={handleTestSound}>
              Test Sound
            </button>
          </div>
        </div>

        <div className="options-actions">
          <button type="button" className="danger-button" onClick={handleResetStorage}>
            Reset Storage & Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}
