import React, { useState, useEffect } from 'react';
import '../styles/HeaderMarquee.css';

export default function HeaderMarquee() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const marqueeText = "CALC.IO SCIENTIFIC WORKSTATION v1.0 :: RETRO HEISEI TERMINAL :: ADVANCED STEM CALCULATIONS :: MATHEMATICS :: PHYSICS :: CHEMISTRY :: UNIT CONVERTER :: ";

  return (
    <div className="header-marquee">
      <div className="titlebar">
        <div className="window-title">
          ▓▓ CALC.IO - STEM Computation Hub ▓▓
        </div>
      </div>
      <div className="marquee-container">
        <div className="marquee-content">
          <span className="marquee-text">{marqueeText}</span>
          <span className="marquee-text">{marqueeText}</span>
        </div>
      </div>
      <div className="system-info">
        <span className="info-segment">[ SYSTEM TIME: {time} ]</span>
        <span className="info-segment">[ PRECISION: 64-bit ]</span>
        <span className="info-segment">[ MODE: INTERACTIVE ]</span>
      </div>
    </div>
  );
}
