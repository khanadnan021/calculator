/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhysicalConstant {
  id: string;
  name: string;
  symbol: string;
  value: number;
  valueString: string;
  unit: string;
  mathjsExpression: string;
  category: 'universal' | 'electromagnetic' | 'atomic' | 'physicochemical' | 'mechanical_planetary';
  description: string;
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  {
    id: 'c',
    name: 'Speed of Light in Vacuum',
    symbol: 'c',
    value: 299792458,
    valueString: '299,792,458',
    unit: 'm / s',
    mathjsExpression: '299792458 m/s',
    category: 'universal',
    description: 'Exact fundamental constant of spacetime and electromagnetic wave propagation.'
  },
  {
    id: 'G',
    name: 'Newtonian Constant of Gravitation',
    symbol: 'G',
    value: 6.67430e-11,
    valueString: '6.67430 × 10⁻¹¹',
    unit: 'm³ / (kg·s²)',
    mathjsExpression: '6.67430e-11 m^3/(kg*s^2)',
    category: 'universal',
    description: 'Universal gravitational coupling constant (CODATA 2022).'
  },
  {
    id: 'g0',
    name: 'Standard Acceleration of Gravity',
    symbol: 'g₀',
    value: 9.80665,
    valueString: '9.80665',
    unit: 'm / s²',
    mathjsExpression: '9.80665 m/s^2',
    category: 'mechanical_planetary',
    description: 'Standard nominal acceleration of gravity at Earth sea level (standard g-force).'
  },
  {
    id: 'h',
    name: 'Planck Constant',
    symbol: 'h',
    value: 6.62607015e-34,
    valueString: '6.62607015 × 10⁻³⁴',
    unit: 'J·s',
    mathjsExpression: '6.62607015e-34 J*s',
    category: 'universal',
    description: 'Exact fundamental quantum of electromagnetic action defining the kilogram.'
  },
  {
    id: 'hbar',
    name: 'Reduced Planck Constant (Dirac)',
    symbol: 'ℏ',
    value: 1.054571817e-34,
    valueString: '1.054571817 × 10⁻³⁴',
    unit: 'J·s',
    mathjsExpression: '1.054571817e-34 J*s',
    category: 'universal',
    description: 'h / (2π), quantum of angular momentum.'
  },
  {
    id: 'e',
    name: 'Elementary Charge',
    symbol: 'e',
    value: 1.602176634e-19,
    valueString: '1.602176634 × 10⁻¹⁹',
    unit: 'C',
    mathjsExpression: '1.602176634e-19 C',
    category: 'electromagnetic',
    description: 'Exact magnitude of electric charge carried by single proton/electron.'
  },
  {
    id: 'me',
    name: 'Electron Rest Mass',
    symbol: 'mₑ',
    value: 9.1093837015e-31,
    valueString: '9.1093837 × 10⁻³¹',
    unit: 'kg',
    mathjsExpression: '9.1093837015e-31 kg',
    category: 'atomic',
    description: 'Rest mass of an electron (510.9989 keV/c²).'
  },
  {
    id: 'mp',
    name: 'Proton Rest Mass',
    symbol: 'mₚ',
    value: 1.67262192369e-27,
    valueString: '1.6726219 × 10⁻²⁷',
    unit: 'kg',
    mathjsExpression: '1.67262192369e-27 kg',
    category: 'atomic',
    description: 'Rest mass of a proton (938.272 MeV/c²).'
  },
  {
    id: 'NA',
    name: 'Avogadro Constant',
    symbol: 'Nₐ',
    value: 6.02214076e23,
    valueString: '6.02214076 × 10²³',
    unit: 'mol⁻¹',
    mathjsExpression: '6.02214076e23 / mol',
    category: 'physicochemical',
    description: 'Exact number of constituent particles per mole of substance.'
  },
  {
    id: 'R',
    name: 'Molar Gas Constant',
    symbol: 'R',
    value: 8.314462618,
    valueString: '8.314462618',
    unit: 'J / (mol·K)',
    mathjsExpression: '8.314462618 J/(mol*K)',
    category: 'physicochemical',
    description: 'Universal constant in the ideal gas equation PV = nRT.'
  },
  {
    id: 'kB',
    name: 'Boltzmann Constant',
    symbol: 'k_B',
    value: 1.380649e-23,
    valueString: '1.380649 × 10⁻²³',
    unit: 'J / K',
    mathjsExpression: '1.380649e-23 J/K',
    category: 'physicochemical',
    description: 'Exact ratio relating average relative kinetic energy to temperature.'
  },
  {
    id: 'eps0',
    name: 'Vacuum Permittivity (Electric Constant)',
    symbol: 'ε₀',
    value: 8.8541878128e-12,
    valueString: '8.8541878 × 10⁻¹²',
    unit: 'F / m',
    mathjsExpression: '8.8541878128e-12 F/m',
    category: 'electromagnetic',
    description: 'Permittivity of free space, capacity of vacuum to permit electric field.'
  },
  {
    id: 'mu0',
    name: 'Vacuum Permeability (Magnetic Constant)',
    symbol: 'μ₀',
    value: 1.25663706212e-6,
    valueString: '1.2566371 × 10⁻⁶',
    unit: 'N / A² (H / m)',
    mathjsExpression: '1.25663706212e-6 H/m',
    category: 'electromagnetic',
    description: 'Magnetic permeability of vacuum in classical electromagnetism.'
  },
  {
    id: 'Z0',
    name: 'Characteristic Impedance of Vacuum',
    symbol: 'Z₀',
    value: 376.730313668,
    valueString: '376.73031',
    unit: 'Ω',
    mathjsExpression: '376.730313668 ohm',
    category: 'electromagnetic',
    description: 'Intrinsic impedance of free space for transverse electromagnetic waves.'
  },
  {
    id: 'sigma_sb',
    name: 'Stefan-Boltzmann Constant',
    symbol: 'σ',
    value: 5.670374419e-8,
    valueString: '5.6703744 × 10⁻⁸',
    unit: 'W / (m²·K⁴)',
    mathjsExpression: '5.670374419e-8 W/(m^2*K^4)',
    category: 'physicochemical',
    description: 'Blackbody thermal radiative flux emissive power proportionality.'
  },
  {
    id: 'F_faraday',
    name: 'Faraday Constant',
    symbol: 'F',
    value: 96485.33212,
    valueString: '96,485.332',
    unit: 'C / mol',
    mathjsExpression: '96485.33212 C/mol',
    category: 'physicochemical',
    description: 'Electric charge per mole of electrons (N_A * e).'
  },
  {
    id: 'Patm',
    name: 'Standard Atmospheric Pressure',
    symbol: 'P_atm',
    value: 101325,
    valueString: '101,325',
    unit: 'Pa',
    mathjsExpression: '101325 Pa',
    category: 'mechanical_planetary',
    description: 'Nominal 1 atmosphere standard pressure at sea level (1.01325 bar).'
  },
  {
    id: 'c_sound_air',
    name: 'Speed of Sound in Dry Air (20°C)',
    symbol: 'v_sound',
    value: 343.2,
    valueString: '343.2',
    unit: 'm / s',
    mathjsExpression: '343.2 m/s',
    category: 'mechanical_planetary',
    description: 'Acoustic wave speed in air at standard room temperature 20°C and 1 atm.'
  },
  {
    id: 'rho_water_4c',
    name: 'Standard Water Density at 4°C',
    symbol: 'ρ_w',
    value: 999.972,
    valueString: '999.972',
    unit: 'kg / m³',
    mathjsExpression: '999.972 kg/m^3',
    category: 'mechanical_planetary',
    description: 'Maximum density of pure liquid water at peak density temperature (3.98°C).'
  }
];
