import React, { useState, useRef } from 'react';
import * as math from 'mathjs';
import { Chart, registerables } from 'chart.js';
import '../styles/MathModule.css';

Chart.register(...registerables);

const parseList = (text) =>
  text
    .split(/[,;\s]+/)
    .map((item) => parseFloat(item))
    .filter((n) => Number.isFinite(n));

const polyAdd = (a, b) => {
  const result = Array(Math.max(a.length, b.length)).fill(0);
  for (let i = 0; i < result.length; i += 1) {
    result[i] = (a[i] || 0) + (b[i] || 0);
  }
  return result;
};

const polyMultiply = (a, b) => {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
};

const polyPower = (poly, exponent) => {
  let output = [1];
  for (let i = 0; i < exponent; i += 1) {
    output = polyMultiply(output, poly);
  }
  return output;
};

const formatPolynomial = (coeffs) => {
  const terms = [];
  for (let i = coeffs.length - 1; i >= 0; i -= 1) {
    const coeff = coeffs[i];
    if (!coeff) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? ' - ' : terms.length ? ' + ' : '';
    const term =
      i === 0
        ? `${absCoeff}`
        : i === 1
        ? `${absCoeff === 1 ? '' : absCoeff}x`
        : `${absCoeff === 1 ? '' : absCoeff}x^${i}`;
    terms.push(`${sign}${term}`.trimStart());
  }
  return terms.length ? terms.join('') : '0';
};

const toPolynomialCoefficients = (node, symbol = 'x') => {
  switch (node.type) {
    case 'ConstantNode':
      return [parseFloat(node.value) || 0];
    case 'SymbolNode':
      return node.name === symbol ? [0, 1] : null;
    case 'OperatorNode': {
      const { op, args } = node;
      if (op === '+') {
        const a = toPolynomialCoefficients(args[0], symbol);
        const b = toPolynomialCoefficients(args[1], symbol);
        return a && b ? polyAdd(a, b) : null;
      }
      if (op === '-') {
        const a = toPolynomialCoefficients(args[0], symbol);
        const b = toPolynomialCoefficients(args[1], symbol);
        return a && b ? polyAdd(a, b.map((value) => -value)) : null;
      }
      if (op === '*') {
        const a = toPolynomialCoefficients(args[0], symbol);
        const b = toPolynomialCoefficients(args[1], symbol);
        return a && b ? polyMultiply(a, b) : null;
      }
      if (op === '^') {
        const base = toPolynomialCoefficients(args[0], symbol);
        const exponent = Number(args[1].value);
        return base && Number.isInteger(exponent) && exponent >= 0 ? polyPower(base, exponent) : null;
      }
      break;
    }
    case 'ParenthesisNode':
      return toPolynomialCoefficients(node.content, symbol);
    default:
      return null;
  }
};

const modeLabel = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷',
};

