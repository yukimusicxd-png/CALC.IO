import React, { useState, useEffect } from 'react';
import '../styles/FooterStatusBar.css';

export default function FooterStatusBar({ onOpenScreensaver }) {
  const [time, setTime] = useState(new Date());
  const [appVer, setAppVer] = useState('1.0.0');
  const [visitors, setVisitors] = useState(() => {
    const stored = localStorage.getItem('calcio-visitors') || '0';
    return parseInt(stored, 10) + 1;
  });
  const [cpuUsage, setCpuUsage] = useState(Math.random() * 100);

  useEffect(() => {
    localStorage.setItem('calcio-visitors', visitors.toString());
  }, [visitors]);

  useEffect(() => {
    const loadVersion = async () => {
      if (typeof window === 'undefined' || !window.__TAURI__) {
        setAppVer('1.0.0');
        return;
      }

      try {
        const appApi = await import('@tauri-apps/api/app');
        const version = await appApi.getVersion();
        setAppVer(version || '1.0.0');
      } catch (error) {
        console.warn('Tauri app version unavailable:', error);
        setAppVer('1.0.0');
      }
    };

    loadVersion();

    const timer = setInterval(() => {
      setTime(new Date());
      setCpuUsage(Math.random() * 100);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="footer-statusbar">
      <div className="status-section">
        <span className="status-label">CALC.IO v1.0</span>
      </div>

      <div className="status-section">
        <span className="status-icon">◆</span>
        <span className="status-text">Sessions: {visitors}</span>
      </div>

      <div className="status-section">
        <span className="status-icon">◇</span>
        <span className="status-text">CPU: {cpuUsage.toFixed(1)}%</span>
      </div>

      <div className="status-section separator">|</div>

      <div className="status-section">
        <span className="status-text">[{formatDate(time)}]</span>
      </div>

      <div className="status-section">
        <span className="status-text">{formatTime(time)}</span>
      </div>

      <div className="status-section separator">|</div>

      <div className="status-section">
        <span className="status-text">READY</span>
      </div>

      <div className="status-section">
        <span className="status-text">MODE: INTERACTIVE</span>
      </div>

      <div className="status-section screensaver-section">
        <button
          type="button"
          className="screensaver-launch-btn"
          onClick={onOpenScreensaver}
        >
          ✦ Screensaver
        </button>
      </div>
    </div>
  );
}
