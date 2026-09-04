export type PlanFrequency = 1 | 2 | 3;
export type PlanVisitHours = 2 | 3 | 4;

export type MonthlyPlan = {
  frequency: PlanFrequency;
  visitHours: PlanVisitHours;
  hoursPerMonth: number;
  priceEuros: number;
  wasEuros: number;
  saveEuros: number;
  perHour: number;
  bestValue?: boolean;
};

/** Monthly cleaning packages — prices match the Cleanovox plans card. */
export const MONTHLY_PLANS: MonthlyPlan[] = [
  { frequency: 1, visitHours: 2, hoursPerMonth: 8, priceEuros: 95, wasEuros: 104, saveEuros: 9, perHour: 11.88 },
  { frequency: 1, visitHours: 3, hoursPerMonth: 12, priceEuros: 145, wasEuros: 156, saveEuros: 11, perHour: 12.08 },
  { frequency: 1, visitHours: 4, hoursPerMonth: 16, priceEuros: 190, wasEuros: 208, saveEuros: 18, perHour: 11.88 },
  { frequency: 2, visitHours: 2, hoursPerMonth: 16, priceEuros: 190, wasEuros: 208, saveEuros: 18, perHour: 11.88 },
  { frequency: 2, visitHours: 3, hoursPerMonth: 24, priceEuros: 285, wasEuros: 312, saveEuros: 27, perHour: 11.88 },
  { frequency: 2, visitHours: 4, hoursPerMonth: 32, priceEuros: 375, wasEuros: 416, saveEuros: 41, perHour: 11.72 },
  { frequency: 3, visitHours: 2, hoursPerMonth: 24, priceEuros: 285, wasEuros: 312, saveEuros: 27, perHour: 11.88 },
  {
    frequency: 3,
    visitHours: 3,
    hoursPerMonth: 36,
    priceEuros: 405,
    wasEuros: 468,
    saveEuros: 63,
    perHour: 11.25,
    bestValue: true,
  },
  { frequency: 3, visitHours: 4, hoursPerMonth: 48, priceEuros: 525, wasEuros: 624, saveEuros: 99, perHour: 10.94 },
];

export const PLAN_FREQUENCIES: PlanFrequency[] = [1, 2, 3];
export const PLAN_VISIT_HOURS: PlanVisitHours[] = [2, 3, 4];

export function findMonthlyPlan(
  frequency: PlanFrequency,
  visitHours: PlanVisitHours
): MonthlyPlan {
  return MONTHLY_PLANS.find(
    (plan) => plan.frequency === frequency && plan.visitHours === visitHours
  ) as MonthlyPlan;
}
