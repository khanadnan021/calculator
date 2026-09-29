/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FormulaUnitOption {
  symbol: string;
  name: string;
  factorToBase: number;
}

export interface FormulaParam {
  id: string;
  name: string;
  symbol: string;
  defaultValue: number;
  defaultUnit: string;
  units: FormulaUnitOption[];
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FormulaResultUnit {
  symbol: string;
  factorFromBase: number; // multiply SI base result by this to get this unit value
}

export interface DomainFormula {
  id: string;
  domain: 'mechanical' | 'electrical' | 'civil' | 'chemical' | 'aerospace' | 'digital';
  title: string;
  tagline: string;
  equationLatex: string;
  diagram: 'beam_deflection' | 'reynolds' | 'heat_transfer' | 'resonance' | 'voltage_divider' | 'buckling' | 'ideal_gas' | 'rocket' | 'bandwidth';
  params: FormulaParam[];
  outputName: string;
  outputSymbol: string;
  baseUnit: string;
  resultUnits: FormulaResultUnit[];
  calculate: (valuesInBase: Record<string, number>) => {
    resultInBase: number;
    steps: { stepLabel: string; expression: string; value: string }[];
    regimeOrNotice?: string;
  };
}

export const DOMAIN_FORMULAS: DomainFormula[] = [
  // 1. Mechanical: Simply Supported Beam Max Deflection
  {
    id: 'beam_deflection_center',
    domain: 'mechanical',
    title: 'Simply Supported Beam Max Deflection',
    tagline: 'Center concentrated point load on prismatic elastic beam',
    equationLatex: 'δ_max = (P · L³) / (48 · E · I)',
    diagram: 'beam_deflection',
    params: [
      {
        id: 'P',
        name: 'Concentrated Load (P)',
        symbol: 'P',
        defaultValue: 10,
        defaultUnit: 'kN',
        units: [
          { symbol: 'kN', name: 'Kilonewtons', factorToBase: 1e3 },
          { symbol: 'N', name: 'Newtons', factorToBase: 1 },
          { symbol: 'lbf', name: 'Pound-force', factorToBase: 4.4482216 }
        ]
      },
      {
        id: 'L',
        name: 'Beam Span Length (L)',
        symbol: 'L',
        defaultValue: 6,
        defaultUnit: 'm',
        units: [
          { symbol: 'm', name: 'Meters', factorToBase: 1 },
          { symbol: 'mm', name: 'Millimeters', factorToBase: 0.001 },
          { symbol: 'ft', name: 'Feet', factorToBase: 0.3048 },
          { symbol: 'in', name: 'Inches', factorToBase: 0.0254 }
        ]
      },
      {
        id: 'E',
        name: 'Young\'s Modulus (E)',
        symbol: 'E',
        defaultValue: 200,
        defaultUnit: 'GPa',
        tooltip: 'Structural Steel ≈ 200 GPa, Aluminum ≈ 70 GPa, Timber ≈ 12 GPa',
        units: [
          { symbol: 'GPa', name: 'Gigapascals', factorToBase: 1e9 },
          { symbol: 'MPa', name: 'Megapascals', factorToBase: 1e6 },
          { symbol: 'psi', name: 'Pounds per sq in', factorToBase: 6894.757 }
        ]
      },
      {
        id: 'I',
        name: 'Second Moment of Area (I)',
        symbol: 'I',
        defaultValue: 8500,
        defaultUnit: 'cm⁴',
        tooltip: 'Area moment of inertia about the neutral axis of the cross-section',
        units: [
          { symbol: 'cm⁴', name: 'cm⁴', factorToBase: 1e-8 },
          { symbol: 'mm⁴', name: 'mm⁴', factorToBase: 1e-12 },
          { symbol: 'm⁴', name: 'm⁴', factorToBase: 1 },
          { symbol: 'in⁴', name: 'in⁴', factorToBase: 0.0000004162314 }
        ]
      }
    ],
    outputName: 'Maximum Centerline Deflection',
    outputSymbol: 'δ_max',
    baseUnit: 'm',
    resultUnits: [
      { symbol: 'mm', factorFromBase: 1000 },
      { symbol: 'm', factorFromBase: 1 },
      { symbol: 'in', factorFromBase: 39.3700787 }
    ],
    calculate: (v) => {
      const P = v['P']; // N
      const L = v['L']; // m
      const E = v['E']; // Pa
      const I = v['I']; // m^4
      const delta = (P * Math.pow(L, 3)) / (48 * E * I);
      const spanRatio = L / delta;
      return {
        resultInBase: delta,
        steps: [
          { stepLabel: 'Numerator (P · L³)', expression: `${P.toExponential(3)} N × (${L.toFixed(2)} m)³`, value: `${(P * Math.pow(L, 3)).toExponential(4)} N·m³` },
          { stepLabel: 'Denominator (48 · E · I)', expression: `48 × ${E.toExponential(3)} Pa × ${I.toExponential(3)} m⁴`, value: `${(48 * E * I).toExponential(4)} N·m²` },
          { stepLabel: 'Deflection δ_max', expression: 'Numerator / Denominator', value: `${(delta * 1000).toFixed(4)} mm` }
        ],
        regimeOrNotice: `Span-to-deflection ratio: L / ${Math.round(spanRatio)} (AISC guideline is typically L/360 to L/240)`
      };
    }
  },

  // 2. Fluid / Thermal: Reynolds Number
  {
    id: 'reynolds_number',
    domain: 'mechanical',
    title: 'Reynolds Number & Pipe Flow Regime',
    tagline: 'Ratio of inertial forces to viscous forces in internal fluid flow',
    equationLatex: 'Re = (ρ · v · D) / μ',
    diagram: 'reynolds',
    params: [
      {
        id: 'rho',
        name: 'Fluid Density (ρ)',
        symbol: 'ρ',
        defaultValue: 998.2,
        defaultUnit: 'kg/m³',
        tooltip: 'Water @ 20°C ≈ 998 kg/m³, Air @ 20°C ≈ 1.204 kg/m³, Hydraulic Oil ≈ 870 kg/m³',
        units: [
          { symbol: 'kg/m³', name: 'kg/m³', factorToBase: 1 },
          { symbol: 'g/cm³', name: 'g/cm³', factorToBase: 1000 },
          { symbol: 'lb/ft³', name: 'lb/ft³', factorToBase: 16.01846 }
        ]
      },
      {
        id: 'v',
        name: 'Flow Velocity (v)',
        symbol: 'v',
        defaultValue: 2.5,
        defaultUnit: 'm/s',
        units: [
          { symbol: 'm/s', name: 'Meters/second', factorToBase: 1 },
          { symbol: 'ft/s', name: 'Feet/second', factorToBase: 0.3048 },
          { symbol: 'km/h', name: 'km/h', factorToBase: 1 / 3.6 }
        ]
      },
      {
        id: 'D',
        name: 'Pipe Inner Diameter (D)',
        symbol: 'D',
        defaultValue: 50,
        defaultUnit: 'mm',
        units: [
          { symbol: 'mm', name: 'Millimeters', factorToBase: 0.001 },
          { symbol: 'm', name: 'Meters', factorToBase: 1 },
          { symbol: 'in', name: 'Inches', factorToBase: 0.0254 }
        ]
      },
      {
        id: 'mu',
        name: 'Dynamic Viscosity (μ)',
        symbol: 'μ',
        defaultValue: 1.002,
        defaultUnit: 'mPa·s',
        tooltip: 'Water @ 20°C = 1.002 mPa·s (cP), Air @ 20°C = 0.0182 mPa·s',
        units: [
          { symbol: 'mPa·s', name: 'mPa·s (cP)', factorToBase: 0.001 },
          { symbol: 'Pa·s', name: 'Pa·s', factorToBase: 1 },
          { symbol: 'lb/(ft·s)', name: 'lb/(ft·s)', factorToBase: 1.48816 }
        ]
      }
    ],
    outputName: 'Reynolds Number (Dimensionless)',
    outputSymbol: 'Re',
    baseUnit: 'dimensionless',
    resultUnits: [
      { symbol: '', factorFromBase: 1 }
    ],
    calculate: (v) => {
      const rho = v['rho'];
      const vel = v['v'];
      const D = v['D'];
      const mu = v['mu'];
      const Re = (rho * vel * D) / mu;
      let regime = '';
      if (Re < 2300) {
        regime = 'Flow Regime: LAMINAR (Re < 2,300) — Viscous damping dominates, smooth parabolic profile';
      } else if (Re <= 4000) {
        regime = 'Flow Regime: TRANSITIONAL (2,300 ≤ Re ≤ 4,000) — Unstable, intermittent eddies';
      } else {
        regime = 'Flow Regime: TURBULENT (Re > 4,000) — Inertia dominates, rapid mixing, high friction factor';
      }
      return {
        resultInBase: Re,
        steps: [
          { stepLabel: 'Inertial Term (ρ · v · D)', expression: `${rho.toFixed(1)} kg/m³ × ${vel.toFixed(2)} m/s × ${D.toFixed(4)} m`, value: `${(rho * vel * D).toFixed(4)} kg/(m·s)` },
          { stepLabel: 'Viscous Term (μ)', expression: `${mu.toExponential(4)} Pa·s`, value: `${mu.toExponential(4)} kg/(m·s)` },
          { stepLabel: 'Reynolds Number Re', expression: 'Inertial / Viscous', value: `${Re.toLocaleString('en-US', { maximumFractionDigits: 1 })}` }
        ],
        regimeOrNotice: regime
      };
    }
  },

  // 3. Electrical: Resonant Frequency & Impedance of LC / RLC Tank
  {
    id: 'rlc_resonance',
    domain: 'electrical',
    title: 'LC / RLC Tank Resonance & Reactance',
    tagline: 'Natural resonant frequency, inductive & capacitive reactances',
    equationLatex: 'f₀ = 1 / (2π · √(L · C))',
    diagram: 'resonance',
    params: [
      {
        id: 'L',
        name: 'Inductance (L)',
        symbol: 'L',
        defaultValue: 10,
        defaultUnit: 'uH',
        units: [
          { symbol: 'uH', name: 'Microhenries', factorToBase: 1e-6 },
          { symbol: 'mH', name: 'Millihenries', factorToBase: 1e-3 },
          { symbol: 'nH', name: 'Nanohenries', factorToBase: 1e-9 },
          { symbol: 'H', name: 'Henries', factorToBase: 1 }
        ]
      },
      {
        id: 'C',
        name: 'Capacitance (C)',
        symbol: 'C',
        defaultValue: 100,
        defaultUnit: 'pF',
        units: [
          { symbol: 'pF', name: 'Picofarads', factorToBase: 1e-12 },
          { symbol: 'nF', name: 'Nanofarads', factorToBase: 1e-9 },
          { symbol: 'uF', name: 'Microfarads', factorToBase: 1e-6 },
          { symbol: 'F', name: 'Farads', factorToBase: 1 }
        ]
      }
    ],
    outputName: 'Resonant Frequency',
    outputSymbol: 'f₀',
    baseUnit: 'Hz',
    resultUnits: [
      { symbol: 'MHz', factorFromBase: 1e-6 },
      { symbol: 'kHz', factorFromBase: 1e-3 },
      { symbol: 'GHz', factorFromBase: 1e-9 },
      { symbol: 'Hz', factorFromBase: 1 }
    ],
    calculate: (v) => {
      const L = v['L']; // H
      const C = v['C']; // F
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const omega0 = 2 * Math.PI * f0;
      const Z0 = Math.sqrt(L / C); // Characteristic impedance
      return {
        resultInBase: f0,
        steps: [
          { stepLabel: '√(L · C)', expression: `√(${L.toExponential(3)} H × ${C.toExponential(3)} F)`, value: `${Math.sqrt(L * C).toExponential(4)} s` },
          { stepLabel: 'Angular Frequency ω₀', expression: '1 / √(L · C)', value: `${omega0.toExponential(4)} rad/s` },
          { stepLabel: 'Characteristic Impedance Z₀', expression: '√(L / C)', value: `${Z0.toFixed(2)} Ω` }
        ],
        regimeOrNotice: `At f₀ = ${(f0 / 1e6).toFixed(3)} MHz, Inductive Reactance X_L = ${(omega0 * L).toFixed(2)} Ω balances Capacitive Reactance X_C = ${(1 / (omega0 * C)).toFixed(2)} Ω`
      };
    }
  },

  // 4. Electrical: Precision Resistive Voltage Divider
  {
    id: 'voltage_divider',
    domain: 'electrical',
    title: 'Resistive Voltage Divider & Loading',
    tagline: 'Output voltage, Thevenin equivalent impedance, and power dissipation',
    equationLatex: 'V_out = V_in · [ R₂ / (R₁ + R₂) ]',
    diagram: 'voltage_divider',
    params: [
      {
        id: 'Vin',
        name: 'Input Voltage (V_in)',
        symbol: 'V_in',
        defaultValue: 12,
        defaultUnit: 'V',
        units: [
          { symbol: 'V', name: 'Volts', factorToBase: 1 },
          { symbol: 'mV', name: 'Millivolts', factorToBase: 1e-3 },
          { symbol: 'kV', name: 'Kilovolts', factorToBase: 1e3 }
        ]
      },
      {
        id: 'R1',
        name: 'Upper Resistor (R₁)',
        symbol: 'R₁',
        defaultValue: 10,
        defaultUnit: 'kΩ',
        units: [
          { symbol: 'kΩ', name: 'Kiloohms', factorToBase: 1e3 },
          { symbol: 'Ω', name: 'Ohms', factorToBase: 1 },
          { symbol: 'MΩ', name: 'Megaohms', factorToBase: 1e6 }
        ]
      },
      {
        id: 'R2',
        name: 'Lower Resistor (R₂)',
        symbol: 'R₂',
        defaultValue: 4.7,
        defaultUnit: 'kΩ',
        units: [
          { symbol: 'kΩ', name: 'Kiloohms', factorToBase: 1e3 },
          { symbol: 'Ω', name: 'Ohms', factorToBase: 1 },
          { symbol: 'MΩ', name: 'Megaohms', factorToBase: 1e6 }
        ]
      }
    ],
    outputName: 'Output Voltage (V_out)',
    outputSymbol: 'V_out',
    baseUnit: 'V',
    resultUnits: [
      { symbol: 'V', factorFromBase: 1 },
      { symbol: 'mV', factorFromBase: 1000 }
    ],
    calculate: (v) => {
      const Vin = v['Vin'];
      const R1 = v['R1'];
      const R2 = v['R2'];
      const Vout = Vin * (R2 / (R1 + R2));
      const I_quiescent = Vin / (R1 + R2);
      const P_total = Vin * I_quiescent;
      const R_thevenin = (R1 * R2) / (R1 + R2);
      return {
        resultInBase: Vout,
        steps: [
          { stepLabel: 'Division Ratio R₂ / (R₁ + R₂)', expression: `${(R2 / 1000).toFixed(2)}k / (${(R1 / 1000).toFixed(2)}k + ${(R2 / 1000).toFixed(2)}k)`, value: `${(R2 / (R1 + R2)).toFixed(5)}` },
          { stepLabel: 'Quiescent Current I_q', expression: 'V_in / (R₁ + R₂)', value: `${(I_quiescent * 1000).toFixed(3)} mA` },
          { stepLabel: 'Thevenin Output Impedance R_th', expression: '(R₁ · R₂) / (R₁ + R₂)', value: `${(R_thevenin / 1000).toFixed(3)} kΩ` }
        ],
        regimeOrNotice: `Total static power dissipation: ${(P_total * 1000).toFixed(2)} mW (P_R1: ${(Math.pow(Vin - Vout, 2) / R1 * 1000).toFixed(2)} mW, P_R2: ${(Math.pow(Vout, 2) / R2 * 1000).toFixed(2)} mW)`
      };
    }
  },

  // 5. Civil / Structural: Euler Critical Column Buckling Load
  {
    id: 'euler_buckling',
    domain: 'civil',
    title: 'Euler Column Buckling Critical Load',
    tagline: 'Theoretical maximum axial compressive load before elastic instability',
    equationLatex: 'P_cr = (π² · E · I) / (K · L)²',
    diagram: 'buckling',
    params: [
      {
        id: 'E',
        name: 'Elastic Modulus (E)',
        symbol: 'E',
        defaultValue: 200,
        defaultUnit: 'GPa',
        units: [
          { symbol: 'GPa', name: 'Gigapascals', factorToBase: 1e9 },
          { symbol: 'MPa', name: 'Megapascals', factorToBase: 1e6 },
          { symbol: 'ksi', name: 'ksi', factorToBase: 6894757.29 }
        ]
      },
      {
        id: 'I',
        name: 'Min Moment of Inertia (I_min)',
        symbol: 'I',
        defaultValue: 450,
        defaultUnit: 'cm⁴',
        units: [
          { symbol: 'cm⁴', name: 'cm⁴', factorToBase: 1e-8 },
          { symbol: 'mm⁴', name: 'mm⁴', factorToBase: 1e-12 },
          { symbol: 'in⁴', name: 'in⁴', factorToBase: 0.0000004162314 }
        ]
      },
      {
        id: 'L',
        name: 'Column Length (L)',
        symbol: 'L',
        defaultValue: 4,
        defaultUnit: 'm',
        units: [
          { symbol: 'm', name: 'Meters', factorToBase: 1 },
          { symbol: 'ft', name: 'Feet', factorToBase: 0.3048 }
        ]
      },
      {
        id: 'K',
        name: 'Effective Length Factor (K)',
        symbol: 'K',
        defaultValue: 1.0,
        defaultUnit: 'factor',
        tooltip: 'Pinned-Pinned: K=1.0 | Fixed-Free: K=2.0 | Fixed-Pinned: K=0.7 | Fixed-Fixed: K=0.5',
        units: [
          { symbol: 'factor', name: 'Dimensionless Factor', factorToBase: 1 }
        ]
      }
    ],
    outputName: 'Critical Buckling Load (P_cr)',
    outputSymbol: 'P_cr',
    baseUnit: 'N',
    resultUnits: [
      { symbol: 'kN', factorFromBase: 1e-3 },
      { symbol: 'N', factorFromBase: 1 },
      { symbol: 'kip', factorFromBase: 1 / 4448.2216 }
    ],
    calculate: (v) => {
      const E = v['E'];
      const I = v['I'];
      const L = v['L'];
      const K = v['K'];
      const Leff = K * L;
      const Pcr = (Math.PI * Math.PI * E * I) / (Leff * Leff);
      return {
        resultInBase: Pcr,
        steps: [
          { stepLabel: 'Effective Column Length (K · L)', expression: `${K.toFixed(2)} × ${L.toFixed(2)} m`, value: `${Leff.toFixed(3)} m` },
          { stepLabel: 'Flexural Rigidity (π² · E · I)', expression: `π² × ${E.toExponential(3)} Pa × ${I.toExponential(3)} m⁴`, value: `${(Math.PI * Math.PI * E * I).toExponential(4)} N·m²` },
          { stepLabel: 'P_cr = Rigidity / (K·L)²', expression: `Rigidity / (${Leff.toFixed(3)})²`, value: `${(Pcr / 1000).toFixed(2)} kN` }
        ],
        regimeOrNotice: `Euler theory assumes slender elastic column with linear elastic behavior and no initial imperfection.`
      };
    }
  },

  // 6. Chemical: Ideal Gas Equation (Solve for Pressure P)
  {
    id: 'ideal_gas_law',
    domain: 'chemical',
    title: 'Ideal Gas Law (Equation of State)',
    tagline: 'Pressure, volume, molar amount, and thermodynamic temperature',
    equationLatex: 'P = (n · R · T) / V',
    diagram: 'ideal_gas',
    params: [
      {
        id: 'n',
        name: 'Amount of Substance (n)',
        symbol: 'n',
        defaultValue: 25,
        defaultUnit: 'mol',
        units: [
          { symbol: 'mol', name: 'Moles', factorToBase: 1 },
          { symbol: 'kmol', name: 'Kilomoles', factorToBase: 1000 }
        ]
      },
      {
        id: 'T',
        name: 'Absolute Temperature (T)',
        symbol: 'T',
        defaultValue: 298.15,
        defaultUnit: 'K',
        tooltip: 'Room temperature 25°C = 298.15 K',
        units: [
          { symbol: 'K', name: 'Kelvin', factorToBase: 1 }
        ]
      },
      {
        id: 'V',
        name: 'Gas Volume (V)',
        symbol: 'V',
        defaultValue: 0.1,
        defaultUnit: 'm³',
        units: [
          { symbol: 'm³', name: 'Cubic Meters', factorToBase: 1 },
          { symbol: 'L', name: 'Liters', factorToBase: 0.001 },
          { symbol: 'ft³', name: 'Cubic Feet', factorToBase: 0.0283168 }
        ]
      }
    ],
    outputName: 'Equilibrium Gas Pressure',
    outputSymbol: 'P',
    baseUnit: 'Pa',
    resultUnits: [
      { symbol: 'bar', factorFromBase: 1e-5 },
      { symbol: 'kPa', factorFromBase: 1e-3 },
      { symbol: 'MPa', factorFromBase: 1e-6 },
      { symbol: 'psi', factorFromBase: 1 / 6894.757 },
      { symbol: 'atm', factorFromBase: 1 / 101325 }
    ],
    calculate: (v) => {
      const R = 8.314462618; // J / (mol*K)
      const n = v['n'];
      const T = v['T'];
      const V = v['V'];
      const P = (n * R * T) / V;
      return {
        resultInBase: P,
        steps: [
          { stepLabel: 'Gas Constant R', expression: 'Universal CODATA', value: '8.3145 J/(mol·K)' },
          { stepLabel: 'Thermal Energy (n · R · T)', expression: `${n.toFixed(2)} mol × 8.3145 × ${T.toFixed(2)} K`, value: `${(n * R * T).toFixed(1)} J` },
          { stepLabel: 'Pressure P = (n·R·T) / V', expression: `${(n * R * T).toFixed(1)} J / ${V.toFixed(4)} m³`, value: `${(P / 1e5).toFixed(3)} bar` }
        ],
        regimeOrNotice: `Valid for moderate temperatures and low-to-medium pressures where intermolecular forces are negligible.`
      };
    }
  },

  // 7. Aerospace: Tsiolkovsky Rocket Equation
  {
    id: 'rocket_equation',
    domain: 'aerospace',
    title: 'Tsiolkovsky Rocket Delta-V Equation',
    tagline: 'Velocity increment achieved by expelling propellant through reaction mass',
    equationLatex: 'Δv = I_sp · g₀ · ln(m₀ / m_f)',
    diagram: 'rocket',
    params: [
      {
        id: 'Isp',
        name: 'Specific Impulse (I_sp)',
        symbol: 'I_sp',
        defaultValue: 320,
        defaultUnit: 's',
        tooltip: 'Solid: ~250s | Hydrolox: ~450s | Methalox: ~380s | Ion thruster: ~3000s',
        units: [
          { symbol: 's', name: 'Seconds', factorToBase: 1 }
        ]
      },
      {
        id: 'm0',
        name: 'Initial Wet Mass (m₀)',
        symbol: 'm₀',
        defaultValue: 50000,
        defaultUnit: 'kg',
        units: [
          { symbol: 'kg', name: 'Kilograms', factorToBase: 1 },
          { symbol: 'tonne', name: 'Metric Tonnes', factorToBase: 1000 },
          { symbol: 'lb', name: 'Pounds', factorToBase: 0.453592 }
        ]
      },
      {
        id: 'mf',
        name: 'Final Dry Mass (m_f)',
        symbol: 'm_f',
        defaultValue: 5000,
        defaultUnit: 'kg',
        units: [
          { symbol: 'kg', name: 'Kilograms', factorToBase: 1 },
          { symbol: 'tonne', name: 'Metric Tonnes', factorToBase: 1000 },
          { symbol: 'lb', name: 'Pounds', factorToBase: 0.453592 }
        ]
      }
    ],
    outputName: 'Total Velocity Increment (Delta-v)',
    outputSymbol: 'Δv',
    baseUnit: 'm/s',
    resultUnits: [
      { symbol: 'km/s', factorFromBase: 0.001 },
      { symbol: 'm/s', factorFromBase: 1 },
      { symbol: 'mph', factorFromBase: 2.23694 }
    ],
    calculate: (v) => {
      const g0 = 9.80665;
      const Isp = v['Isp'];
      const m0 = v['m0'];
      const mf = v['mf'];
      const massRatio = m0 / mf;
      const effectiveExhaustVelocity = Isp * g0;
      const deltaV = effectiveExhaustVelocity * Math.log(massRatio);
      return {
        resultInBase: deltaV,
        steps: [
          { stepLabel: 'Effective Exhaust Velocity (v_e)', expression: `${Isp.toFixed(1)} s × 9.80665 m/s²`, value: `${effectiveExhaustVelocity.toFixed(1)} m/s` },
          { stepLabel: 'Mass Ratio (m₀ / m_f)', expression: `${m0.toLocaleString()} kg / ${mf.toLocaleString()} kg`, value: `${massRatio.toFixed(3)}` },
          { stepLabel: 'Natural Logarithm ln(m₀ / m_f)', expression: `ln(${massRatio.toFixed(3)})`, value: `${Math.log(massRatio).toFixed(4)}` },
          { stepLabel: 'Delta-v = v_e · ln(m₀ / m_f)', expression: `${effectiveExhaustVelocity.toFixed(1)} × ${Math.log(massRatio).toFixed(4)}`, value: `${(deltaV / 1000).toFixed(3)} km/s` }
        ],
        regimeOrNotice: `Propellant Mass Fraction: ${(((m0 - mf) / m0) * 100).toFixed(1)}%. Low Earth Orbit (LEO) orbital insertion typically requires ~9.4 km/s Δv including gravity/atmospheric losses.`
      };
    }
  },

  // 8. Digital / Systems: Data Transfer Time
  {
    id: 'bandwidth_transfer_time',
    domain: 'digital',
    title: 'Data Transfer Time & Network Throughput',
    tagline: 'Duration required to transmit a payload over fixed channel bandwidth',
    equationLatex: 't = Data Size / Throughput Rate',
    diagram: 'bandwidth',
    params: [
      {
        id: 'dataSize',
        name: 'Total Data Payload',
        symbol: 'S',
        defaultValue: 50,
        defaultUnit: 'GB',
        units: [
          { symbol: 'GB', name: 'Gigabytes (10⁹ B)', factorToBase: 8e9 }, // in bits
          { symbol: 'TB', name: 'Terabytes (10¹² B)', factorToBase: 8e12 },
          { symbol: 'MB', name: 'Megabytes (10⁶ B)', factorToBase: 8e6 },
          { symbol: 'GiB', name: 'Gibibytes (2³⁰ B)', factorToBase: 8 * 1073741824 }
        ]
      },
      {
        id: 'bandwidth',
        name: 'Effective Bandwidth Rate',
        symbol: 'R',
        defaultValue: 250,
        defaultUnit: 'Mbps',
        units: [
          { symbol: 'Mbps', name: 'Megabits/sec', factorToBase: 1e6 },
          { symbol: 'Gbps', name: 'Gigabits/sec', factorToBase: 1e9 },
          { symbol: 'kbps', name: 'Kilobits/sec', factorToBase: 1e3 },
          { symbol: 'MB/s', name: 'Megabytes/sec', factorToBase: 8e6 }
        ]
      },
      {
        id: 'overhead',
        name: 'Protocol Overhead / Efficiency',
        symbol: 'η',
        defaultValue: 92,
        defaultUnit: '%',
        tooltip: 'TCP/IP headers, packet retransmissions, handshakes (typically 90-95%)',
        units: [
          { symbol: '%', name: 'Efficiency (%)', factorToBase: 0.01 }
        ]
      }
    ],
    outputName: 'Total Transfer Duration',
    outputSymbol: 't',
    baseUnit: 's',
    resultUnits: [
      { symbol: 's', factorFromBase: 1 },
      { symbol: 'min', factorFromBase: 1 / 60 },
      { symbol: 'hr', factorFromBase: 1 / 3600 }
    ],
    calculate: (v) => {
      const bits = v['dataSize']; // bits
      const rateBps = v['bandwidth']; // bps
      const eff = v['overhead']; // decimal factor e.g. 0.92
      const effectiveRate = rateBps * eff;
      const durationSeconds = bits / effectiveRate;
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = Math.floor(durationSeconds % 60);
      return {
        resultInBase: durationSeconds,
        steps: [
          { stepLabel: 'Payload in Bits', expression: `${(bits / 8e9).toFixed(2)} GB × 8`, value: `${(bits / 1e9).toFixed(2)} Gbit` },
          { stepLabel: 'Effective Net Rate', expression: `${(rateBps / 1e6).toFixed(1)} Mbps × ${(eff * 100).toFixed(0)}%`, value: `${(effectiveRate / 1e6).toFixed(2)} Mbps` },
          { stepLabel: 'Transfer Time t', expression: 'Bits / Net Rate', value: `${durationSeconds.toFixed(1)} seconds` }
        ],
        regimeOrNotice: `Formatted Transfer Window: ${hours}h ${minutes}m ${seconds}s (assuming steady-state network conditions)`
      };
    }
  }
];
