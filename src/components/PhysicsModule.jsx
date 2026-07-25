import React, { useState } from 'react';
import * as math from 'mathjs';
import '../styles/PhysicsModule.css';

export default function PhysicsModule() {
  const [activeTab, setActiveTab] = useState('kinematics');

  // Kinematics
  const [velocity0, setVelocity0] = useState(10);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [gravityPreset, setGravityPreset] = useState('earth');
  const [kineResult, setKineResult] = useState('');

  // Energy
  const [mass, setMass] = useState(1);
  const [speed, setSpeed] = useState(10);
  const [height, setHeight] = useState(10);
  const [energyResult, setEnergyResult] = useState('');

  // Units
  const [convertFrom, setConvertFrom] = useState(1);
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [convertResult, setConvertResult] = useState('');

  // Mechanics & Forces
  const [forceMass, setForceMass] = useState(5);
  const [forceAccel, setForceAccel] = useState(9.81);
  const [frictionMu, setFrictionMu] = useState(0.2);
  const [normalForce, setNormalForce] = useState(50);
  const [momentumMass, setMomentumMass] = useState(5);
  const [momentumVelocity, setMomentumVelocity] = useState(10);
  const [circularMass, setCircularMass] = useState(2);
  const [circularVelocity, setCircularVelocity] = useState(12);
  const [circularRadius, setCircularRadius] = useState(4);
  const [forceResult, setForceResult] = useState('');

  // Electricity & Circuits
  const [voltage, setVoltage] = useState(12);
  const [current, setCurrent] = useState(2);
  const [resistance, setResistance] = useState(6);
  const [seriesResistors, setSeriesResistors] = useState('5, 10, 15');
  const [parallelResistors, setParallelResistors] = useState('5, 10, 15');
  const [capacitance, setCapacitance] = useState(0.01);
  const [circuitResult, setCircuitResult] = useState('');

  // Waves & Optics
  const [waveFreq, setWaveFreq] = useState(5);
  const [waveLambda, setWaveLambda] = useState(2);
  const [refractive1, setRefractive1] = useState(1);
  const [refractive2, setRefractive2] = useState(1.33);
  const [theta1, setTheta1] = useState(30);
  const [objectDistance, setObjectDistance] = useState(10);
  const [imageDistance, setImageDistance] = useState(20);
  const [opticsResult, setOpticsResult] = useState('');

  // Thermodynamics
  const [pressure, setPressure] = useState(101325);
  const [volume, setVolume] = useState(1);
  const [moles, setMoles] = useState(1);
  const [temperature, setTemperature] = useState(300);
  const [heatMass, setHeatMass] = useState(1);
  const [specificHeat, setSpecificHeat] = useState(4.18);
  const [deltaT, setDeltaT] = useState(10);
  const [entropy, setEntropy] = useState(50);
  const [thermoResult, setThermoResult] = useState('');

  const gravityPresets = {
    earth: 9.81,
    moon: 1.62,
    mars: 3.71,
    jupiter: 24.79,
    space: 0,
  };

  const handleGravityPreset = (preset) => {
    setGravityPreset(preset);
    setGravity(gravityPresets[preset]);
  };

  const computeProjectile = () => {
    try {
      const angleRad = (angle * Math.PI) / 180;
      const v0x = velocity0 * Math.cos(angleRad);
      const v0y = velocity0 * Math.sin(angleRad);
      const timeOfFlight = (2 * v0y) / gravity;
      const maxHeight = (v0y * v0y) / (2 * gravity);
      const range = v0x * timeOfFlight;
      setKineResult(`\n┌─────────────────────────────────────┐\n│  PROJECTILE MOTION ANALYSIS         │\n├─────────────────────────────────────┤\n│ Initial Velocity: ${velocity0.toFixed(2)} m/s │\n│ Launch Angle:   ${angle.toFixed(1)}°      │\n│ Gravity:        ${gravity.toFixed(2)} m/s² │\n├─────────────────────────────────────┤\n│ Time of Flight: ${timeOfFlight.toFixed(3)} s │\n│ Max Height:     ${maxHeight.toFixed(3)} m │\n│ Range:          ${range.toFixed(3)} m │\n└─────────────────────────────────────┘\n`);
    } catch (e) {
      setKineResult(`Error: ${e.message}`);
    }
  };

  const computeEnergy = () => {
    try {
      const KE = 0.5 * mass * speed * speed;
      const PE = mass * gravity * height;
      const TE = KE + PE;
      setEnergyResult(`\n┌─────────────────────────────────────┐\n│  ENERGY CALCULATION                 │\n├─────────────────────────────────────┤\n│ Mass:      ${mass.toFixed(2)} kg │\n│ Speed:     ${speed.toFixed(2)} m/s │\n│ Height:    ${height.toFixed(2)} m │\n│ Gravity:   ${gravity.toFixed(2)} m/s² │\n├─────────────────────────────────────┤\n│ Kinetic:   ${KE.toFixed(3)} J │\n│ Potential: ${PE.toFixed(3)} J │\n│ Total:     ${TE.toFixed(3)} J │\n└─────────────────────────────────────┘\n`);
    } catch (e) {
      setEnergyResult(`Error: ${e.message}`);
    }
  };

  const convertUnit = () => {
    try {
      const units = {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.34,
        kg: 1,
        g: 0.001,
        lb: 0.453592,
        s: 1,
        min: 60,
        h: 3600,
        N: 1,
        Pa: 1,
        atm: 101325,
      };
      if (!(unitFrom in units) || !(unitTo in units)) {
        setConvertResult('Invalid units');
        return;
      }
      const result = convertFrom * (units[unitFrom] / units[unitTo]);
      setConvertResult(`${convertFrom} ${unitFrom} = ${result.toFixed(6)} ${unitTo}`);
    } catch (e) {
      setConvertResult(`Error: ${e.message}`);
    }
  };

  const computeForceSet = () => {
    try {
      const F = forceMass * forceAccel;
      const friction = frictionMu * normalForce;
      const p = momentumMass * momentumVelocity;
      const Fc = (circularMass * circularVelocity * circularVelocity) / circularRadius;
      setForceResult(`F = ma = ${F.toFixed(4)} N\nF_friction = μN = ${friction.toFixed(4)} N\nMomentum = p = ${p.toFixed(4)} kg·m/s\nCentripetal Force = ${Fc.toFixed(4)} N`);
    } catch (e) {
      setForceResult(`Error: ${e.message}`);
    }
  };

  const computeCircuit = () => {
    try {
      const I = voltage / resistance;
      const P = voltage * current;
      const Q = capacitance * voltage;
      const series = seriesResistors
        .split(/[,;\s]+/)
        .map(Number)
        .filter(Number.isFinite);
      const parallel = parallelResistors
        .split(/[,;\s]+/)
        .map(Number)
        .filter(Number.isFinite);
      const seriesTotal = series.reduce((acc, r) => acc + r, 0);
      const parallelTotal = parallel.length ? 1 / parallel.reduce((acc, r) => acc + 1 / r, 0) : 0;
      setCircuitResult(`I = V/R = ${I.toFixed(4)} A\nP = VI = ${P.toFixed(4)} W\nQ = CV = ${Q.toFixed(4)} C\nSeries total = ${seriesTotal.toFixed(4)} Ω\nParallel total = ${parallelTotal.toFixed(4)} Ω`);
    } catch (e) {
      setCircuitResult(`Error: ${e.message}`);
    }
  };

  const computeOptics = () => {
    try {
      const v = waveFreq * waveLambda;
      const thetaRad = (theta1 * Math.PI) / 180;
      const theta2 = Math.asin((refractive1 / refractive2) * Math.sin(thetaRad)) * 180 / Math.PI;
      const f = 1 / ((1 / objectDistance) + (1 / imageDistance));
      setOpticsResult(`v = fλ = ${v.toFixed(4)} m/s\nθ₂ = ${theta2.toFixed(2)}°\nFocal length = ${f.toFixed(4)} m`);
    } catch (e) {
      setOpticsResult(`Error: ${e.message}`);
    }
  };

  const computeThermo = () => {
    try {
      const deltaH = heatMass * specificHeat * deltaT;
      const deltaG = deltaH - temperature * entropy / 1000;
      const PV = pressure * volume;
      setThermoResult(`PV = ${PV.toFixed(4)}\nQ = ${deltaH.toFixed(4)} J\nΔG ≈ ${deltaG.toFixed(4)} kJ`);
    } catch (e) {
      setThermoResult(`Error: ${e.message}`);
    }
  };

  return (
    <div className="physics-module">
      <div className="module-header">
        <h2>╔═══ PHYSICS ENGINE ═══╗</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'kinematics' ? 'active' : ''}`} onClick={() => setActiveTab('kinematics')}>Kinematics</button>
        <button className={`tab ${activeTab === 'energy' ? 'active' : ''}`} onClick={() => setActiveTab('energy')}>Energy</button>
        <button className={`tab ${activeTab === 'units' ? 'active' : ''}`} onClick={() => setActiveTab('units')}>Units</button>
        <button className={`tab ${activeTab === 'mechanics' ? 'active' : ''}`} onClick={() => setActiveTab('mechanics')}>Mechanics</button>
        <button className={`tab ${activeTab === 'circuits' ? 'active' : ''}`} onClick={() => setActiveTab('circuits')}>Circuits</button>
        <button className={`tab ${activeTab === 'optics' ? 'active' : ''}`} onClick={() => setActiveTab('optics')}>Optics</button>
        <button className={`tab ${activeTab === 'thermo' ? 'active' : ''}`} onClick={() => setActiveTab('thermo')}>Thermodynamics</button>
      </div>

      {activeTab === 'kinematics' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Initial Velocity (m/s):</label>
              <input type="number" value={velocity0} onChange={(e) => setVelocity0(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Launch Angle (degrees):</label>
              <input type="number" value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Gravity Preset:</label>
              <div className="preset-buttons">
                {Object.keys(gravityPresets).map((preset) => (
                  <button key={preset} className={`preset-btn ${gravityPreset === preset ? 'active' : ''}`} onClick={() => handleGravityPreset(preset)}>{preset.charAt(0).toUpperCase() + preset.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Gravity (m/s²):</label>
              <input type="number" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeProjectile} className="btn-compute">CALCULATE TRAJECTORY</button>
          {kineResult && <pre className="result-terminal">{kineResult}</pre>}
        </div>
      )}

      {activeTab === 'energy' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Mass (kg):</label>
              <input type="number" value={mass} onChange={(e) => setMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Speed (m/s):</label>
              <input type="number" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Height (m):</label>
              <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeEnergy} className="btn-compute">CALCULATE ENERGY</button>
          {energyResult && <pre className="result-terminal">{energyResult}</pre>}
        </div>
      )}

      {activeTab === 'units' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Value:</label>
              <input type="number" value={convertFrom} onChange={(e) => setConvertFrom(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>From Unit:</label>
              <select value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)}>
                <option>m</option>
                <option>km</option>
                <option>cm</option>
                <option>mm</option>
                <option>mi</option>
                <option>kg</option>
                <option>g</option>
                <option>lb</option>
              </select>
            </div>
            <div className="input-group">
              <label>To Unit:</label>
              <select value={unitTo} onChange={(e) => setUnitTo(e.target.value)}>
                <option>m</option>
                <option>km</option>
                <option>cm</option>
                <option>mm</option>
                <option>mi</option>
                <option>kg</option>
                <option>g</option>
                <option>lb</option>
              </select>
            </div>
          </div>
          <button onClick={convertUnit} className="btn-compute">CONVERT</button>
          {convertResult && <div className="result-terminal">{convertResult}</div>}
        </div>
      )}

      {activeTab === 'mechanics' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Mass (kg):</label>
              <input type="number" value={forceMass} onChange={(e) => setForceMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Acceleration (m/s²):</label>
              <input type="number" value={forceAccel} onChange={(e) => setForceAccel(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Friction Coefficient μ:</label>
              <input type="number" step="0.01" value={frictionMu} onChange={(e) => setFrictionMu(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Normal Force (N):</label>
              <input type="number" value={normalForce} onChange={(e) => setNormalForce(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Momentum Mass (kg):</label>
              <input type="number" value={momentumMass} onChange={(e) => setMomentumMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Momentum Velocity (m/s):</label>
              <input type="number" value={momentumVelocity} onChange={(e) => setMomentumVelocity(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Circular radius (m):</label>
              <input type="number" value={circularRadius} onChange={(e) => setCircularRadius(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Circular velocity (m/s):</label>
              <input type="number" value={circularVelocity} onChange={(e) => setCircularVelocity(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeForceSet} className="btn-compute">CALCULATE FORCES</button>
          {forceResult && <div className="result-terminal">{forceResult}</div>}
        </div>
      )}

      {activeTab === 'circuits' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Voltage (V):</label>
              <input type="number" value={voltage} onChange={(e) => setVoltage(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Current (A):</label>
              <input type="number" value={current} onChange={(e) => setCurrent(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Resistance (Ω):</label>
              <input type="number" value={resistance} onChange={(e) => setResistance(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Capacitance (F):</label>
              <input type="number" value={capacitance} onChange={(e) => setCapacitance(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Series resistors:</label>
              <input type="text" value={seriesResistors} onChange={(e) => setSeriesResistors(e.target.value)} placeholder="5, 10, 15" />
            </div>
            <div className="input-group">
              <label>Parallel resistors:</label>
              <input type="text" value={parallelResistors} onChange={(e) => setParallelResistors(e.target.value)} placeholder="5, 10, 15" />
            </div>
          </div>
          <button onClick={computeCircuit} className="btn-compute">CALCULATE CIRCUIT</button>
          {circuitResult && <div className="result-terminal">{circuitResult}</div>}
        </div>
      )}

      {activeTab === 'optics' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Frequency (Hz):</label>
              <input type="number" value={waveFreq} onChange={(e) => setWaveFreq(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Wavelength (m):</label>
              <input type="number" value={waveLambda} onChange={(e) => setWaveLambda(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Index n1:</label>
              <input type="number" value={refractive1} onChange={(e) => setRefractive1(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Index n2:</label>
              <input type="number" value={refractive2} onChange={(e) => setRefractive2(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Incident angle θ₁ (°):</label>
              <input type="number" value={theta1} onChange={(e) => setTheta1(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Object distance (do):</label>
              <input type="number" value={objectDistance} onChange={(e) => setObjectDistance(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Image distance (di):</label>
              <input type="number" value={imageDistance} onChange={(e) => setImageDistance(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeOptics} className="btn-compute">SOLVE OPTICS</button>
          {opticsResult && <div className="result-terminal">{opticsResult}</div>}
        </div>
      )}

      {activeTab === 'thermo' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Pressure (Pa):</label>
              <input type="number" value={pressure} onChange={(e) => setPressure(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Volume (m³):</label>
              <input type="number" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Moles (n):</label>
              <input type="number" value={moles} onChange={(e) => setMoles(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Temperature (K):</label>
              <input type="number" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Mass (kg):</label>
              <input type="number" value={heatMass} onChange={(e) => setHeatMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Specific heat (J/kg·K):</label>
              <input type="number" value={specificHeat} onChange={(e) => setSpecificHeat(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>ΔT (K):</label>
              <input type="number" value={deltaT} onChange={(e) => setDeltaT(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Entropy (J/K):</label>
              <input type="number" value={entropy} onChange={(e) => setEntropy(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeThermo} className="btn-compute">CALCULATE THERMODYNAMICS</button>
          {thermoResult && <div className="result-terminal">{thermoResult}</div>}
        </div>
      )}
    </div>
  );
}
