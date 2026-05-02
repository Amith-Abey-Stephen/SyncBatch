import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import OrgLog from '@/lib/models/OrgLog';

/**
 * Deducts credits from either a user or an organization owner.
 * @param {string} userId - The user performing the action
 * @param {string} orgId - (Optional) The organization to deduct from
 * @param {Object} actionData - { action, method, contactsCount, details }
 * @returns {Object} { success, error, creditsRemaining }
 */
export async function deductCredits(userId, orgId = null, actionData = {}) {
  const user = await User.findById(userId);
  if (!user) return { success: false, error: 'User not found' };

  let targetUser = user;
  let organization = null;

  if (orgId) {
    organization = await Organization.findById(orgId);
    if (!organization) return { success: false, error: 'Organization not found' };
    
    // Check if user is a member
    const isMember = organization.members.includes(userId) || organization.ownerId.toString() === userId;
    if (!isMember) return { success: false, error: 'Not a member of this organization' };

    targetUser = await User.findById(organization.ownerId);
    if (!targetUser) return { success: false, error: 'Org owner not found' };
  }

  // Check credits
  const creditField = orgId ? 'orgCredits' : 'credits';
  if (targetUser[creditField] < 1) {
    return { success: false, error: `Insufficient ${orgId ? 'Organization' : 'Personal'} credits` };
  }

  // Deduct
  targetUser[creditField] -= 1;
  if (!targetUser.freeUsed && !orgId) targetUser.freeUsed = true;
  await targetUser.save();

  // Log if it's an organization action
  if (orgId) {
    await OrgLog.create({
      orgId,
      userId,
      userName: user.name,
      action: actionData.action || 'sync',
      method: actionData.method || 'google',
      contactsCount: actionData.contactsCount || 0,
      creditsUsed: 1,
      details: actionData.details || '',
    });
  }

  return { 
    success: true, 
    creditsRemaining: user.credits,
    orgCreditsRemaining: orgId ? targetUser.orgCredits : (user.orgId ? targetUser.orgCredits : 0) // This is a bit complex, but session will handle it better
  };
}
