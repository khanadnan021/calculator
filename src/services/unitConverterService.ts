/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UNIT_CATEGORIES, UnitCategory, UnitDefinition } from '../data/unitsData';
import { toEngineeringNotation } from './mathEngine';

export interface ConvertedUnitItem {
  unit: UnitDefinition;
  numericValue: number;
  formattedStandard: string;
  formattedScientific: string;
  formattedEngineering: string;
  factorRatio: number;
  isSource: boolean;
}

export function convertTemperature(value: number, fromUnitId: string, toUnitId: string): number {
  if (fromUnitId === toUnitId) return value;
  
  // First convert from source to Kelvin
  let kelvin: number;
  switch (fromUnitId) {
    case 'C':
      kelvin = value + 273.15;
      break;
    case 'F':
      kelvin = (value - 32) * (5 / 9) + 273.15;
      break;
    case 'K':
      kelvin = value;
      break;
    case 'R':
      kelvin = value * (5 / 9);
      break;
    default:
      kelvin = value;
  }

  // Then convert from Kelvin to target
  switch (toUnitId) {
    case 'C':
      return kelvin - 273.15;
    case 'F':
      return (kelvin - 273.15) * (9 / 5) + 32;
    case 'K':
      return kelvin;
    case 'R':
      return kelvin * (9 / 5);
    default:
      return kelvin;
  }
}

export function convertCategoryValues(
  category: UnitCategory,
  sourceUnitId: string,
  sourceValue: number,
  precision = 6
): ConvertedUnitItem[] {
  if (isNaN(sourceValue) || !isFinite(sourceValue)) {
    return category.units.map((u) => ({
      unit: u,
      numericValue: 0,
      formattedStandard: '—',
      formattedScientific: '—',
      formattedEngineering: '—',
      factorRatio: 1,
      isSource: u.id === sourceUnitId
    }));
  }

  const sourceUnit = category.units.find((u) => u.id === sourceUnitId) || category.units[0];

  return category.units.map((targetUnit) => {
    let resultValue: number;
    let ratio = 1;

    if (category.isNonLinear) {
      resultValue = convertTemperature(sourceValue, sourceUnit.id, targetUnit.id);
      ratio = 1;
    } else {
      // Linear conversion via SI base
      const valueInBase = sourceValue * sourceUnit.factorToBase;
      resultValue = valueInBase / targetUnit.factorToBase;
      ratio = sourceUnit.factorToBase / targetUnit.factorToBase;
    }

    // Format results
    const std = Number.isInteger(resultValue)
      ? resultValue.toLocaleString('en-US', { useGrouping: true })
      : Number(resultValue.toPrecision(precision)).toString();

    const sci = resultValue.toExponential(precision - 1);
    const eng = toEngineeringNotation(resultValue, precision);

    return {
      unit: targetUnit,
      numericValue: resultValue,
      formattedStandard: std,
      formattedScientific: sci,
      formattedEngineering: eng,
      factorRatio: ratio,
      isSource: targetUnit.id === sourceUnitId
    };
  });
}

export function findCategoryByUnitId(unitId: string): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((cat) => cat.units.some((u) => u.id === unitId));
}
