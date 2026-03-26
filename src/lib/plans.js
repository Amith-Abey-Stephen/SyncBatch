export const PLANS = {
  personal: [
    { id: 'personal_3', name: '3 Syncs', credits: 3, price: 29, currency: 'INR' },
    { id: 'personal_10', name: '10 Syncs', credits: 10, price: 79, currency: 'INR' },
    { id: 'personal_25', name: '25 Syncs', credits: 25, price: 149, currency: 'INR' },
  ],
  institution: [
    { id: 'institution_50', name: '50 Sync Requests', credits: 50, price: 299, currency: 'INR' },
    { id: 'institution_200', name: '200 Sync Requests', credits: 200, price: 799, currency: 'INR' },
  ],
};

export function getPlanById(planId) {
  const allPlans = [...PLANS.personal, ...PLANS.institution];
  return allPlans.find(p => p.id === planId) || null;
}
