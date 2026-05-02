export const PLANS = {
  personal: [
    { 
      id: 'personal_3', 
      name: 'Intro Pack', 
      credits: 3, 
      price: 49, 
      currency: 'INR', 
      maxContacts: 100,
      benefits: ['100 contacts/sync', 'Lifetime Validity', 'Instant Activation']
    },
    { 
      id: 'personal_10', 
      name: 'Power Pack', 
      credits: 10, 
      price: 99, 
      currency: 'INR', 
      maxContacts: 500,
      benefits: ['500 contacts/sync', 'Lifetime Validity', 'Priority Support', 'Ad-free Experience']
    },
  ],
  institution: [
    { 
      id: 'institution_starter', name: 'Dept Starter', credits: 50, price: 199, currency: 'INR', 
      maxContacts: 2000,
      maxOrgs: 1,
      benefits: ['2,000 contacts/request', 'Admin Command Center', 'Team Member Management', 'Usage Analytics']
    },
    { 
      id: 'institution_unlimited', name: 'Enterprise', credits: 1000, price: 499, currency: 'INR', 
      maxContacts: 50000,
      maxOrgs: 9999, // Unlimited
      benefits: ['50,000 contacts/request', 'Unlimited Hubs/Teams', 'API Access', 'Dedicated Support Manager']
    },
  ],
};

export function getPlanById(planId) {
  const allPlans = [...PLANS.personal, ...PLANS.institution];
  return allPlans.find(p => p.id === planId) || null;
}
