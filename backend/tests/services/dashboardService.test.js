const dashboardService = require('../../src/services/dashboardService');
const prisma = require('../../src/config/prisma');

jest.mock('../../src/config/prisma', () => ({
  lead: {
    count: jest.fn(),
    findMany: jest.fn()
  }
}));

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get operational dashboard stats', async () => {
    prisma.lead.count.mockResolvedValue(100);
    // Mock other prisma calls inside the service
    prisma.lead.findMany.mockResolvedValue([]);

    const result = await dashboardService.getOperationalDashboard();
    
    expect(result).toHaveProperty('stats');
    expect(result.stats.totalLeads).toBe(100);
    expect(result).toHaveProperty('charts');
  });
});