export default function MathModule() {
  const [activeTab, setActiveTab] = useState('calculus');

  // Calculus
  const [expression, setExpression] = useState('x^2 + 3*x + 2');
  const [variable, setVariable] = useState('x');
  const [derivResult, setDerivResult] = useState('');
  const [integResult, setIntegResult] = useState('');

  // Matrix
  const [matrix1, setMatrix1] = useState([[1, 2], [3, 4]]);
  const [matrix2, setMatrix2] = useState([[5, 6], [7, 8]]);
  const [matrixOp, setMatrixOp] = useState('add');
  const [matrixResult, setMatrixResult] = useState('');

  // Graph
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [graphExpr, setGraphExpr] = useState('sin(x)');

  // Algebra & Polynomials
  const [polyA, setPolyA] = useState(1);
  const [polyB, setPolyB] = useState(3);
  const [polyC, setPolyC] = useState(2);
  const [polyD, setPolyD] = useState(1);
  const [quadraticResult, setQuadraticResult] = useState('');
  const [cubicResult, setCubicResult] = useState('');
  const [expandExpr, setExpandExpr] = useState('(x + 2)*(x - 1)^2');
  const [expandResult, setExpandResult] = useState('');
  const [factorResult, setFactorResult] = useState('');

  // Statistics & Probability
  const [statsData, setStatsData] = useState('1, 2, 2, 3, 5, 8');
  const [statsResult, setStatsResult] = useState('');
  const [nValue, setNValue] = useState(5);
  const [rValue, setRValue] = useState(2);
  const [nCrResult, setNCrResult] = useState('');
  const [nPrResult, setNPrResult] = useState('');

  // Geometry & Trigonometry
  const [angleValue, setAngleValue] = useState(30);
  const [trigResult, setTrigResult] = useState('');
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const [hypotenuse, setHypotenuse] = useState(5);
  const [triangleResult, setTriangleResult] = useState('');
  const [shapeType, setShapeType] = useState('circle');
  const [dimR, setDimR] = useState(3);
  const [dimW, setDimW] = useState(4);
  const [dimH, setDimH] = useState(5);
  const [shapeResult, setShapeResult] = useState('');

  // Complex Numbers
  const [complexA, setComplexA] = useState('2 + 3i');
  const [complexB, setComplexB] = useState('1 - 4i');
  const [complexOp, setComplexOp] = useState('add');
  const [complexResult, setComplexResult] = useState('');

  const computeDerivative = () => {
    try {
      const h = 0.0001;
      const xVal = 1;
      const f = (x) => math.evaluate(expression, { [variable]: x });
      const deriv = (f(xVal + h) - f(xVal - h)) / (2 * h);
      setDerivResult(`Numerical derivative at ${variable}=${xVal}: ${deriv.toFixed(6)}\n\nUse symbolic form: d/d${variable}(${expression})`);
    } catch (e) {
      setDerivResult(`Error: ${e.message}`);
    }
  };

  const computeIntegral = () => {
    try {
      const a = 0;
      const b = 10;
      const n = 1000;
      const h = (b - a) / n;
      let sum = 0;
      const f = (x) => math.evaluate(expression, { [variable]: x });
      for (let i = 0; i <= n; i += 1) {
        const x = a + i * h;
        const coeff = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
        sum += coeff * f(x);
      }
      const integral = (sum * h) / 3;
      setIntegResult(`Numerical integral from ${a} to ${b}:\n∫${expression}d${variable} ≈ ${integral.toFixed(6)}`);
    } catch (e) {
      setIntegResult(`Error: ${e.message}`);
    }
  };

  const performMatrixOp = () => {
    try {
      const m1 = math.matrix(matrix1);
      const m2 = math.matrix(matrix2);
      let result;
      switch (matrixOp) {
        case 'add':
          result = math.add(m1, m2);
          break;
        case 'subtract':
          result = math.subtract(m1, m2);
          break;
        case 'multiply':
          result = math.multiply(m1, m2);
          break;
        case 'det1':
          setMatrixResult(`Determinant: ${math.det(m1)}`);
          return;
        case 'inv1':
          result = math.inv(m1);
          break;
        default:
          result = m1;
      }
      setMatrixResult(JSON.stringify(result.toArray ? result.toArray() : result, null, 2));
    } catch (e) {
      setMatrixResult(`Error: ${e.message}`);
    }
  };

  const plotGraph = () => {
    try {
      const points = [];
      const step = 0.5;
      for (let x = -10; x <= 10; x += step) {
        const y = math.evaluate(graphExpr, { x });
        if (typeof y === 'number' && isFinite(y)) {
          points.push({ x, y });
        }
      }
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: graphExpr,
              data: points,
              borderColor: '#00FF66',
              backgroundColor: 'rgba(0, 255, 102, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              showLine: true,
              fill: false,
              pointRadius: 2,
              pointBackgroundColor: '#00FF66',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: '#00FF66',
                font: { family: "'Courier New', monospace" },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'X', color: '#00FF66' },
              grid: { color: 'rgba(0, 255, 102, 0.1)' },
              ticks: { color: '#00FF66' },
            },
            y: {
              title: { display: true, text: 'Y', color: '#00FF66' },
              grid: { color: 'rgba(0, 255, 102, 0.1)' },
              ticks: { color: '#00FF66' },
            },
          },
        },
      });
    } catch (e) {
      setGraphExpr(`Error: ${e.message}`);
    }
  };

  const solveQuadratic = () => {
    try {
      const a = parseFloat(polyA);
      const b = parseFloat(polyB);
      const c = parseFloat(polyC);
      const disc = b * b - 4 * a * c;
      const root1 = math.round((-b + math.sqrt(disc)) / (2 * a), 6);
      const root2 = math.round((-b - math.sqrt(disc)) / (2 * a), 6);
      setQuadraticResult(`Quadratic Solver: ${a}x^2 + ${b}x + ${c}\nDiscriminant: ${disc}\nRoots: ${root1}, ${root2}`);
      const factor = disc >= 0 ? `(x - ${root1})(x - ${root2})` : `(x + ${math.round(b / (2 * a), 6)})^2 + ${math.round(-disc / (4 * a), 6)}`;
      setFactorResult(`Factorization: ${factor}`);
    } catch (e) {
      setQuadraticResult(`Error: ${e.message}`);
    }
  };

  const solveCubic = () => {
    try {
      const a = parseFloat(polyA);
      const b = parseFloat(polyB);
      const c = parseFloat(polyC);
      const d = parseFloat(polyD);
      const p = (3 * a * c - b * b) / (3 * a * a);
      const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
      const discriminant = (q * q) / 4 + (p * p * p) / 27;
      const offset = -b / (3 * a);
      let roots;
      if (discriminant > 0) {
        const sqrtDisc = Math.sqrt(discriminant);
        const u = Math.cbrt(-q / 2 + sqrtDisc);
        const v = Math.cbrt(-q / 2 - sqrtDisc);
        roots = [u + v + offset];
      } else {
        const r = Math.sqrt(-p * p * p / 27);
        const phi = Math.acos((-q / 2) / r);
        const m = 2 * Math.cbrt(r);
        roots = [
          m * Math.cos(phi / 3) + offset,
          m * Math.cos((phi + 2 * Math.PI) / 3) + offset,
          m * Math.cos((phi + 4 * Math.PI) / 3) + offset,
        ];
      }
      setCubicResult(`Cubic roots for ${a}x^3 + ${b}x^2 + ${c}x + ${d}: ${roots.map((r) => Number(r).toFixed(6)).join(', ')}`);
    } catch (e) {
      setCubicResult(`Error: ${e.message}`);
    }
  };

  const expandPolynomial = () => {
    try {
      const parsed = math.parse(expandExpr);
      const coeffs = toPolynomialCoefficients(parsed);
      if (!coeffs) {
        setExpandResult('Unable to expand expression to a polynomial form.');
        return;
      }
      setExpandResult(formatPolynomial(coeffs));
    } catch (e) {
      setExpandResult(`Error: ${e.message}`);
    }
  };

  const computeStatistics = () => {
    try {
      const values = parseList(statsData);
      if (!values.length) {
        setStatsResult('No valid numbers detected.');
        return;
      }
      const mean = math.mean(values);
      const median = math.median(values);
      const variance = math.variance(values);
      const stddev = math.sqrt(variance);
      const freq = values.reduce((acc, val) => ({ ...acc, [val]: (acc[val] || 0) + 1 }), {});
      const mode = Object.keys(freq).reduce((a, b) => (freq[a] >= freq[b] ? a : b));
      setStatsResult(`Mean: ${mean.toFixed(4)}\nMedian: ${median}\nMode: ${mode}\nStd Dev: ${stddev.toFixed(4)}\nVariance: ${variance.toFixed(4)}`);
    } catch (e) {
      setStatsResult(`Error: ${e.message}`);
    }
  };

  const computeCombinatorics = () => {
    try {
      const n = parseInt(nValue, 10);
      const r = parseInt(rValue, 10);
      const comb = math.combinations(n, r);
      const perm = math.permutations(n, r);
      setNCrResult(`${n}C${r} = ${comb}`);
      setNPrResult(`${n}P${r} = ${perm}`);
    } catch (e) {
      setNCrResult(`Error: ${e.message}`);
      setNPrResult('');
    }
  };

  const computeTrig = () => {
    try {
      const radians = (parseFloat(angleValue) * Math.PI) / 180;
      setTrigResult(`sin(${angleValue}°) = ${math.sin(radians).toFixed(6)}\ncos(${angleValue}°) = ${math.cos(radians).toFixed(6)}\ntan(${angleValue}°) = ${math.tan(radians).toFixed(6)}`);
    } catch (e) {
      setTrigResult(`Error: ${e.message}`);
    }
  };

  const solveRightTriangle = () => {
    try {
      const a = parseFloat(sideA);
      const b = parseFloat(sideB);
      const c = parseFloat(hypotenuse);
      let answer = [];
      if (a && b) {
        const hyp = math.sqrt(a * a + b * b);
        const angleA = math.atan2(a, b) * 180 / Math.PI;
        const angleB = 90 - angleA;
        answer.push(`Hypotenuse: ${hyp.toFixed(4)}`);
        answer.push(`Angle A: ${angleA.toFixed(2)}°`);
        answer.push(`Angle B: ${angleB.toFixed(2)}°`);
      } else if (a && c) {
        const other = math.sqrt(c * c - a * a);
        answer.push(`Other side: ${other.toFixed(4)}`);
      } else if (b && c) {
        const other = math.sqrt(c * c - b * b);
        answer.push(`Other side: ${other.toFixed(4)}`);
      } else {
        answer.push('Enter at least two known values.');
      }
      setTriangleResult(answer.join('\n'));
    } catch (e) {
      setTriangleResult(`Error: ${e.message}`);
    }
  };

  const computeShape = () => {
    try {
      const r = parseFloat(dimR);
      const w = parseFloat(dimW);
      const h = parseFloat(dimH);
      let text = '';
      switch (shapeType) {
        case 'circle':
          text = `Area = πr² = ${(Math.PI * r * r).toFixed(4)}`;
          break;
        case 'rectangle':
          text = `Area = w × h = ${(w * h).toFixed(4)}`;
          break;
        case 'triangle':
          text = `Area = 0.5 × base × height = ${(0.5 * w * h).toFixed(4)}`;
          break;
        case 'sphere':
          text = `Surface Area = 4πr² = ${(4 * Math.PI * r * r).toFixed(4)}\nVolume = 4/3 πr³ = ${(4 / 3 * Math.PI * r ** 3).toFixed(4)}`;
          break;
        case 'cylinder':
          text = `Surface Area = 2πr(h+r) = ${(2 * Math.PI * r * (h + r)).toFixed(4)}\nVolume = πr²h = ${(Math.PI * r * r * h).toFixed(4)}`;
          break;
        case 'cube':
          text = `Surface Area = 6a² = ${(6 * w * w).toFixed(4)}\nVolume = a³ = ${(w ** 3).toFixed(4)}`;
          break;
        case 'rectangular-prism':
          text = `Surface Area = 2(lw + lh + wh) = ${(2 * (r * w + r * h + w * h)).toFixed(4)}\nVolume = lwh = ${(r * w * h).toFixed(4)}`;
          break;
        default:
          text = 'Choose a shape.';
      }
      setShapeResult(text);
    } catch (e) {
      setShapeResult(`Error: ${e.message}`);
    }
  };

  const computeComplex = () => {
    try {
      const a = math.complex(complexA);
      const b = math.complex(complexB);
      let result;
      switch (complexOp) {
        case 'add':
          result = math.add(a, b);
          break;
        case 'subtract':
          result = math.subtract(a, b);
          break;
        case 'multiply':
          result = math.multiply(a, b);
          break;
        case 'divide':
          result = math.divide(a, b);
          break;
        default:
          result = a;
      }
      setComplexResult(`Result: ${result.toString()}\nModulus: ${math.abs(result).toFixed(4)}\nArgument: ${math.arg(result).toFixed(4)} rad\nPolar: ${math.format(result, { notation: 'fixed', precision: 4 })}`);
    } catch (e) {
      setComplexResult(`Error: ${e.message}`);
    }
  };

  return (
    <div className="math-module">
      <div className="module-header">
        <h2>╔═══ MATHEMATICS ENGINE ═══╗</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'calculus' ? 'active' : ''}`} onClick={() => setActiveTab('calculus')}>Calculus</button>
        <button className={`tab ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>Matrix</button>
        <button className={`tab ${activeTab === 'graph' ? 'active' : ''}`} onClick={() => setActiveTab('graph')}>Graph</button>
        <button className={`tab ${activeTab === 'algebra' ? 'active' : ''}`} onClick={() => setActiveTab('algebra')}>Algebra & Polynomials</button>
        <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Statistics & Probability</button>
        <button className={`tab ${activeTab === 'geometry' ? 'active' : ''}`} onClick={() => setActiveTab('geometry')}>Geometry & Trigonometry</button>
        <button className={`tab ${activeTab === 'complex' ? 'active' : ''}`} onClick={() => setActiveTab('complex')}>Complex Numbers</button>
      </div>

      {activeTab === 'calculus' && (
        <div className="tab-content">
          <div className="input-group">
            <label>Expression (use 'x' as variable):</label>
            <input type="text" value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="e.g., x^2 + 3*x + 2" />
          </div>
          <div className="button-group">
            <button onClick={computeDerivative} className="btn-compute">COMPUTE DERIVATIVE</button>
            <button onClick={computeIntegral} className="btn-compute">COMPUTE INTEGRAL</button>
          </div>
          <div className="results">
            {derivResult && <div className="result-box"><strong>d/dx:</strong> <code>{derivResult}</code></div>}
            {integResult && <div className="result-box"><strong>∫dx:</strong> <code>{integResult}</code></div>}
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="tab-content">
          <div className="matrix-section">
            <label>Matrix Operation:</label>
            <select value={matrixOp} onChange={(e) => setMatrixOp(e.target.value)}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="multiply">Multiply</option>
              <option value="det1">Determinant (M1)</option>
              <option value="inv1">Inverse (M1)</option>
            </select>
            <button onClick={performMatrixOp} className="btn-compute">EXECUTE</button>
          </div>
          {matrixResult && <div className="result-box"><strong>Result:</strong><pre>{matrixResult}</pre></div>}
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="tab-content">
          <div className="input-group">
            <label>Function to plot:</label>
            <input type="text" value={graphExpr} onChange={(e) => setGraphExpr(e.target.value)} placeholder="e.g., sin(x), x^2, sqrt(x)" />
          </div>
          <button onClick={plotGraph} className="btn-compute">PLOT FUNCTION</button>
          <div className="graph-container"><canvas ref={chartRef}></canvas></div>
        </div>
      )}

      {activeTab === 'algebra' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Quadratic Coefficients:</label>
              <input type="number" value={polyA} onChange={(e) => setPolyA(e.target.value)} placeholder="a" />
              <input type="number" value={polyB} onChange={(e) => setPolyB(e.target.value)} placeholder="b" />
              <input type="number" value={polyC} onChange={(e) => setPolyC(e.target.value)} placeholder="c" />
              <button onClick={solveQuadratic} className="btn-compute">SOLVE QUADRATIC</button>
            </div>
            <div className="input-group">
              <label>Cubic Coefficients:</label>
              <input type="number" value={polyA} onChange={(e) => setPolyA(e.target.value)} placeholder="a" />
              <input type="number" value={polyB} onChange={(e) => setPolyB(e.target.value)} placeholder="b" />
              <input type="number" value={polyC} onChange={(e) => setPolyC(e.target.value)} placeholder="c" />
              <input type="number" value={polyD} onChange={(e) => setPolyD(e.target.value)} placeholder="d" />
              <button onClick={solveCubic} className="btn-compute">SOLVE CUBIC</button>
            </div>
            <div className="input-group">
              <label>Polynomial Expansion:</label>
              <input type="text" value={expandExpr} onChange={(e) => setExpandExpr(e.target.value)} placeholder="e.g., (x + 2)*(x - 1)^2" />
              <button onClick={expandPolynomial} className="btn-compute">EXPAND POLYNOMIAL</button>
            </div>
          </div>
          <div className="result-box">
            {quadraticResult && <pre>{quadraticResult}</pre>}
            {factorResult && <pre>{factorResult}</pre>}
            {expandResult && <pre><strong>Expanded:</strong> {expandResult}</pre>}
            {cubicResult && <pre>{cubicResult}</pre>}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Data set (comma-separated):</label>
              <input type="text" value={statsData} onChange={(e) => setStatsData(e.target.value)} placeholder="e.g., 1, 2, 2, 3, 5" />
              <button onClick={computeStatistics} className="btn-compute">COMPUTE STATISTICS</button>
            </div>
            <div className="input-group">
              <label>Combinations / Permutations:</label>
              <input type="number" value={nValue} onChange={(e) => setNValue(e.target.value)} placeholder="n" />
              <input type="number" value={rValue} onChange={(e) => setRValue(e.target.value)} placeholder="r" />
              <button onClick={computeCombinatorics} className="btn-compute">CALCULATE nCr & nPr</button>
            </div>
          </div>
          <div className="result-box">
            {statsResult && <pre>{statsResult}</pre>}
            {nCrResult && <pre>{nCrResult}</pre>}
            {nPrResult && <pre>{nPrResult}</pre>}
          </div>
        </div>
      )}

      {activeTab === 'geometry' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Right Triangle Solver:</label>
              <input type="number" value={sideA} onChange={(e) => setSideA(e.target.value)} placeholder="Side a" />
              <input type="number" value={sideB} onChange={(e) => setSideB(e.target.value)} placeholder="Side b" />
              <input type="number" value={hypotenuse} onChange={(e) => setHypotenuse(e.target.value)} placeholder="Hypotenuse" />
              <button onClick={solveRightTriangle} className="btn-compute">SOLVE TRIANGLE</button>
            </div>
            <div className="input-group">
              <label>Trigonometric Suite:</label>
              <input type="number" value={angleValue} onChange={(e) => setAngleValue(e.target.value)} placeholder="Angle (degrees)" />
              <button onClick={computeTrig} className="btn-compute">CALCULATE TRIG</button>
            </div>
            <div className="input-group">
              <label>Shape Area / Volume:</label>
              <select value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle</option>
                <option value="triangle">Triangle</option>
                <option value="sphere">Sphere</option>
                <option value="cylinder">Cylinder</option>
                <option value="cube">Cube</option>
                <option value="rectangular-prism">Rectangular Prism</option>
              </select>
              <input type="number" value={dimR} onChange={(e) => setDimR(e.target.value)} placeholder="r / length" />
              <input type="number" value={dimW} onChange={(e) => setDimW(e.target.value)} placeholder="width / base" />
              <input type="number" value={dimH} onChange={(e) => setDimH(e.target.value)} placeholder="height" />
              <button onClick={computeShape} className="btn-compute">COMPUTE SHAPE</button>
            </div>
          </div>
          <div className="result-box">
            {triangleResult && <pre>{triangleResult}</pre>}
            {trigResult && <pre>{trigResult}</pre>}
            {shapeResult && <pre>{shapeResult}</pre>}
          </div>
        </div>
      )}

      {activeTab === 'complex' && (
        <div className="tab-content">
          <div className="section-grid">
            <div className="input-group">
              <label>Complex Number A:</label>
              <input type="text" value={complexA} onChange={(e) => setComplexA(e.target.value)} placeholder="e.g., 2 + 3i" />
            </div>
            <div className="input-group">
              <label>Complex Number B:</label>
              <input type="text" value={complexB} onChange={(e) => setComplexB(e.target.value)} placeholder="e.g., 1 - 4i" />
            </div>
            <div className="input-group">
              <label>Operation:</label>
              <select value={complexOp} onChange={(e) => setComplexOp(e.target.value)}>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
                <option value="multiply">Multiply</option>
                <option value="divide">Divide</option>
              </select>
              <button onClick={computeComplex} className="btn-compute">COMPUTE COMPLEX</button>
            </div>
          </div>
          {complexResult && <div className="result-box"><pre>{complexResult}</pre></div>}
        </div>
      )}
    </div>
  );
}
