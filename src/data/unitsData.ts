/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factorToBase: number; // Multiply by this to get base SI unit value (for linear units)
  offset?: number; // For affine conversions like temperature (base = (val + offset) * factor or similar)
  domain: 'general' | 'mechanical' | 'electrical' | 'civil' | 'chemical' | 'aerospace' | 'digital';
  description?: string;
  mathjsSymbol?: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  domain: 'general' | 'mechanical' | 'electrical' | 'civil' | 'chemical' | 'aerospace' | 'digital';
  description: string;
  units: UnitDefinition[];
  isNonLinear?: boolean; // e.g. Temperature
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    baseUnit: 'm',
    domain: 'general',
    description: 'Linear dimensions, tolerances, span, wavelength',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', factorToBase: 1, domain: 'general', mathjsSymbol: 'm' },
      { id: 'km', name: 'Kilometer', symbol: 'km', factorToBase: 1000, domain: 'general', mathjsSymbol: 'km' },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', factorToBase: 0.01, domain: 'general', mathjsSymbol: 'cm' },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', factorToBase: 0.001, domain: 'mechanical', mathjsSymbol: 'mm' },
      { id: 'um', name: 'Micrometer (Micron)', symbol: 'µm', factorToBase: 1e-6, domain: 'mechanical', mathjsSymbol: 'um' },
      { id: 'nm', name: 'Nanometer', symbol: 'nm', factorToBase: 1e-9, domain: 'chemical', mathjsSymbol: 'nm' },
      { id: 'angstrom', name: 'Ångström', symbol: 'Å', factorToBase: 1e-10, domain: 'chemical', mathjsSymbol: 'angstrom' },
      { id: 'in', name: 'Inch', symbol: 'in', factorToBase: 0.0254, domain: 'mechanical', mathjsSymbol: 'inch' },
      { id: 'ft', name: 'Foot', symbol: 'ft', factorToBase: 0.3048, domain: 'civil', mathjsSymbol: 'foot' },
      { id: 'yd', name: 'Yard', symbol: 'yd', factorToBase: 0.9144, domain: 'civil', mathjsSymbol: 'yard' },
      { id: 'mi', name: 'Mile', symbol: 'mi', factorToBase: 1609.344, domain: 'civil', mathjsSymbol: 'mile' },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'nmi', factorToBase: 1852, domain: 'aerospace', mathjsSymbol: 'nmi' },
      { id: 'mil', name: 'Thou / Mil (0.001 in)', symbol: 'mil', factorToBase: 0.0000254, domain: 'electrical', mathjsSymbol: 'mil' },
      { id: 'ly', name: 'Light Year', symbol: 'ly', factorToBase: 9.4607304725808e15, domain: 'aerospace', mathjsSymbol: 'ly' }
    ]
  },
  {
    id: 'area',
    name: 'Area & Section',
    baseUnit: 'm²',
    domain: 'civil',
    description: 'Cross-sectional area, footprint, surface area',
    units: [
      { id: 'm2', name: 'Square Meter', symbol: 'm²', factorToBase: 1, domain: 'general', mathjsSymbol: 'm^2' },
      { id: 'km2', name: 'Square Kilometer', symbol: 'km²', factorToBase: 1e6, domain: 'civil', mathjsSymbol: 'km^2' },
      { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', factorToBase: 1e-4, domain: 'mechanical', mathjsSymbol: 'cm^2' },
      { id: 'mm2', name: 'Square Millimeter', symbol: 'mm²', factorToBase: 1e-6, domain: 'mechanical', mathjsSymbol: 'mm^2' },
      { id: 'ha', name: 'Hectare', symbol: 'ha', factorToBase: 10000, domain: 'civil', mathjsSymbol: 'hectare' },
      { id: 'acre', name: 'Acre', symbol: 'ac', factorToBase: 4046.8564224, domain: 'civil', mathjsSymbol: 'acre' },
      { id: 'ft2', name: 'Square Foot', symbol: 'ft²', factorToBase: 0.09290304, domain: 'civil', mathjsSymbol: 'sqft' },
      { id: 'in2', name: 'Square Inch', symbol: 'in²', factorToBase: 0.00064516, domain: 'mechanical', mathjsSymbol: 'sqin' },
      { id: 'yd2', name: 'Square Yard', symbol: 'yd²', factorToBase: 0.83612736, domain: 'civil', mathjsSymbol: 'sqyd' },
      { id: 'mi2', name: 'Square Mile', symbol: 'mi²', factorToBase: 2.58998811e6, domain: 'civil', mathjsSymbol: 'sqmi' }
    ]
  },
  {
    id: 'volume',
    name: 'Volume & Capacity',
    baseUnit: 'm³',
    domain: 'chemical',
    description: 'Fluid storage, displacement, pipe volumetric capacity',
    units: [
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³', factorToBase: 1, domain: 'chemical', mathjsSymbol: 'm^3' },
      { id: 'L', name: 'Liter', symbol: 'L', factorToBase: 0.001, domain: 'chemical', mathjsSymbol: 'L' },
      { id: 'mL', name: 'Milliliter (cc)', symbol: 'mL', factorToBase: 1e-6, domain: 'chemical', mathjsSymbol: 'mL' },
      { id: 'cm3', name: 'Cubic Centimeter', symbol: 'cm³', factorToBase: 1e-6, domain: 'mechanical', mathjsSymbol: 'cm^3' },
      { id: 'gal_us', name: 'Gallon (US Liquid)', symbol: 'gal (US)', factorToBase: 0.003785411784, domain: 'chemical', mathjsSymbol: 'gallon' },
      { id: 'gal_uk', name: 'Gallon (Imperial)', symbol: 'gal (Imp)', factorToBase: 0.00454609, domain: 'chemical' },
      { id: 'bbl', name: 'Petroleum Barrel', symbol: 'bbl', factorToBase: 0.158987294928, domain: 'chemical', mathjsSymbol: 'bbl' },
      { id: 'ft3', name: 'Cubic Foot', symbol: 'ft³', factorToBase: 0.028316846592, domain: 'civil', mathjsSymbol: 'cuft' },
      { id: 'in3', name: 'Cubic Inch', symbol: 'in³', factorToBase: 0.000016387064, domain: 'mechanical', mathjsSymbol: 'cuin' },
      { id: 'floz_us', name: 'Fluid Ounce (US)', symbol: 'fl oz', factorToBase: 0.0000295735295625, domain: 'chemical', mathjsSymbol: 'floz' }
    ]
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    baseUnit: 'kg',
    domain: 'mechanical',
    description: 'Component mass, payload weight, structural inertia',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', factorToBase: 1, domain: 'general', mathjsSymbol: 'kg' },
      { id: 'g', name: 'Gram', symbol: 'g', factorToBase: 0.001, domain: 'chemical', mathjsSymbol: 'g' },
      { id: 'mg', name: 'Milligram', symbol: 'mg', factorToBase: 1e-6, domain: 'chemical', mathjsSymbol: 'mg' },
      { id: 'ug', name: 'Microgram', symbol: 'µg', factorToBase: 1e-9, domain: 'chemical', mathjsSymbol: 'ug' },
      { id: 'tonne', name: 'Metric Tonne', symbol: 't', factorToBase: 1000, domain: 'civil', mathjsSymbol: 'tonne' },
      { id: 'lb', name: 'Pound (Avoirdupois)', symbol: 'lb', factorToBase: 0.45359237, domain: 'mechanical', mathjsSymbol: 'lb' },
      { id: 'oz', name: 'Ounce', symbol: 'oz', factorToBase: 0.028349523125, domain: 'general', mathjsSymbol: 'oz' },
      { id: 'slug', name: 'Slug', symbol: 'slug', factorToBase: 14.5939029, domain: 'aerospace', mathjsSymbol: 'slug' },
      { id: 'short_ton', name: 'Short Ton (US)', symbol: 'ton (US)', factorToBase: 907.18474, domain: 'civil' },
      { id: 'grain', name: 'Grain', symbol: 'gr', factorToBase: 0.00006479891, domain: 'chemical', mathjsSymbol: 'grain' },
      { id: 'dalton', name: 'Atomic Mass Unit / Dalton', symbol: 'Da / u', factorToBase: 1.6605390666e-27, domain: 'chemical', mathjsSymbol: 'amu' }
    ]
  },
  {
    id: 'force',
    name: 'Force & Thrust',
    baseUnit: 'N',
    domain: 'mechanical',
    description: 'Tension, compression, rocket thrust, reaction forces',
    units: [
      { id: 'N', name: 'Newton', symbol: 'N', factorToBase: 1, domain: 'mechanical', mathjsSymbol: 'N' },
      { id: 'kN', name: 'Kilonewton', symbol: 'kN', factorToBase: 1000, domain: 'civil', mathjsSymbol: 'kN' },
      { id: 'MN', name: 'Meganewton', symbol: 'MN', factorToBase: 1e6, domain: 'civil', mathjsSymbol: 'MN' },
      { id: 'lbf', name: 'Pound-force', symbol: 'lbf', factorToBase: 4.4482216152605, domain: 'mechanical', mathjsSymbol: 'lbf' },
      { id: 'kip', name: 'Kilopound-force (Kip)', symbol: 'kip', factorToBase: 4448.2216152605, domain: 'civil', mathjsSymbol: 'kip' },
      { id: 'dyn', name: 'Dyne', symbol: 'dyn', factorToBase: 1e-5, domain: 'chemical', mathjsSymbol: 'dyn' },
      { id: 'kgf', name: 'Kilogram-force', symbol: 'kgf', factorToBase: 9.80665, domain: 'mechanical', mathjsSymbol: 'kgf' },
      { id: 'pdl', name: 'Poundal', symbol: 'pdl', factorToBase: 0.138254954376, domain: 'aerospace' }
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure & Stress',
    baseUnit: 'Pa',
    domain: 'mechanical',
    description: 'Material yield stress, fluid pressure, vacuum levels',
    units: [
      { id: 'Pa', name: 'Pascal', symbol: 'Pa', factorToBase: 1, domain: 'mechanical', mathjsSymbol: 'Pa' },
      { id: 'kPa', name: 'Kilopascal', symbol: 'kPa', factorToBase: 1000, domain: 'civil', mathjsSymbol: 'kPa' },
      { id: 'MPa', name: 'Megapascal (N/mm²)', symbol: 'MPa', factorToBase: 1e6, domain: 'mechanical', mathjsSymbol: 'MPa' },
      { id: 'GPa', name: 'Gigapascal', symbol: 'GPa', factorToBase: 1e9, domain: 'mechanical', mathjsSymbol: 'GPa' },
      { id: 'bar', name: 'Bar', symbol: 'bar', factorToBase: 100000, domain: 'chemical', mathjsSymbol: 'bar' },
      { id: 'mbar', name: 'Millibar', symbol: 'mbar', factorToBase: 100, domain: 'aerospace', mathjsSymbol: 'mbar' },
      { id: 'psi', name: 'Pounds per Square Inch', symbol: 'psi', factorToBase: 6894.757293168, domain: 'mechanical', mathjsSymbol: 'psi' },
      { id: 'ksi', name: 'Kilopounds per Square Inch', symbol: 'ksi', factorToBase: 6894757.293168, domain: 'civil', mathjsSymbol: 'ksi' },
      { id: 'atm', name: 'Standard Atmosphere', symbol: 'atm', factorToBase: 101325, domain: 'aerospace', mathjsSymbol: 'atm' },
      { id: 'torr', name: 'Torr (mmHg)', symbol: 'Torr', factorToBase: 133.322368421, domain: 'chemical', mathjsSymbol: 'torr' },
      { id: 'inHg', name: 'Inches of Mercury', symbol: 'inHg', factorToBase: 3386.3886666667, domain: 'aerospace', mathjsSymbol: 'inHg' },
      { id: 'mmH2O', name: 'Millimeters of Water', symbol: 'mmH₂O', factorToBase: 9.80665, domain: 'chemical', mathjsSymbol: 'mmH2O' }
    ]
  },
  {
    id: 'energy',
    name: 'Energy, Work & Heat',
    baseUnit: 'J',
    domain: 'mechanical',
    description: 'Enthalpy, kinetic energy, electrical work, calorific value',
    units: [
      { id: 'J', name: 'Joule', symbol: 'J', factorToBase: 1, domain: 'general', mathjsSymbol: 'J' },
      { id: 'kJ', name: 'Kilojoule', symbol: 'kJ', factorToBase: 1000, domain: 'chemical', mathjsSymbol: 'kJ' },
      { id: 'MJ', name: 'Megajoule', symbol: 'MJ', factorToBase: 1e6, domain: 'mechanical', mathjsSymbol: 'MJ' },
      { id: 'GJ', name: 'Gigajoule', symbol: 'GJ', factorToBase: 1e9, domain: 'chemical', mathjsSymbol: 'GJ' },
      { id: 'kWh', name: 'Kilowatt-hour', symbol: 'kWh', factorToBase: 3.6e6, domain: 'electrical', mathjsSymbol: 'kWh' },
      { id: 'MWh', name: 'Megawatt-hour', symbol: 'MWh', factorToBase: 3.6e9, domain: 'electrical', mathjsSymbol: 'MWh' },
      { id: 'cal', name: 'Thermochemical Calorie', symbol: 'cal', factorToBase: 4.184, domain: 'chemical', mathjsSymbol: 'cal' },
      { id: 'kcal', name: 'Kilocalorie (kcal)', symbol: 'kcal', factorToBase: 4184, domain: 'chemical', mathjsSymbol: 'kcal' },
      { id: 'btu', name: 'British Thermal Unit (ISO)', symbol: 'BTU', factorToBase: 1055.05585262, domain: 'mechanical', mathjsSymbol: 'BTU' },
      { id: 'ft_lbf', name: 'Foot-Pound', symbol: 'ft·lbf', factorToBase: 1.3558179483314, domain: 'mechanical', mathjsSymbol: 'footpound' },
      { id: 'eV', name: 'Electronvolt', symbol: 'eV', factorToBase: 1.602176634e-19, domain: 'electrical', mathjsSymbol: 'eV' },
      { id: 'keV', name: 'Kiloelectronvolt', symbol: 'keV', factorToBase: 1.602176634e-16, domain: 'electrical', mathjsSymbol: 'keV' },
      { id: 'MeV', name: 'Megaelectronvolt', symbol: 'MeV', factorToBase: 1.602176634e-13, domain: 'electrical', mathjsSymbol: 'MeV' },
      { id: 'therm', name: 'US Therm', symbol: 'therm', factorToBase: 1.054804e8, domain: 'chemical' }
    ]
  },
  {
    id: 'power',
    name: 'Power & Heat Rate',
    baseUnit: 'W',
    domain: 'electrical',
    description: 'Motor output, electrical dissipation, turbine power',
    units: [
      { id: 'W', name: 'Watt', symbol: 'W', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'W' },
      { id: 'mW', name: 'Milliwatt', symbol: 'mW', factorToBase: 0.001, domain: 'electrical', mathjsSymbol: 'mW' },
      { id: 'kW', name: 'Kilowatt', symbol: 'kW', factorToBase: 1000, domain: 'electrical', mathjsSymbol: 'kW' },
      { id: 'MW', name: 'Megawatt', symbol: 'MW', factorToBase: 1e6, domain: 'electrical', mathjsSymbol: 'MW' },
      { id: 'GW', name: 'Gigawatt', symbol: 'GW', factorToBase: 1e9, domain: 'electrical', mathjsSymbol: 'GW' },
      { id: 'hp_mech', name: 'Horsepower (Mechanical / Imperial)', symbol: 'hp', factorToBase: 745.69987158227, domain: 'mechanical', mathjsSymbol: 'hp' },
      { id: 'hp_metric', name: 'Horsepower (Metric / PS / CV)', symbol: 'PS / ch', factorToBase: 735.49875, domain: 'mechanical' },
      { id: 'btu_hr', name: 'BTU per hour', symbol: 'BTU/h', factorToBase: 0.29307107, domain: 'mechanical' },
      { id: 'ton_ref', name: 'Ton of Refrigeration', symbol: 'TR', factorToBase: 3516.85284, domain: 'mechanical' },
      { id: 'ft_lbf_s', name: 'Foot-pound per second', symbol: 'ft·lbf/s', factorToBase: 1.3558179483314, domain: 'mechanical' }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'K',
    domain: 'chemical',
    description: 'Thermodynamic temperature, operating ranges, superheat',
    isNonLinear: true,
    units: [
      { id: 'C', name: 'Degree Celsius', symbol: '°C', factorToBase: 1, domain: 'general', mathjsSymbol: 'degC' },
      { id: 'F', name: 'Degree Fahrenheit', symbol: '°F', factorToBase: 1, domain: 'general', mathjsSymbol: 'degF' },
      { id: 'K', name: 'Kelvin', symbol: 'K', factorToBase: 1, domain: 'chemical', mathjsSymbol: 'K' },
      { id: 'R', name: 'Rankine', symbol: '°R', factorToBase: 1, domain: 'aerospace', mathjsSymbol: 'degR' }
    ]
  },
  {
    id: 'velocity',
    name: 'Velocity & Speed',
    baseUnit: 'm/s',
    domain: 'aerospace',
    description: 'Fluid flow velocity, air velocity, orbital speed',
    units: [
      { id: 'm_s', name: 'Meters per Second', symbol: 'm/s', factorToBase: 1, domain: 'aerospace', mathjsSymbol: 'm/s' },
      { id: 'km_h', name: 'Kilometers per Hour', symbol: 'km/h', factorToBase: 1 / 3.6, domain: 'general', mathjsSymbol: 'km/h' },
      { id: 'mph', name: 'Miles per Hour', symbol: 'mph', factorToBase: 0.44704, domain: 'general', mathjsSymbol: 'mph' },
      { id: 'knot', name: 'Knot (nmi/h)', symbol: 'kn', factorToBase: 1852 / 3600, domain: 'aerospace', mathjsSymbol: 'knot' },
      { id: 'ft_s', name: 'Feet per Second', symbol: 'ft/s', factorToBase: 0.3048, domain: 'civil', mathjsSymbol: 'ft/s' },
      { id: 'mach', name: 'Mach (Air at 20°C, 1 atm)', symbol: 'Mach', factorToBase: 343.2, domain: 'aerospace' },
      { id: 'c', name: 'Speed of Light', symbol: 'c', factorToBase: 299792458, domain: 'aerospace' }
    ]
  },
  {
    id: 'acceleration',
    name: 'Acceleration',
    baseUnit: 'm/s²',
    domain: 'aerospace',
    description: 'Structural g-force, vibration, kinematic acceleration',
    units: [
      { id: 'm_s2', name: 'Meter per Second Squared', symbol: 'm/s²', factorToBase: 1, domain: 'mechanical', mathjsSymbol: 'm/s^2' },
      { id: 'g0', name: 'Standard Earth Gravity', symbol: 'g', factorToBase: 9.80665, domain: 'aerospace', mathjsSymbol: 'gravity' },
      { id: 'ft_s2', name: 'Feet per Second Squared', symbol: 'ft/s²', factorToBase: 0.3048, domain: 'civil' },
      { id: 'gal', name: 'Gal (cm/s²)', symbol: 'Gal', factorToBase: 0.01, domain: 'civil' }
    ]
  },
  {
    id: 'density',
    name: 'Density',
    baseUnit: 'kg/m³',
    domain: 'chemical',
    description: 'Specific mass, fluid density, material compaction',
    units: [
      { id: 'kg_m3', name: 'Kilogram per Cubic Meter', symbol: 'kg/m³', factorToBase: 1, domain: 'chemical', mathjsSymbol: 'kg/m^3' },
      { id: 'g_cm3', name: 'Gram per Cubic Centimeter', symbol: 'g/cm³', factorToBase: 1000, domain: 'chemical', mathjsSymbol: 'g/cm^3' },
      { id: 'kg_L', name: 'Kilogram per Liter', symbol: 'kg/L', factorToBase: 1000, domain: 'chemical' },
      { id: 'lb_ft3', name: 'Pounds per Cubic Foot', symbol: 'lb/ft³', factorToBase: 16.018463, domain: 'civil' },
      { id: 'lb_in3', name: 'Pounds per Cubic Inch', symbol: 'lb/in³', factorToBase: 27679.904, domain: 'mechanical' },
      { id: 'lb_gal_us', name: 'Pounds per US Gallon', symbol: 'lb/gal', factorToBase: 119.826427, domain: 'chemical' },
      { id: 'slug_ft3', name: 'Slugs per Cubic Foot', symbol: 'slug/ft³', factorToBase: 515.378818, domain: 'aerospace' }
    ]
  },
  {
    id: 'dyn_viscosity',
    name: 'Dynamic Viscosity',
    baseUnit: 'Pa·s',
    domain: 'chemical',
    description: 'Fluid shear resistance, lubricant rating, Navier-Stokes',
    units: [
      { id: 'Pa_s', name: 'Pascal-second', symbol: 'Pa·s', factorToBase: 1, domain: 'chemical', mathjsSymbol: 'Pa*s' },
      { id: 'mPa_s', name: 'Millipascal-second (cP)', symbol: 'mPa·s', factorToBase: 0.001, domain: 'chemical' },
      { id: 'P', name: 'Poise', symbol: 'P', factorToBase: 0.1, domain: 'chemical', mathjsSymbol: 'poise' },
      { id: 'cP', name: 'Centipoise', symbol: 'cP', factorToBase: 0.001, domain: 'chemical', mathjsSymbol: 'cp' },
      { id: 'lbf_s_ft2', name: 'Pound-force second per sq ft', symbol: 'lbf·s/ft²', factorToBase: 47.880259, domain: 'mechanical' },
      { id: 'lb_ft_s', name: 'Pound per foot second', symbol: 'lb/(ft·s)', factorToBase: 1.4881639, domain: 'mechanical' }
    ]
  },
  {
    id: 'kin_viscosity',
    name: 'Kinematic Viscosity',
    baseUnit: 'm²/s',
    domain: 'mechanical',
    description: 'Hydraulic oil grade, kinematic momentum diffusivity',
    units: [
      { id: 'm2_s', name: 'Square Meter per Second', symbol: 'm²/s', factorToBase: 1, domain: 'mechanical' },
      { id: 'mm2_s', name: 'Square Millimeter per Second (cSt)', symbol: 'mm²/s', factorToBase: 1e-6, domain: 'mechanical' },
      { id: 'St', name: 'Stokes', symbol: 'St', factorToBase: 1e-4, domain: 'chemical', mathjsSymbol: 'stokes' },
      { id: 'cSt', name: 'Centistokes', symbol: 'cSt', factorToBase: 1e-6, domain: 'chemical', mathjsSymbol: 'cst' },
      { id: 'ft2_s', name: 'Square Feet per Second', symbol: 'ft²/s', factorToBase: 0.09290304, domain: 'mechanical' }
    ]
  },
  {
    id: 'vol_flow',
    name: 'Volumetric Flow Rate',
    baseUnit: 'm³/s',
    domain: 'mechanical',
    description: 'Pump discharge, HVAC airflow, pipe delivery',
    units: [
      { id: 'm3_s', name: 'Cubic Meter per Second', symbol: 'm³/s', factorToBase: 1, domain: 'civil', mathjsSymbol: 'm^3/s' },
      { id: 'm3_h', name: 'Cubic Meter per Hour', symbol: 'm³/h', factorToBase: 1 / 3600, domain: 'chemical' },
      { id: 'L_s', name: 'Liter per Second', symbol: 'L/s', factorToBase: 0.001, domain: 'chemical' },
      { id: 'L_min', name: 'Liter per Minute (LPM)', symbol: 'L/min', factorToBase: 0.001 / 60, domain: 'chemical' },
      { id: 'cfm', name: 'Cubic Feet per Minute (CFM)', symbol: 'CFM', factorToBase: 0.000471947443, domain: 'mechanical', mathjsSymbol: 'cfm' },
      { id: 'gpm_us', name: 'Gallons per Minute (US GPM)', symbol: 'GPM (US)', factorToBase: 0.0000630901964, domain: 'mechanical' },
      { id: 'gph_us', name: 'Gallons per Hour (US GPH)', symbol: 'GPH (US)', factorToBase: 0.0000630901964 / 60, domain: 'mechanical' },
      { id: 'bpd', name: 'Barrels per Day (Oil)', symbol: 'BPD', factorToBase: 0.158987294928 / 86400, domain: 'chemical' }
    ]
  },
  {
    id: 'mass_flow',
    name: 'Mass Flow Rate',
    baseUnit: 'kg/s',
    domain: 'aerospace',
    description: 'Turbine propellant intake, boiler steam mass throughput',
    units: [
      { id: 'kg_s', name: 'Kilograms per Second', symbol: 'kg/s', factorToBase: 1, domain: 'aerospace' },
      { id: 'kg_h', name: 'Kilograms per Hour', symbol: 'kg/h', factorToBase: 1 / 3600, domain: 'chemical' },
      { id: 't_h', name: 'Tonnes per Hour', symbol: 't/h', factorToBase: 1000 / 3600, domain: 'civil' },
      { id: 'lb_s', name: 'Pounds per Second', symbol: 'lb/s', factorToBase: 0.45359237, domain: 'aerospace' },
      { id: 'lb_h', name: 'Pounds per Hour', symbol: 'lb/h', factorToBase: 0.45359237 / 3600, domain: 'mechanical' }
    ]
  },
  {
    id: 'voltage',
    name: 'Electric Potential & Voltage',
    baseUnit: 'V',
    domain: 'electrical',
    description: 'Logic level, high voltage grid, sensor analog signal',
    units: [
      { id: 'V', name: 'Volt', symbol: 'V', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'V' },
      { id: 'mV', name: 'Millivolt', symbol: 'mV', factorToBase: 1e-3, domain: 'electrical', mathjsSymbol: 'mV' },
      { id: 'uV', name: 'Microvolt', symbol: 'µV', factorToBase: 1e-6, domain: 'electrical', mathjsSymbol: 'uV' },
      { id: 'kV', name: 'Kilovolt', symbol: 'kV', factorToBase: 1000, domain: 'electrical', mathjsSymbol: 'kV' },
      { id: 'MV', name: 'Megavolt', symbol: 'MV', factorToBase: 1e6, domain: 'electrical', mathjsSymbol: 'MV' }
    ]
  },
  {
    id: 'current',
    name: 'Electric Current',
    baseUnit: 'A',
    domain: 'electrical',
    description: 'Busbar current, quiescent current, circuit branch flow',
    units: [
      { id: 'A', name: 'Ampere', symbol: 'A', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'A' },
      { id: 'mA', name: 'Milliampere', symbol: 'mA', factorToBase: 1e-3, domain: 'electrical', mathjsSymbol: 'mA' },
      { id: 'uA', name: 'Microampere', symbol: 'µA', factorToBase: 1e-6, domain: 'electrical', mathjsSymbol: 'uA' },
      { id: 'nA', name: 'Nanoampere', symbol: 'nA', factorToBase: 1e-9, domain: 'electrical' },
      { id: 'kA', name: 'Kiloampere', symbol: 'kA', factorToBase: 1000, domain: 'electrical', mathjsSymbol: 'kA' }
    ]
  },
  {
    id: 'resistance',
    name: 'Resistance & Impedance',
    baseUnit: 'ohm',
    domain: 'electrical',
    description: 'Component resistance, trace impedance, insulation test',
    units: [
      { id: 'ohm', name: 'Ohm', symbol: 'Ω', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'ohm' },
      { id: 'mohm', name: 'Milliohm', symbol: 'mΩ', factorToBase: 1e-3, domain: 'electrical' },
      { id: 'kohm', name: 'Kiloohm', symbol: 'kΩ', factorToBase: 1000, domain: 'electrical', mathjsSymbol: 'kohm' },
      { id: 'Mohm', name: 'Megaohm', symbol: 'MΩ', factorToBase: 1e6, domain: 'electrical', mathjsSymbol: 'Mohm' },
      { id: 'Gohm', name: 'Gigaohm', symbol: 'GΩ', factorToBase: 1e9, domain: 'electrical', mathjsSymbol: 'Gohm' }
    ]
  },
  {
    id: 'capacitance',
    name: 'Capacitance',
    baseUnit: 'F',
    domain: 'electrical',
    description: 'Filter capacitor, decoupling, cable parasitics',
    units: [
      { id: 'F', name: 'Farad', symbol: 'F', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'F' },
      { id: 'mF', name: 'Millifarad', symbol: 'mF', factorToBase: 1e-3, domain: 'electrical', mathjsSymbol: 'mF' },
      { id: 'uF', name: 'Microfarad', symbol: 'µF', factorToBase: 1e-6, domain: 'electrical', mathjsSymbol: 'uF' },
      { id: 'nF', name: 'Nanofarad', symbol: 'nF', factorToBase: 1e-9, domain: 'electrical', mathjsSymbol: 'nF' },
      { id: 'pF', name: 'Picofarad', symbol: 'pF', factorToBase: 1e-12, domain: 'electrical', mathjsSymbol: 'pF' }
    ]
  },
  {
    id: 'inductance',
    name: 'Inductance',
    baseUnit: 'H',
    domain: 'electrical',
    description: 'Choke coil, transformer winding, loop inductance',
    units: [
      { id: 'H', name: 'Henry', symbol: 'H', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'H' },
      { id: 'mH', name: 'Millihenry', symbol: 'mH', factorToBase: 1e-3, domain: 'electrical', mathjsSymbol: 'mH' },
      { id: 'uH', name: 'Microhenry', symbol: 'µH', factorToBase: 1e-6, domain: 'electrical', mathjsSymbol: 'uH' },
      { id: 'nH', name: 'Nanohenry', symbol: 'nH', factorToBase: 1e-9, domain: 'electrical', mathjsSymbol: 'nH' }
    ]
  },
  {
    id: 'frequency',
    name: 'Frequency & Angular Speed',
    baseUnit: 'Hz',
    domain: 'electrical',
    description: 'Clock rate, RF carrier, motor rotational speed',
    units: [
      { id: 'Hz', name: 'Hertz', symbol: 'Hz', factorToBase: 1, domain: 'electrical', mathjsSymbol: 'Hz' },
      { id: 'kHz', name: 'Kilohertz', symbol: 'kHz', factorToBase: 1000, domain: 'electrical', mathjsSymbol: 'kHz' },
      { id: 'MHz', name: 'Megahertz', symbol: 'MHz', factorToBase: 1e6, domain: 'electrical', mathjsSymbol: 'MHz' },
      { id: 'GHz', name: 'Gigahertz', symbol: 'GHz', factorToBase: 1e9, domain: 'electrical', mathjsSymbol: 'GHz' },
      { id: 'rpm', name: 'Revolutions per Minute', symbol: 'RPM', factorToBase: 1 / 60, domain: 'mechanical', mathjsSymbol: 'rpm' },
      { id: 'rad_s', name: 'Radians per Second', symbol: 'rad/s', factorToBase: 1 / (2 * Math.PI), domain: 'mechanical' },
      { id: 'deg_s', name: 'Degrees per Second', symbol: '°/s', factorToBase: 1 / 360, domain: 'aerospace' }
    ]
  },
  {
    id: 'torque',
    name: 'Torque & Moment',
    baseUnit: 'N·m',
    domain: 'mechanical',
    description: 'Motor shaft torque, bolt fastening torque, bending moment',
    units: [
      { id: 'Nm', name: 'Newton-meter', symbol: 'N·m', factorToBase: 1, domain: 'mechanical', mathjsSymbol: 'N*m' },
      { id: 'kNm', name: 'Kilonewton-meter', symbol: 'kN·m', factorToBase: 1000, domain: 'civil' },
      { id: 'lbf_ft', name: 'Pound-foot', symbol: 'lbf·ft', factorToBase: 1.3558179483314, domain: 'mechanical' },
      { id: 'lbf_in', name: 'Pound-inch', symbol: 'lbf·in', factorToBase: 0.112984829, domain: 'mechanical' },
      { id: 'ozf_in', name: 'Ounce-inch', symbol: 'ozf·in', factorToBase: 0.0070615518, domain: 'electrical' },
      { id: 'kgf_m', name: 'Kilogram-force meter', symbol: 'kgf·m', factorToBase: 9.80665, domain: 'mechanical' }
    ]
  },
  {
    id: 'data_storage',
    name: 'Data Storage & Memory',
    baseUnit: 'B',
    domain: 'digital',
    description: 'Buffer size, RAM allocation, binary vs decimal capacity',
    units: [
      { id: 'B', name: 'Byte', symbol: 'B', factorToBase: 1, domain: 'digital', mathjsSymbol: 'byte' },
      { id: 'bit', name: 'Bit', symbol: 'b', factorToBase: 0.125, domain: 'digital', mathjsSymbol: 'bit' },
      { id: 'KB', name: 'Kilobyte (Decimal 10³)', symbol: 'KB', factorToBase: 1e3, domain: 'digital', mathjsSymbol: 'kB' },
      { id: 'MB', name: 'Megabyte (Decimal 10⁶)', symbol: 'MB', factorToBase: 1e6, domain: 'digital', mathjsSymbol: 'MB' },
      { id: 'GB', name: 'Gigabyte (Decimal 10⁹)', symbol: 'GB', factorToBase: 1e9, domain: 'digital', mathjsSymbol: 'GB' },
      { id: 'TB', name: 'Terabyte (Decimal 10¹²)', symbol: 'TB', factorToBase: 1e12, domain: 'digital', mathjsSymbol: 'TB' },
      { id: 'PB', name: 'Petabyte (Decimal 10¹⁵)', symbol: 'PB', factorToBase: 1e15, domain: 'digital' },
      { id: 'KiB', name: 'Kibibyte (Binary 2¹⁰)', symbol: 'KiB', factorToBase: 1024, domain: 'digital', mathjsSymbol: 'KiB' },
      { id: 'MiB', name: 'Mebibyte (Binary 2²⁰)', symbol: 'MiB', factorToBase: 1048576, domain: 'digital', mathjsSymbol: 'MiB' },
      { id: 'GiB', name: 'Gibibyte (Binary 2³⁰)', symbol: 'GiB', factorToBase: 1073741824, domain: 'digital', mathjsSymbol: 'GiB' },
      { id: 'TiB', name: 'Tebibyte (Binary 2⁴⁰)', symbol: 'TiB', factorToBase: 1099511627776, domain: 'digital', mathjsSymbol: 'TiB' }
    ]
  },
  {
    id: 'data_transfer',
    name: 'Data Transfer Rate',
    baseUnit: 'bps',
    domain: 'digital',
    description: 'Network throughput, bus bandwidth, serial baud rate',
    units: [
      { id: 'bps', name: 'Bits per Second', symbol: 'bps', factorToBase: 1, domain: 'digital', mathjsSymbol: 'bps' },
      { id: 'kbps', name: 'Kilobits per Second', symbol: 'kbps', factorToBase: 1e3, domain: 'digital', mathjsSymbol: 'kbps' },
      { id: 'Mbps', name: 'Megabits per Second', symbol: 'Mbps', factorToBase: 1e6, domain: 'digital', mathjsSymbol: 'Mbps' },
      { id: 'Gbps', name: 'Gigabits per Second', symbol: 'Gbps', factorToBase: 1e9, domain: 'digital', mathjsSymbol: 'Gbps' },
      { id: 'Tbps', name: 'Terabits per Second', symbol: 'Tbps', factorToBase: 1e12, domain: 'digital' },
      { id: 'B_s', name: 'Bytes per Second', symbol: 'B/s', factorToBase: 8, domain: 'digital' },
      { id: 'KB_s', name: 'Kilobytes per Second', symbol: 'KB/s', factorToBase: 8e3, domain: 'digital' },
      { id: 'MB_s', name: 'Megabytes per Second', symbol: 'MB/s', factorToBase: 8e6, domain: 'digital' },
      { id: 'GB_s', name: 'Gigabytes per Second', symbol: 'GB/s', factorToBase: 8e9, domain: 'digital' }
    ]
  },
  {
    id: 'radiation',
    name: 'Radiation & Dosimetry',
    baseUnit: 'Gy',
    domain: 'aerospace',
    description: 'Absorbed radiation dose, equivalent human dose, radioactivity',
    units: [
      { id: 'Gy', name: 'Gray (Absorbed Dose)', symbol: 'Gy', factorToBase: 1, domain: 'aerospace' },
      { id: 'mGy', name: 'Milligray', symbol: 'mGy', factorToBase: 1e-3, domain: 'aerospace' },
      { id: 'rad', name: 'Rad', symbol: 'rad', factorToBase: 0.01, domain: 'aerospace', mathjsSymbol: 'rad' },
      { id: 'Sv', name: 'Sievert (Equivalent Dose)', symbol: 'Sv', factorToBase: 1, domain: 'aerospace' },
      { id: 'mSv', name: 'Millisievert', symbol: 'mSv', factorToBase: 1e-3, domain: 'aerospace' },
      { id: 'uSv', name: 'Microsievert', symbol: 'µSv', factorToBase: 1e-6, domain: 'aerospace' },
      { id: 'rem', name: 'Rem', symbol: 'rem', factorToBase: 0.01, domain: 'aerospace' },
      { id: 'Bq', name: 'Becquerel (Activity)', symbol: 'Bq', factorToBase: 1, domain: 'chemical' },
      { id: 'Ci', name: 'Curie', symbol: 'Ci', factorToBase: 3.7e10, domain: 'chemical' }
    ]
  }
];

export const DOMAINS = [
  { id: 'all', label: 'All Domains' },
  { id: 'mechanical', label: 'Mechanical & Fluid' },
  { id: 'electrical', label: 'Electrical & RF' },
  { id: 'civil', label: 'Civil & Structural' },
  { id: 'chemical', label: 'Chemical & Thermal' },
  { id: 'aerospace', label: 'Aerospace & Propulsion' },
  { id: 'digital', label: 'Computer & Network' }
] as const;
