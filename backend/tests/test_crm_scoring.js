const prisma = require('../src/config/prisma');
const { calculateLeadScore } = require('../src/services/crmScoring');

async function testScoring() {
  console.log('🧪 Testing Lead Scoring Engine...');

  // 1. Find or create a test lead
  let lead = await prisma.lead.findFirst({
    where: { email: 'test_score_lead@gmail.com' }
  });

  if (lead) {
    await prisma.leadActivity.deleteMany({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
  }

  lead = await prisma.lead.create({
    data: {
      name: 'Test Lead Pro',
      email: 'test_score_lead@gmail.com',
      phone: '0912345678',
      productInterest: 'iPhone 17 Pro Max 256GB',
      budgetRange: '>30tr',
      source: 'landing_page',
      status: 'NEW',
      temperature: 'COLD'
    }
  });

  console.log('Initial Lead Created:', { id: lead.id, name: lead.name, initialScore: lead.score });

  // Add form_submit activity (+20) and click_call activity (+25)
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: 'form_submit',
      scoreDelta: 20
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: 'click_call',
      scoreDelta: 25
    }
  });

  // Calculate score
  const updatedLead = await calculateLeadScore(lead.id);
  console.log('Scored Lead Results:', {
    score: updatedLead.score,
    temperature: updatedLead.temperature
  });

  if (updatedLead.temperature === 'HOT' && updatedLead.score >= 70) {
    console.log('✅ TEST PASSED: Lead correctly scored as HOT with score >= 70!');
  } else {
    console.error('❌ TEST FAILED: Temperature calculation mismatch.');
  }

  // Cleanup
  await prisma.leadActivity.deleteMany({ where: { leadId: lead.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
}

testScoring()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
