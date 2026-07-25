import React, { useState } from 'react';
import '../styles/AboutModule.css';

export default function AboutModule() {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <div className="about-module">
      <div className="about-panel">
        <div className="about-header">
          <div>
            <div className="about-title">CALC.IO</div>
            <div className="about-tagline">Retro STEM Workstation</div>
          </div>
          <div className="version-badge">v1.0.0</div>
        </div>

        <div className="about-body">
          <p className="about-description">
            CALC.IO is a retro-inspired STEM desktop suite built for students, researchers, and educators. It combines a powerful calculator with immersive Math, Physics, and Chemistry learning modules, rich-text Notes, and a high-definition Scribble whiteboard.
          </p>

          <div className="about-section">
            <div className="section-heading">Core Capabilities</div>
            <ul>
              <li>Advanced Calculator for fast numeric work</li>
              <li>STEM learning modules: Math, Physics, Chemistry</li>
              <li>Rich-text Notes for lessons and lab notes</li>
              <li>HD Scribble Whiteboard for diagrams and sketches</li>
            </ul>
          </div>

          <div className="about-section">
            <div className="section-heading">Features Summary</div>
            <ul>
              <li>Local persistent storage for notes and drawings</li>
              <li>Offline desktop capability with native Tauri performance</li>
              <li>Cross-platform desktop support with a retro terminal aesthetic</li>
            </ul>
          </div>

          <button
            type="button"
            className="credits-button"
            onClick={() => setShowCredits(true)}
          >
            Developer Credits
          </button>
        </div>
      </div>

      {showCredits && (
        <div className="credits-modal-overlay" onClick={() => setShowCredits(false)}>
          <div className="credits-modal" onClick={(event) => event.stopPropagation()}>
            <div className="credits-modal-header">
              <div>Developer Credits</div>
              <button
                type="button"
                className="credits-close"
                onClick={() => setShowCredits(false)}
              >
                ×
              </button>
            </div>
            <div className="credits-modal-body">
              <div className="credits-item"><span>Creator:</span> Enchaster91 (Arvind Singh)</div>
              <div className="credits-item"><span>Developer Age:</span> 18 years old (at release)</div>
              <div className="credits-item"><span>Creation Date:</span> July 25th, 2026</div>
              <div className="credits-item">
                <span>Bio:</span>
                Designed & Built as an all-in-one retro STEM workstation for students, researchers, and educators.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
