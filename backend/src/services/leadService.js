const prisma = require('../config/prisma');
const { calculateLeadScore } = require('./crmScoring');

async function trackLead(data) {
  const { email, name, phone, productInterest, activityType, metadata } = data;

  let lead = await prisma.lead.findFirst({
    where: { email: email.toLowerCase().trim() }
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        phone: phone || null,
        productInterest: productInterest || 'iPhone 17 Pro Max',
        budgetRange: '>30tr',
        source: 'landing_page',
        status: 'NEW',
        temperature: 'COLD'
      }
    });
  }

  // Determine scoreDelta loosely here, real calc in calculateLeadScore
  let scoreDelta = 10;
  if (activityType === 'form_submit') scoreDelta = 20;
  if (activityType === 'add_to_cart') scoreDelta = 15;
  if (activityType === 'click_call' || activityType === 'click_chat') scoreDelta = 25;

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: activityType || 'view_product',
      scoreDelta: scoreDelta,
      metadata: metadata || {}
    }
  });

  return calculateLeadScore(lead.id);
}

async function getLeads(filters) {
  const { source, status, temperature, assignedToId, search } = filters;
  const where = {};
  if (source) where.source = source;
  if (status) where.status = status;
  if (temperature) where.temperature = temperature;
  if (assignedToId) where.assignedToId = assignedToId === 'unassigned' ? null : assignedToId;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true, role: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 5 }
    },
    orderBy: { createdAt: 'desc' }
  });

  return leads;
}

async function createLead(data, currentUserId) {
  const { name, email, phone, productInterest, budgetRange, source, assignedToId } = data;
  const newLead = await prisma.lead.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      productInterest: productInterest || 'iPhone 17 Pro Max',
      budgetRange: budgetRange || '10-30tr',
      source: source || 'form',
      assignedToId: assignedToId || currentUserId || null,
      status: 'NEW',
      temperature: 'COLD'
    }
  });

  return calculateLeadScore(newLead.id);
}

async function bulkAssign(leadIds, assignedToId) {
  return prisma.lead.updateMany({
    where: { id: { in: leadIds } },
    data: { assignedToId: assignedToId || null }
  });
}

async function getLeadById(id) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true, role: true } },
      activities: { orderBy: { createdAt: 'desc' } }
    }
  });
  return lead;
}

async function addManualActivity(leadId, activityData, userFullName) {
  const { activityType, note, scoreDelta } = activityData;

  let delta = scoreDelta || 0;
  if (activityType === 'phone_call') delta = 15;
  else if (activityType === 'meeting') delta = 20;
  else if (activityType === 'email_sent') delta = 10;
  else if (activityType === 'note') delta = 0;

  await prisma.leadActivity.create({
    data: {
      leadId,
      activityType: activityType || 'note',
      scoreDelta: delta,
      metadata: {
        note: note || '',
        createdBy: userFullName || 'Sales Staff'
      }
    }
  });

  return calculateLeadScore(leadId);
}

async function updateLead(leadId, updateData) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: updateData
  });
  
  if (updateData.productInterest || updateData.budgetRange) {
    return calculateLeadScore(lead.id);
  }
  return lead;
}

module.exports = {
  trackLead,
  getLeads,
  createLead,
  bulkAssign,
  getLeadById,
  addManualActivity,
  updateLead
};
