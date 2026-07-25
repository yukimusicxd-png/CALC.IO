import React, { useState } from 'react';
import '../styles/SystemReference.css';

const CONSTANTS = [
  { name: 'Speed of Light', symbol: 'c', value: '299792458', unit: 'm/s' },
  { name: 'Gravitational Constant', symbol: 'G', value: '6.67430e-11', unit: 'N⋅m²/kg²' },
  { name: 'Planck Constant', symbol: 'h', value: '6.62607015e-34', unit: 'J⋅s' },
  { name: 'Elementary Charge', symbol: 'e', value: '1.602176634e-19', unit: 'C' },
  { name: 'Boltzmann Constant', symbol: 'k', value: '1.380649e-23', unit: 'J/K' },
  { name: 'Avogadro Number', symbol: 'N_A', value: '6.02214076e23', unit: 'mol⁻¹' },
  { name: 'Gas Constant', symbol: 'R', value: '8.314462618', unit: 'J/(mol·K)' },
  { name: 'Fine Structure Const', symbol: 'α', value: '7.2973525693e-3', unit: 'dimensionless' },
  { name: 'Vacuum Permittivity', symbol: 'ε₀', value: '8.8541878128e-12', unit: 'F/m' },
  { name: 'Vacuum Permeability', symbol: 'μ₀', value: '1.25663706212e-6', unit: 'H/m' },
  { name: 'Electron Mass', symbol: 'm_e', value: '9.1093837015e-31', unit: 'kg' },
  { name: 'Proton Mass', symbol: 'm_p', value: '1.67262192369e-27', unit: 'kg' },
  { name: 'Earth Mass', symbol: 'M_E', value: '5.9722e24', unit: 'kg' },
  { name: 'Earth Radius', symbol: 'R_E', value: '6371000', unit: 'm' },
  { name: 'Solar Mass', symbol: 'M_☉', value: '1.98892e30', unit: 'kg' },
  { name: 'Stefan-Boltzmann', symbol: 'σ', value: '5.670374419e-8', unit: 'W/(m²⋅K⁴)' },
];

export default function SystemReference() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstant, setSelectedConstant] = useState(CONSTANTS[0]);

  const filtered = CONSTANTS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="system-reference">
      <div className="module-header">
        <h2>╔═══ SYSTEM REFERENCE ═══╗</h2>
      </div>

      <div className="reference-container">
        <div className="search-section">
          <label>Search Constants:</label>
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="constants-list">
          <h3>Physical Constants Database</h3>
          <div className="list-items">
            {filtered.map((constant, idx) => (
              <div
                key={idx}
                className={`constant-item ${selectedConstant.symbol === constant.symbol ? 'active' : ''}`}
                onClick={() => setSelectedConstant(constant)}
              >
                <div className="item-header">
                  <span className="name">{constant.name}</span>
                  <span className="symbol">[{constant.symbol}]</span>
                </div>
                <div className="item-value">{constant.value}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedConstant && (
          <div className="constant-detail">
            <div className="detail-header">
              <h3>{selectedConstant.name}</h3>
            </div>
            <div className="detail-content">
              <div className="detail-row">
                <span className="label">Symbol:</span>
                <span className="value mono">{selectedConstant.symbol}</span>
              </div>
              <div className="detail-row">
                <span className="label">Value:</span>
                <span className="value mono">{selectedConstant.value}</span>
              </div>
              <div className="detail-row">
                <span className="label">Unit:</span>
                <span className="value">{selectedConstant.unit}</span>
              </div>
              <div className="copy-button">
                <button onClick={() => navigator.clipboard.writeText(selectedConstant.value)}>
                  COPY VALUE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
