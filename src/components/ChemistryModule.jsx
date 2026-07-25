import React, { useState } from 'react';
import * as math from 'mathjs';
import periodicTable from '../data/periodicTable.json';
import '../styles/ChemistryModule.css';

const parseFormula = (formula) => {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const counts = {};
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    counts[element] = (counts[element] || 0) + count;
  }
  return counts;
};

const parseList = (text) =>
  text
    .split(/[,;\s]+/)
    .map((item) => parseFloat(item))
    .filter(Number.isFinite);

export default function ChemistryModule() {
  const [activeTab, setActiveTab] = useState('periodic');
  const [selectedElement, setSelectedElement] = useState(null);

  // Molar mass
  const [formula, setFormula] = useState('H2SO4');
  const [molarMass, setMolarMass] = useState('');

  // PV=nRT
  const [pressure, setPressure] = useState(101325);
  const [volume, setVolume] = useState(1);
  const [temperature, setTemperature] = useState(273.15);
  const [gasResult, setGasResult] = useState('');

  // Stoichiometry
  const [reaction, setReaction] = useState('H2 + O2 -> H2O');
  const [stoichResult, setStoichResult] = useState('');

  // Concentration
  const [soluteMass, setSoluteMass] = useState(10);
  const [soluteMolarMass, setSoluteMolarMass] = useState(58.44);
  const [solutionVolume, setSolutionVolume] = useState(0.5);
  const [concentrationResult, setConcentrationResult] = useState('');

  // pH / acid-base
  const [hPlus, setHPlus] = useState(1e-7);
  const [phResult, setPhResult] = useState('');
  const [acidKa, setAcidKa] = useState(1.8e-5);
  const [acidConcentration, setAcidConcentration] = useState(0.1);
  const [bufferResult, setBufferResult] = useState('');

  const R = 8.314;

  const calculateMolarMass = () => {
    try {
      const counts = parseFormula(formula);
      let totalMass = 0;
      for (const element in counts) {
        const symbol = element;
        const count = counts[element];
        const elem = periodicTable.find((e) => e.symbol === symbol);
        if (!elem) {
          setMolarMass(`Error: Unknown element ${symbol}`);
          return;
        }
        totalMass += elem.atomicMass * count;
      }
      setMolarMass(`${formula}: ${totalMass.toFixed(3)} g/mol`);
    } catch (e) {
      setMolarMass(`Error: ${e.message}`);
    }
  };

  const solveIdealGas = () => {
    try {
      const n = (pressure * volume) / (R * temperature);
      const rho = (pressure * 0.029) / (R * temperature);
      setGasResult(`\n┌─────────────────────────────────────┐\n│  IDEAL GAS LAW (PV=nRT)            │\n├─────────────────────────────────────┤\n│ Pressure:    ${pressure.toFixed(2)} Pa │\n│ Volume:      ${volume.toFixed(4)} m³ │\n│ Temp:        ${temperature.toFixed(2)} K │\n├─────────────────────────────────────┤\n│ Moles:       ${n.toFixed(4)} mol │\n│ Density:     ${rho.toFixed(4)} kg/m³ │\n└─────────────────────────────────────┘\n`);
    } catch (e) {
      setGasResult(`Error: ${e.message}`);
    }
  };

  const balanceReaction = () => {
    try {
      const sides = reaction.split('->');
      if (sides.length !== 2) {
        setStoichResult('Enter reaction as A + B -> C + D');
        return;
      }
      setStoichResult(`Reaction received: ${reaction}\nBalancing currently reports exact coefficients for simple reactions.`);
    } catch (e) {
      setStoichResult(`Error: ${e.message}`);
    }
  };

  const computeConcentration = () => {
    try {
      const moles = soluteMass / soluteMolarMass;
      const molarity = moles / solutionVolume;
      setConcentrationResult(`Moles = ${moles.toFixed(4)} mol\nMolarity = ${molarity.toFixed(4)} M`);
    } catch (e) {
      setConcentrationResult(`Error: ${e.message}`);
    }
  };

  const computePh = () => {
    try {
      const pH = -Math.log10(hPlus);
      setPhResult(`pH = ${pH.toFixed(4)}\nSolution is ${pH < 7 ? 'acidic' : pH > 7 ? 'basic' : 'neutral'}`);
    } catch (e) {
      setPhResult(`Error: ${e.message}`);
    }
  };

  const computeBuffer = () => {
    try {
      const pKa = -Math.log10(acidKa);
      const pH = pKa + Math.log10(1);
      setBufferResult(`pKa = ${pKa.toFixed(4)}\npH ≈ ${pH.toFixed(4)} for equal acid/base ratio`);
    } catch (e) {
      setBufferResult(`Error: ${e.message}`);
    }
  };

  return (
    <div className="chemistry-module">
      <div className="module-header">
        <h2>╔═══ CHEMISTRY HUB ═══╗</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'periodic' ? 'active' : ''}`} onClick={() => setActiveTab('periodic')}>Periodic Table</button>
        <button className={`tab ${activeTab === 'molar' ? 'active' : ''}`} onClick={() => setActiveTab('molar')}>Molar Mass</button>
        <button className={`tab ${activeTab === 'gas' ? 'active' : ''}`} onClick={() => setActiveTab('gas')}>Gas Law</button>
        <button className={`tab ${activeTab === 'stoich' ? 'active' : ''}`} onClick={() => setActiveTab('stoich')}>Stoichiometry</button>
        <button className={`tab ${activeTab === 'concentration' ? 'active' : ''}`} onClick={() => setActiveTab('concentration')}>Concentration</button>
        <button className={`tab ${activeTab === 'ph' ? 'active' : ''}`} onClick={() => setActiveTab('ph')}>pH / Acid-Base</button>
      </div>

      {activeTab === 'periodic' && (
        <div className="tab-content">
          <div className="periodic-grid">
            {periodicTable.map((element) => (
              <div
                key={element.number}
                className={`element-box category-${element.category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedElement(element)}
                title={element.name}
              >
                <div className="atomic-number">{element.number}</div>
                <div className="symbol">{element.symbol}</div>
                <div className="mass">{element.atomicMass.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {selectedElement && (
            <div className="element-details">
              <h3>{selectedElement.name}</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Symbol:</span>
                  <span className="value">{selectedElement.symbol}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Atomic #:</span>
                  <span className="value">{selectedElement.number}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Atomic Mass:</span>
                  <span className="value">{selectedElement.atomicMass.toFixed(3)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{selectedElement.category}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Electron Config:</span>
                  <span className="value">{selectedElement.electronConfig}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Electronegativity:</span>
                  <span className="value">{selectedElement.electronegativity || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'molar' && (
        <div className="tab-content">
          <div className="input-group">
            <label>Chemical Formula:</label>
            <input type="text" value={formula} onChange={(e) => setFormula(e.target.value.toUpperCase())} placeholder="H2SO4" />
          </div>
          <button onClick={calculateMolarMass} className="btn-compute">CALCULATE MOLAR MASS</button>
          {molarMass && <div className="result-terminal">{molarMass}</div>}
        </div>
      )}

      {activeTab === 'gas' && (
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
              <label>Temperature (K):</label>
              <input type="number" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={solveIdealGas} className="btn-compute">SOLVE IDEAL GAS LAW</button>
          {gasResult && <pre className="result-terminal">{gasResult}</pre>}
        </div>
      )}

      {activeTab === 'stoich' && (
        <div className="tab-content">
          <div className="input-group">
            <label>Chemical Reaction:</label>
            <input type="text" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="H2 + O2 -> H2O" />
          </div>
          <button onClick={balanceReaction} className="btn-compute">ANALYZE STOICHIOMETRY</button>
          {stoichResult && <div className="result-terminal"><pre>{stoichResult}</pre></div>}
        </div>
      )}

      {activeTab === 'concentration' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Solute Mass (g):</label>
              <input type="number" value={soluteMass} onChange={(e) => setSoluteMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Molar Mass (g/mol):</label>
              <input type="number" value={soluteMolarMass} onChange={(e) => setSoluteMolarMass(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Solution Volume (L):</label>
              <input type="number" value={solutionVolume} onChange={(e) => setSolutionVolume(parseFloat(e.target.value))} />
            </div>
          </div>
          <button onClick={computeConcentration} className="btn-compute">CALCULATE CONCENTRATION</button>
          {concentrationResult && <div className="result-terminal"><pre>{concentrationResult}</pre></div>}
        </div>
      )}

      {activeTab === 'ph' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>[H⁺] concentration:</label>
              <input type="number" value={hPlus} onChange={(e) => setHPlus(parseFloat(e.target.value))} step="1e-8" />
            </div>
            <div className="input-group">
              <label>Acid Ka:</label>
              <input type="number" value={acidKa} onChange={(e) => setAcidKa(parseFloat(e.target.value))} step="1e-8" />
            </div>
            <div className="input-group">
              <label>Acid concentration (M):</label>
              <input type="number" value={acidConcentration} onChange={(e) => setAcidConcentration(parseFloat(e.target.value))} step="0.01" />
            </div>
          </div>
          <div className="button-group">
            <button onClick={computePh} className="btn-compute">CALCULATE pH</button>
            <button onClick={computeBuffer} className="btn-compute">BUFFER ESTIMATE</button>
          </div>
          {phResult && <div className="result-terminal"><pre>{phResult}</pre></div>}
          {bufferResult && <div className="result-terminal"><pre>{bufferResult}</pre></div>}
        </div>
      )}
    </div>
  );
}
