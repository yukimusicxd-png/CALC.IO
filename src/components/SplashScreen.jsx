import React from 'react';
import '../styles/SplashScreen.css';

export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-card">
        <div className="splash-logo">CALC.IO</div>

        <div className="splash-loader">
          <div className="loader-bar">
            <div className="loader-fill" />
          </div>
          <div className="loader-status">[████████░░]</div>
        </div>
      </div>
    </div>
  );
}
