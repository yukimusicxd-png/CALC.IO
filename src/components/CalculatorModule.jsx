import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import '../styles/CalculatorModule.css';

export default function CalculatorModule() {
  const [mode, setMode] = useState('scientific'); // 'scientific' or 'advanced'
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [angleMode, setAngleMode] = useState('RAD'); // 'RAD' or 'DEG'
  const [variables, setVariables] = useState({});
  
  // Advanced mode state
  const [advancedInput, setAdvancedInput] = useState('');
  const [advancedResult, setAdvancedResult] = useState('');

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if focus is inside an input/textarea except for evaluated shortcuts
      const activeEl = document.activeElement;
      const activeTag = activeEl && activeEl.tagName && activeEl.tagName.toLowerCase();
      const key = e.key.toLowerCase();
      const ctrlKey = e.ctrlKey || e.metaKey;

      // Allow Ctrl/Cmd+C copy even when typing
      if (ctrlKey && key === 'c') {
        e.preventDefault();
        handleCopyResult();
        return;
      }

      // If typing inside a text input or textarea, do not intercept most keys
      if (activeTag === 'input' || activeTag === 'textarea') {
        // Allow Ctrl+Enter to evaluate in advanced mode
        if (mode === 'advanced' && (ctrlKey && key === 'enter')) {
          e.preventDefault();
          handleAdvancedEvaluate();
        }
        return;
      }

      if (mode === 'scientific') {
        // Number keys (0-9)
        if (/^[0-9]$/.test(key)) {
          e.preventDefault();
          handleKeypadInput(key);
          return;
        }

        // Operators
        if (['+', '-', '*', '/', '%'].includes(key)) {
          e.preventDefault();
          handleKeypadInput(key);
          return;
        }

        // Special characters and controls
        switch (key) {
          case '.':
            e.preventDefault();
            handleKeypadInput('.');
            break;
          case '(':
          case ')':
            e.preventDefault();
            handleKeypadInput(key);
            break;
          case '^':
            e.preventDefault();
            handleKeypadInput('^');
            break;
          case 'enter':
            e.preventDefault();
            handleEquals();
            break;
          case 'backspace':
            e.preventDefault();
            handleDelete();
            break;
          case 'escape':
            e.preventDefault();
            handleClear();
            break;
          case 'd':
            // Toggle angle mode (RAD/DEG)
            e.preventDefault();
            toggleAngleMode();
            break;
          // Function shortcuts
          case 's':
            if (!ctrlKey) {
              e.preventDefault();
              handleFunction('sin');
            }
            break;
          case 'c':
            if (!ctrlKey) {
              e.preventDefault();
              handleFunction('cos');
            }
            break;
          case 't':
            if (!ctrlKey) {
              e.preventDefault();
              handleFunction('tan');
            }
            break;
          case 'l':
            e.preventDefault();
            handleFunction('ln');
            break;
          case 'q':
            e.preventDefault();
            handleFunction('sqrt');
            break;
          case 'p':
            if (!ctrlKey) {
              e.preventDefault();
              handleConstant('π');
            }
            break;
          case 'e':
            if (!ctrlKey) {
              e.preventDefault();
              handleConstant('e');
            }
            break;
          case 'r':
            if (!ctrlKey) {
              e.preventDefault();
              setMode('advanced');
            }
            break;
          case '!':
            e.preventDefault();
            handleFunction('!');
            break;
          default:
            break;
        }
      } else if (mode === 'advanced') {
        // Ctrl+Enter to evaluate in advanced mode
        if (ctrlKey && key === 'enter') {
          e.preventDefault();
          handleAdvancedEvaluate();
        }
        // Alt+S or Alt+s for scientific mode
        if ((e.altKey || (e.ctrlKey && !e.metaKey)) && key === 's') {
          e.preventDefault();
          setMode('scientific');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, display, advancedInput, variables, angleMode, history]);
  const handleKeypadInput = (value) => {
    if (display === '0' && value !== '.') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setAdvancedInput('');
    setAdvancedResult('');
  };

  const handleDelete = () => {
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleEquals = () => {
    try {
      let expr = display;
      
      // Convert degree to radian if needed
      if (angleMode === 'DEG') {
        expr = expr.replace(/sin\(/g, 'sin(deg2rad(')
                   .replace(/cos\(/g, 'cos(deg2rad(')
                   .replace(/tan\(/g, 'tan(deg2rad(');
        // Close parentheses
        let openCount = (expr.match(/deg2rad\(/g) || []).length;
        expr = expr + ')'.repeat(openCount);
      }
      
      const result = math.evaluate(expr);
      const formattedResult = typeof result === 'number' ? result.toFixed(10).replace(/\.?0+$/, '') : String(result);
      setDisplay(formattedResult);
      setHistory([...history, `${display} = ${formattedResult}`]);
    } catch (e) {
      setDisplay('Error');
      setHistory([...history, `Error: ${display}`]);
    }
  };

  const handleConstant = (constant) => {
    const constants = {
      'π': 'pi',
      'e': 'e',
      'c': '299792458',
      'h': '6.62607015e-34',
      'G': '6.67430e-11',
      'N_A': '6.02214076e23'
    };
    if (display === '0') {
      setDisplay(constants[constant]);
    } else {
      setDisplay(display + constants[constant]);
    }
  };

  const handleFunction = (func) => {
    const funcMap = {
      'sin': 'sin(',
      'cos': 'cos(',
      'tan': 'tan(',
      'asin': 'asin(',
      'acos': 'acos(',
      'atan': 'atan(',
      'sinh': 'sinh(',
      'cosh': 'cosh(',
      'tanh': 'tanh(',
      'log': 'log10(',
      'ln': 'log(',
      'sqrt': 'sqrt(',
      'cbrt': 'cbrt(',
      '!': '!',
      'abs': 'abs('
    };
    
    if (func === '!') {
      setDisplay(display + '!');
    } else if (display === '0') {
      setDisplay(funcMap[func]);
    } else {
      setDisplay(display + funcMap[func]);
    }
  };

  const handleAdvancedEvaluate = () => {
    try {
      if (!advancedInput.trim()) return;
      
      // Check for variable assignment
      if (advancedInput.includes('=') && !advancedInput.includes('==')) {
        const [varName, expr] = advancedInput.split('=').map(s => s.trim());
        if (/^[a-zA-Z_]\w*$/.test(varName)) {
          const result = math.evaluate(expr, variables);
          setVariables({ ...variables, [varName]: result });
          setAdvancedResult(`${varName} = ${result}`);
          setAdvancedInput('');
        }
      } else {
        // Convert degree to radian if needed
        let expr = advancedInput;
        if (angleMode === 'DEG') {
          expr = expr.replace(/sin\(/g, 'sin(deg2rad(')
                     .replace(/cos\(/g, 'cos(deg2rad(')
                     .replace(/tan\(/g, 'tan(deg2rad(');
          let openCount = (expr.match(/deg2rad\(/g) || []).length;
          expr = expr + ')'.repeat(openCount);
        }
        
        const result = math.evaluate(expr, variables);
        const formattedResult = typeof result === 'number' ? result.toFixed(10).replace(/\.?0+$/, '') : String(result);
        setAdvancedResult(`Result: ${formattedResult}`);
        setAdvancedInput('');
      }
    } catch (e) {
      setAdvancedResult(`Error: ${e.message}`);
    }
  };

  const handleCopyResult = () => {
    const textToCopy = mode === 'scientific' ? display : advancedResult;
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Visual feedback could be added here
      console.log('Copied to clipboard');
    });
  };

  const handleClearAll = () => {
    handleClear();
    setHistory([]);
    setVariables({});
    setAdvancedResult('');
  };

  const toggleAngleMode = () => {
    setAngleMode(angleMode === 'RAD' ? 'DEG' : 'RAD');
  };

  return (
    <div className="calculator-container">
      <h2>╔═══ CALCULATOR ENGINE ═══╗</h2>
      
      <div className="calc-mode-toggle">
        <button 
          className={`mode-btn ${mode === 'scientific' ? 'active' : ''}`}
          onClick={() => setMode('scientific')}
        >
          SCIENTIFIC
        </button>
        <button 
          className={`mode-btn ${mode === 'advanced' ? 'active' : ''}`}
          onClick={() => setMode('advanced')}
        >
          ADVANCED
        </button>
        <button 
          className={`angle-toggle ${angleMode}`}
          onClick={toggleAngleMode}
        >
          {angleMode}
        </button>
      </div>

      {mode === 'scientific' ? (
        <div className="scientific-mode">
          {/* LCD Display */}
          <div className="calc-display">
            <div className="display-screen">{display}</div>
            <div className="history-scroll">
              {history.slice(-3).map((h, i) => (
                <div key={i} className="history-line">{h}</div>
              ))}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="keypad-grid">
            {/* Row 1: Functions */}
            <button className="key-func" onClick={() => handleFunction('sin')}>sin</button>
            <button className="key-func" onClick={() => handleFunction('cos')}>cos</button>
            <button className="key-func" onClick={() => handleFunction('tan')}>tan</button>
            <button className="key-func" onClick={() => handleFunction('sqrt')}>√</button>

            {/* Row 2: Inverse Trig */}
            <button className="key-func" onClick={() => handleFunction('asin')}>asin</button>
            <button className="key-func" onClick={() => handleFunction('acos')}>acos</button>
            <button className="key-func" onClick={() => handleFunction('atan')}>atan</button>
            <button className="key-func" onClick={() => handleFunction('cbrt')}>∛</button>

            {/* Row 3: Hyperbolic */}
            <button className="key-func" onClick={() => handleFunction('sinh')}>sinh</button>
            <button className="key-func" onClick={() => handleFunction('cosh')}>cosh</button>
            <button className="key-func" onClick={() => handleFunction('tanh')}>tanh</button>
            <button className="key-func" onClick={() => handleFunction('!')}>n!</button>

            {/* Row 4: Logarithmic */}
            <button className="key-func" onClick={() => handleFunction('log')}>log</button>
            <button className="key-func" onClick={() => handleFunction('ln')}>ln</button>
            <button className="key-func" onClick={() => handleFunction('abs')}>abs</button>
            <button className="key-operator" onClick={() => handleKeypadInput('e')}>e</button>

            {/* Row 5: Constants */}
            <button className="key-const" onClick={() => handleConstant('π')}>π</button>
            <button className="key-const" onClick={() => handleConstant('c')}>c</button>
            <button className="key-const" onClick={() => handleConstant('h')}>h</button>
            <button className="key-const" onClick={() => handleConstant('G')}>G</button>

            {/* Row 6: Numbers and operators */}
            <button className="key-num" onClick={() => handleKeypadInput('7')}>7</button>
            <button className="key-num" onClick={() => handleKeypadInput('8')}>8</button>
            <button className="key-num" onClick={() => handleKeypadInput('9')}>9</button>
            <button className="key-operator" onClick={() => handleKeypadInput('/')}>/</button>

            {/* Row 7: Numbers and operators */}
            <button className="key-num" onClick={() => handleKeypadInput('4')}>4</button>
            <button className="key-num" onClick={() => handleKeypadInput('5')}>5</button>
            <button className="key-num" onClick={() => handleKeypadInput('6')}>6</button>
            <button className="key-operator" onClick={() => handleKeypadInput('*')}>*</button>

            {/* Row 8: Numbers and operators */}
            <button className="key-num" onClick={() => handleKeypadInput('1')}>1</button>
            <button className="key-num" onClick={() => handleKeypadInput('2')}>2</button>
            <button className="key-num" onClick={() => handleKeypadInput('3')}>3</button>
            <button className="key-operator" onClick={() => handleKeypadInput('-')}>-</button>

            {/* Row 9: Special keys */}
            <button className="key-num" onClick={() => handleKeypadInput('0')}>0</button>
            <button className="key-num" onClick={() => handleKeypadInput('.')}>.</button>
            <button className="key-operator" onClick={() => handleKeypadInput('+')}>+</button>
            <button className="key-operator" onClick={() => handleKeypadInput('^')}>^</button>

            {/* Row 10: Operations */}
            <button className="key-operator" onClick={() => handleKeypadInput('(')}>( </button>
            <button className="key-operator" onClick={() => handleKeypadInput(')')}>)</button>
            <button className="key-operator" onClick={() => handleKeypadInput('%')}>%</button>
            <button className="key-operator" onClick={() => handleDelete()}>DEL</button>

            {/* Row 11: Special */}
            <button className="key-const" onClick={() => handleConstant('N_A')}>N_A</button>
            <button className="key-const" onClick={() => handleConstant('e')}>e</button>
            <button className="key-func" onClick={handleClear}>CLR</button>
            <button className="key-equals" onClick={handleEquals}>=</button>
          </div>

          {/* Control Buttons */}
          <div className="calc-controls">
            <button className="btn-primary" onClick={handleCopyResult}>COPY RESULT</button>
            <button className="btn-secondary" onClick={handleClearAll}>CLEAR ALL</button>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="calc-shortcuts">
            <strong>⌨ KEYBOARD SHORTCUTS:</strong>
            <div className="shortcut-grid">
              <span><code>0-9</code> Numbers</span>
              <span><code>+ − * / %</code> Operators</span>
              <span><code>Enter</code> Equals</span>
              <span><code>Backspace</code> Delete</span>
              <span><code>Esc</code> Clear</span>
              <span><code>S</code> sin | <code>C</code> cos | <code>T</code> tan</span>
              <span><code>L</code> ln | <code>Q</code> √ | <code>!</code> n!</span>
              <span><code>P</code> π | <code>E</code> e | <code>R</code> Advanced</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="advanced-mode">
          <div className="advanced-display">
            <textarea
              className="advanced-input"
              value={advancedInput}
              onChange={(e) => setAdvancedInput(e.target.value)}
              placeholder="Enter expressions here. Use = for variable assignment. Variables available:"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAdvancedEvaluate();
                }
              }}
            />
            <div className="advanced-output">
              <strong>Result:</strong>
              <div className="result-box">{advancedResult}</div>
            </div>
          </div>

          <div className="variables-display">
            <strong>Variables:</strong>
            <div className="var-list">
              {Object.entries(variables).length > 0 ? (
                Object.entries(variables).map(([key, val]) => (
                  <div key={key} className="var-item">
                    <code>{key}</code> = <code>{typeof val === 'number' ? val.toFixed(6) : val}</code>
                  </div>
                ))
              ) : (
                <div className="var-item">None</div>
              )}
            </div>
          </div>

          <div className="advanced-controls">
            <button className="btn-primary" onClick={handleAdvancedEvaluate}>EVALUATE (Ctrl+Enter)</button>
            <button className="btn-primary" onClick={handleCopyResult}>COPY RESULT</button>
            <button className="btn-secondary" onClick={handleClearAll}>CLEAR ALL</button>
          </div>

          <div className="advanced-info">
            <strong>Tips & Keyboard Shortcuts:</strong>
            <ul>
              <li>Assign variables: <code>a = 5</code>, then use <code>a * 2</code></li>
              <li>Complex numbers: <code>2 + 3i</code></li>
              <li>Vectors: <code>[1, 2, 3] + [4, 5, 6]</code></li>
              <li><strong>Ctrl+Enter:</strong> Evaluate expression</li>
              <li><strong>Alt+S:</strong> Switch to Scientific mode</li>
              <li>All Math.js functions supported</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
