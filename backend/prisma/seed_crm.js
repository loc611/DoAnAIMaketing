const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting CRM database seeding...');

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const salesHash = await bcrypt.hash('Sales123!', 10);
  const viewerHash = await bcrypt.hash('Viewer123!', 10);

  // 1. Create default users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apple.crm' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      fullName: 'Super Admin CRM',
      email: 'admin@apple.crm',
      passwordHash: passwordHash,
      phone: '0901234567',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@apple.crm' },
    update: { role: 'SALES' },
    create: {
      fullName: 'Chuyên Viên Sales',
      email: 'sales@apple.crm',
      passwordHash: salesHash,
      phone: '0908888999',
      role: 'SALES',
      status: 'ACTIVE'
    }
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@apple.crm' },
    update: { role: 'VIEWER' },
    create: {
      fullName: 'Người Xem (Auditor)',
      email: 'viewer@apple.crm',
      passwordHash: viewerHash,
      phone: '0905555666',
      role: 'VIEWER',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created 3 CRM Users:', { admin: adminUser.email, sales: salesUser.email, viewer: viewerUser.email });

  // 2. Sample products & sources
  const products = [
    'iPhone 17 Pro Max 256GB',
    'MacBook Pro 14 M3 Max',
    'iPad Pro 11 M2',
    'AirPods Max Space Gray',
    'Apple Watch Ultra 2',
    'iPhone 16 Pro 128GB',
    'MacBook Air 15 M3'
  ];

  const sources = ['landing_page', 'ads', 'referral', 'form'];
  const budgets = ['>30tr', '10-30tr', '<10tr'];
  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];
  const assignedIds = [salesUser.id, adminUser.id, null];

  // Clear existing sample leads if any
  await prisma.leadActivity.deleteMany({});
  await prisma.lead.deleteMany({});

  console.log('🧹 Cleared existing CRM leads data.');

  // Create 35 leads
  const sampleLeads = [];
  for (let i = 1; i <= 35; i++) {
    const product = products[i % products.length];
    const budget = budgets[i % budgets.length];
    const source = sources[i % sources.length];
    const status = statuses[i % statuses.length];
    const assignedToId = assignedIds[i % assignedIds.length];

    let staticScore = 0;
    if (product.includes('Pro Max') || product.includes('MacBook Pro')) staticScore += 25;
    else if (product.includes('iPhone') || product.includes('MacBook') || product.includes('iPad')) staticScore += 15;
    else staticScore += 5;

    if (budget === '>30tr') staticScore += 20;
    else if (budget === '10-30tr') staticScore += 10;

    staticScore += 10; // phone score

    const lead = await prisma.lead.create({
      data: {
        name: `Khách Hàng Sample ${i}`,
        email: `customer${i}@gmail.com`,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        productInterest: product,
        budgetRange: budget,
        source: source,
        status: status,
        assignedToId: assignedToId,
        score: staticScore,
        temperature: staticScore >= 40 ? (staticScore >= 70 ? 'HOT' : 'WARM') : 'COLD'
      }
    });

    // Add activities
    const numActivities = Math.floor(Math.random() * 4) + 1;
    let actScoreSum = 0;

    for (let a = 0; a < numActivities; a++) {
      const actTypes = ['view_product', 'add_to_cart', 'click_call', 'form_submit', 'click_chat'];
      const actType = actTypes[Math.floor(Math.random() * actTypes.length)];
      let delta = 10;
      if (actType === 'form_submit') delta = 20;
      if (actType === 'add_to_cart') delta = 15;
      if (actType === 'click_call' || actType === 'click_chat') delta = 25;

      actScoreSum += delta;

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          activityType: actType,
          scoreDelta: delta,
          metadata: { page: `/product/${product.toLowerCase().replace(/ /g, '-')}` }
        }
      });
    }

    // Final recompute for lead score
    const finalScore = staticScore + actScoreSum;
    const finalTemp = finalScore >= 70 ? 'HOT' : finalScore >= 40 ? 'WARM' : 'COLD';

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        score: finalScore,
        temperature: finalTemp
      }
    });

    sampleLeads.push(lead);
  }

  console.log(`🎉 Successfully seeded ${sampleLeads.length} CRM Leads & Activities!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding CRM:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
