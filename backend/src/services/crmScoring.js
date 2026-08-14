const prisma = require('../config/prisma');
const rules = require('../config/scoringRules');

/**
 * Lead Scoring Engine
 * Calculates static + dynamic score for a lead and updates score & temperature atomically.
 * @param {string} leadId 
 */
async function calculateLeadScore(leadId) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { activities: true }
  });

  if (!lead) return null;

  // 1. Static Points Calculation
  let staticScore = 0;
  const product = (lead.productInterest || '').toLowerCase();
  
  if (product.includes('pro max') || product.includes('macbook pro')) {
    staticScore += rules.STATIC_POINTS.PRO_MAX;
  } else if (product.includes('iphone') || product.includes('macbook') || product.includes('ipad') || product.includes('mac')) {
    staticScore += rules.STATIC_POINTS.STANDARD;
  } else if (product.includes('airpods') || product.includes('phụ kiện') || product.includes('accessory') || product.includes('watch')) {
    staticScore += rules.STATIC_POINTS.ACCESSORY;
  } else {
    staticScore += rules.STATIC_POINTS.OTHER;
  }

  if (lead.budgetRange === '>30tr') {
    staticScore += rules.STATIC_POINTS.BUDGET_HIGH;
  } else if (lead.budgetRange === '10-30tr') {
    staticScore += rules.STATIC_POINTS.BUDGET_MID;
  }

  if (lead.phone && lead.phone.trim().length >= 9) {
    staticScore += rules.STATIC_POINTS.VALID_PHONE;
  }

  // 2. Dynamic Points Calculation
  let dynamicScore = 0;
  const activities = lead.activities || [];
  let viewProductCount = 0;

  activities.forEach(act => {
    switch (act.activityType) {
      case 'form_submit':
        dynamicScore += rules.DYNAMIC_POINTS.FORM_SUBMIT;
        break;
      case 'view_product':
        viewProductCount++;
        break;
      case 'add_to_cart':
        dynamicScore += rules.DYNAMIC_POINTS.ADD_TO_CART;
        break;
      case 'click_call':
      case 'click_chat':
        dynamicScore += rules.DYNAMIC_POINTS.CLICK_CONTACT;
        break;
      case 'inactive_decay':
        dynamicScore += rules.DYNAMIC_POINTS.INACTIVE_DECAY;
        break;
      default:
        dynamicScore += act.scoreDelta || 0;
    }
  });

  if (viewProductCount >= 2) {
    dynamicScore += rules.DYNAMIC_POINTS.MULTI_VIEW;
  }

  // Check 7-day inactivity decay
  if (activities.length > 0) {
    const lastActivity = activities.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    }, activities[0]);

    const daysSinceLastActivity = (new Date() - new Date(lastActivity.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity > 7) {
      dynamicScore += rules.DYNAMIC_POINTS.INACTIVE_DECAY;
    }
  }

  const totalScore = Math.max(0, staticScore + dynamicScore);

  // 3. Determine Temperature
  let temperature = 'COLD';
  if (totalScore >= rules.THRESHOLDS.HOT) {
    temperature = 'HOT';
  } else if (totalScore >= rules.THRESHOLDS.WARM) {
    temperature = 'WARM';
  }

  // 4. Update lead score and temperature in transaction
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      score: totalScore,
      temperature: temperature
    }
  });

  return updatedLead;
}

module.exports = {
  calculateLeadScore
};
