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
      id: 'institution_starter', name: 'Dept Starter', credits: 50, price: 499, currency: 'INR', 
      maxContacts: 2000,
      maxOrgs: 1,
      benefits: ['1 Organization Hub', '2000 contacts/request', 'Invite 50 Members', 'Shared Sync Requests']
    },
    { 
      id: 'institution_multi', name: 'Campus Multi', credits: 200, price: 1499, currency: 'INR', 
      maxContacts: 10000,
      maxOrgs: 5,
      benefits: ['5 Organization Hubs', '10,000 contacts/request', 'Unlimited Members', 'Priority Admin Support']
    },
    { 
      id: 'institution_unlimited', name: 'Enterprise Elite', credits: 1000, price: 4999, currency: 'INR', 
      maxContacts: 50000,
      maxOrgs: 9999, // Unlimited
      benefits: ['Unlimited Org Hubs', '50,000 contacts/request', 'Global Analytics', 'Dedicated Manager']
    },
  ],
};

export function getPlanById(planId) {
  const allPlans = [...PLANS.personal, ...PLANS.institution];
  return allPlans.find(p => p.id === planId) || null;
}
