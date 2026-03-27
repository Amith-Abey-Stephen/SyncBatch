export const PLANS = {
  personal: [
    { 
      id: 'personal_3', name: 'Intro Pack', credits: 3, price: 29, currency: 'INR', 
      maxContacts: 100,
      benefits: ['100 contacts/sync', 'Google & iPhone Sync', 'Smart Deduplication']
    },
    { 
      id: 'personal_10', name: 'Power Pack', credits: 10, price: 79, currency: 'INR', 
      maxContacts: 500,
      benefits: ['500 contacts/sync', 'Priority Processing', 'Lifetime Validity']
    },
    { 
      id: 'personal_25', name: 'Pro Pack', credits: 25, price: 149, currency: 'INR', 
      maxContacts: 1000,
      benefits: ['1000 contacts/sync', 'Excel & CSV support', 'Premium Support']
    },
  ],
  institution: [
    { 
      id: 'institution_50', name: 'Dept Starter', credits: 50, price: 499, currency: 'INR', 
      maxContacts: 2000,
      benefits: ['2000 contacts/request', 'Organization Dashboard', 'Invite 10 Members', 'Shared Sync Requests']
    },
    { 
      id: 'institution_200', name: 'Campus Elite', credits: 200, price: 1499, currency: 'INR', 
      maxContacts: 10000,
      benefits: ['10,000 contacts/request', 'Unlimited Members', 'Admin Control Panel', 'Bulk Sync Analytics']
    },
  ],
};

export function getPlanById(planId) {
  const allPlans = [...PLANS.personal, ...PLANS.institution];
  return allPlans.find(p => p.id === planId) || null;
}
