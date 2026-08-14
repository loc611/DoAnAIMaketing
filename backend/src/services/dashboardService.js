const prisma = require('../config/prisma');

// Helper to normalize roles
const normalizeRole = (role) => {
  if (!role) return 'OTHER';
  const u = role.toUpperCase();
  if (u === 'SUPER_ADMIN' || u === 'ADMIN' || u === 'CEO') return 'SUPER_ADMIN';
  if (u === 'MANAGER' || u === 'QUAN_LY') return 'MANAGER';
  if (u === 'SALES' || u === 'SALES_STAFF') return 'SALES';
  return 'OTHER';
};

async function getOperationalDashboard() {
  const totalLeads = await prisma.lead.count();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newLeadsLast7Days = await prisma.lead.count({
    where: { createdAt: { gte: sevenDaysAgo } }
  });

  const wonCount = await prisma.lead.count({ where: { status: 'WON' } });
  const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0';

  const leadsList = await prisma.lead.findMany({
    select: { createdAt: true, source: true, status: true, temperature: true }
  });

  const leadsByDateMap = {};
  leadsList.forEach(l => {
    const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';
    leadsByDateMap[dateStr] = (leadsByDateMap[dateStr] || 0) + 1;
  });

  const timeSeriesChart = Object.keys(leadsByDateMap).slice(-7).map(date => ({
    date,
    leads: leadsByDateMap[date]
  }));

  const sourceMap = {};
  leadsList.forEach(l => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });
  const sourceChart = Object.keys(sourceMap).map(source => ({
    source,
    count: sourceMap[source]
  }));

  const followUpToday = await prisma.lead.findMany({
    where: {
      temperature: 'HOT',
      status: { in: ['NEW', 'CONTACTED'] }
    },
    include: {
      assignedTo: { select: { fullName: true, email: true } }
    },
    take: 10,
    orderBy: { updatedAt: 'desc' }
  });

  return {
    stats: {
      totalLeads,
      newLeadsLast7Days,
      conversionRate: `${conversionRate}%`,
      wonDealsCount: wonCount
    },
    charts: {
      timeSeriesChart,
      sourceChart
    },
    followUpToday
  };
}

async function getExecutiveDashboard() {
  const totalLeads = await prisma.lead.count();
  const wonCount = await prisma.lead.count({ where: { status: 'WON' } });
  const hotCount = await prisma.lead.count({ where: { temperature: 'HOT' } });
  const warmCount = await prisma.lead.count({ where: { temperature: 'WARM' } });
  const coldCount = await prisma.lead.count({ where: { temperature: 'COLD' } });

  const estimatedRevenue = wonCount * 35000000;
  const overallConversion = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0';

  const temperatureDistribution = [
    { name: 'HOT', count: hotCount, percentage: totalLeads > 0 ? ((hotCount / totalLeads) * 100).toFixed(1) : 0 },
    { name: 'WARM', count: warmCount, percentage: totalLeads > 0 ? ((warmCount / totalLeads) * 100).toFixed(1) : 0 },
    { name: 'COLD', count: coldCount, percentage: totalLeads > 0 ? ((coldCount / totalLeads) * 100).toFixed(1) : 0 }
  ];

  const newCount = await prisma.lead.count({ where: { status: 'NEW' } });
  const contactedCount = await prisma.lead.count({ where: { status: 'CONTACTED' } });
  const qualifiedCount = await prisma.lead.count({ where: { status: 'QUALIFIED' } });

  const funnelData = [
    { stage: 'Mới (New)', count: newCount },
    { stage: 'Đã liên hệ', count: contactedCount },
    { stage: 'Tiềm năng (Qualified)', count: qualifiedCount },
    { stage: 'Thành công (Won)', count: wonCount }
  ];

  const allLeads = await prisma.lead.findMany({ select: { productInterest: true } });
  const prodMap = {};
  allLeads.forEach(l => {
    prodMap[l.productInterest] = (prodMap[l.productInterest] || 0) + 1;
  });

  const topProducts = Object.keys(prodMap)
    .map(name => ({ name, count: prodMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const salesUsers = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      assignedLeads: { select: { id: true, status: true, budgetRange: true } }
    }
  });

  const salesLeaderboard = salesUsers
    .map(u => {
      const totalAssigned = u.assignedLeads.length;
      const wonLeads = u.assignedLeads.filter(l => l.status === 'WON').length;
      const revenue = wonLeads * 35000000;
      return {
        id: u.id,
        name: u.fullName || u.email,
        role: normalizeRole(u.role),
        totalAssigned,
        wonLeads,
        revenue,
        conversionRate: totalAssigned > 0 ? ((wonLeads / totalAssigned) * 100).toFixed(1) : '0'
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const budgetHigh = await prisma.lead.count({ where: { budgetRange: '>30tr' } });
  const budgetMid = await prisma.lead.count({ where: { budgetRange: '10-30tr' } });
  const budgetLow = await prisma.lead.count({ where: { budgetRange: '<10tr' } });

  const pipelineForecast = [
    { category: 'Phân khúc cao (>30tr)', count: budgetHigh, estimatedValue: budgetHigh * 40000000 },
    { category: 'Phân khúc trung (10-30tr)', count: budgetMid, estimatedValue: budgetMid * 20000000 },
    { category: 'Phân khúc tiêu chuẩn (<10tr)', count: budgetLow, estimatedValue: budgetLow * 7000000 }
  ];

  return {
    stats: {
      estimatedRevenue,
      overallConversionRate: `${overallConversion}%`,
      hotLeadsCount: hotCount,
      averageCAC: '450,000 VNĐ'
    },
    temperatureDistribution,
    funnelData,
    topProducts,
    salesLeaderboard,
    pipelineForecast
  };
}

module.exports = {
  getOperationalDashboard,
  getExecutiveDashboard,
  normalizeRole
};
