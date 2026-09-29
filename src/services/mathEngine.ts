/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create, all } from 'mathjs';

const math = create(all, {
  number: 'number',
  precision: 64
});

export interface CalcResult {
  success: boolean;
  valueString: string;
  unitString?: string;
  numericValue?: number;
  formattedStandard: string;
  formattedScientific: string;
  formattedEngineering: string;
  formattedHex?: string;
  formattedBin?: string;
  error?: string;
}

/**
 * Format a number into Engineering notation where the exponent is a multiple of 3
 */
export function toEngineeringNotation(val: number, sigFigs = 6): string {
  if (isNaN(val) || !isFinite(val) || val === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(val)));
  const engExp = Math.floor(exp / 3) * 3;
  const mantissa = val / Math.pow(10, engExp);
  const roundedMantissa = Number(mantissa.toPrecision(sigFigs));
  if (engExp === 0) return `${roundedMantissa}`;
  return `${roundedMantissa} × 10^${engExp}`;
}

/**
 * Evaluate an engineering math expression, with full support for dimensional units.
 */
export function evaluateEngineeringMath(
  inputExpression: string,
  angleMode: 'deg' | 'rad' = 'rad',
  precision = 6
): CalcResult {
  if (!inputExpression || !inputExpression.trim()) {
    return {
      success: false,
      valueString: '',
      formattedStandard: '',
      formattedScientific: '',
      formattedEngineering: '',
      error: 'Expression is empty'
    };
  }

  let expr = inputExpression.trim();

  // Normalize common engineering symbols
  expr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/·/g, '*')
    .replace(/Ω/g, 'ohm')
    .replace(/μ/g, 'u')
    .replace(/µ/g, 'u');

  // Handle angle mode for trigonometric functions if in degrees and no explicit unit
  // In mathjs, sin(90 deg) works natively. If angleMode === 'deg', we can provide degree config or functions
  try {
    // If angleMode is deg, create custom scope with deg-adjusted trig if invoked like sin(90)
    let parsedResult: any;

    if (angleMode === 'deg') {
      // Evaluate with degree scope for basic trig
      const degScope = {
        sin: (x: any) => (typeof x === 'number' ? Math.sin((x * Math.PI) / 180) : math.sin(x)),
        cos: (x: any) => (typeof x === 'number' ? Math.cos((x * Math.PI) / 180) : math.cos(x)),
        tan: (x: any) => (typeof x === 'number' ? Math.tan((x * Math.PI) / 180) : math.tan(x)),
        asin: (x: any) => (typeof x === 'number' ? (Math.asin(x) * 180) / Math.PI : math.asin(x)),
        acos: (x: any) => (typeof x === 'number' ? (Math.acos(x) * 180) / Math.PI : math.acos(x)),
        atan: (x: any) => (typeof x === 'number' ? (Math.atan(x) * 180) / Math.PI : math.atan(x))
      };
      parsedResult = math.evaluate(expr, degScope);
    } else {
      parsedResult = math.evaluate(expr);
    }

    if (parsedResult === undefined || parsedResult === null) {
      return {
        success: false,
        valueString: '',
        formattedStandard: '',
        formattedScientific: '',
        formattedEngineering: '',
        error: 'Evaluation produced no value'
      };
    }

    // Check if result is a Unit
    if (parsedResult && typeof parsedResult === 'object' && 'units' in parsedResult && 'value' in parsedResult) {
      const unitObj = parsedResult;
      const unitStr = unitObj.formatUnits();
      const numVal = typeof unitObj.value === 'number' ? unitObj.value : Number(unitObj.value);
      
      const stdVal = Number.isInteger(numVal)
        ? numVal.toString()
        : Number(numVal.toPrecision(precision)).toString();

      return {
        success: true,
        valueString: `${stdVal} ${unitStr}`,
        unitString: unitStr,
        numericValue: numVal,
        formattedStandard: `${stdVal} ${unitStr}`,
        formattedScientific: `${numVal.toExponential(precision - 1)} ${unitStr}`,
        formattedEngineering: `${toEngineeringNotation(numVal, precision)} ${unitStr}`
      };
    }

    // Check if result is Complex number
    if (parsedResult && typeof parsedResult === 'object' && ('re' in parsedResult || 'im' in parsedResult)) {
      const re = parsedResult.re;
      const im = parsedResult.im;
      const sign = im >= 0 ? '+' : '-';
      const str = `${re.toPrecision(precision)} ${sign} ${Math.abs(im).toPrecision(precision)}i`;
      const magnitude = Math.sqrt(re * re + im * im);
      const phaseDeg = (Math.atan2(im, re) * 180) / Math.PI;

      return {
        success: true,
        valueString: str,
        formattedStandard: `${str} (Mag: ${magnitude.toPrecision(precision)}, θ: ${phaseDeg.toFixed(2)}°)`,
        formattedScientific: str,
        formattedEngineering: str
      };
    }

    // Check if result is Matrix or Array
    if (Array.isArray(parsedResult) || (parsedResult && typeof parsedResult.toArray === 'function')) {
      const arr = Array.isArray(parsedResult) ? parsedResult : parsedResult.toArray();
      const str = JSON.stringify(arr).replace(/,/g, ', ');
      return {
        success: true,
        valueString: str,
        formattedStandard: str,
        formattedScientific: str,
        formattedEngineering: str
      };
    }

    // Scalar numeric value
    const numeric = Number(parsedResult);
    if (!isNaN(numeric)) {
      const std = Number.isInteger(numeric)
        ? numeric.toLocaleString('en-US', { useGrouping: true })
        : Number(numeric.toPrecision(precision)).toString();

      const sci = numeric.toExponential(precision - 1);
      const eng = toEngineeringNotation(numeric, precision);

      let hex: string | undefined;
      let bin: string | undefined;
      if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 0xffffffffffff) {
        hex = '0x' + numeric.toString(16).toUpperCase();
        bin = '0b' + numeric.toString(2);
      }

      return {
        success: true,
        valueString: std,
        numericValue: numeric,
        formattedStandard: std,
        formattedScientific: sci,
        formattedEngineering: eng,
        formattedHex: hex,
        formattedBin: bin
      };
    }

    // String or other object
    return {
      success: true,
      valueString: String(parsedResult),
      formattedStandard: String(parsedResult),
      formattedScientific: String(parsedResult),
      formattedEngineering: String(parsedResult)
    };
  } catch (err: any) {
    let msg = err.message || 'Calculation error';
    if (msg.includes('Units do not match')) {
      msg = 'Dimensional Inconsistency: ' + msg;
    }
    return {
      success: false,
      valueString: '',
      formattedStandard: '',
      formattedScientific: '',
      formattedEngineering: '',
      error: msg
    };
  }
}
