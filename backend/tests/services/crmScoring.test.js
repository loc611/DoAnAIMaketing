const { calculateLeadScore } = require('../../src/services/crmScoring');
const prisma = require('../../src/config/prisma');

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
  lead: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
}));

describe('Lead Scoring Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if lead is not found', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    const result = await calculateLeadScore('lead-1');
    expect(result).toBeNull();
  });

  it('should calculate HOT temperature for a high budget pro max lead', async () => {
    const mockLead = {
      id: 'lead-1',
      productInterest: 'iphone 17 pro max',
      budgetRange: '>30tr',
      phone: '0901234567',
      activities: [
        { activityType: 'form_submit', scoreDelta: 0 },
        { activityType: 'click_call', scoreDelta: 0 }
      ]
    };
    // Expected static: Pro max(25) + >30tr(20) + Phone(10) = 55
    // Expected dynamic: form_submit(20) + click_call(25) = 45
    // Total: 100 -> HOT (>=70)
    
    prisma.lead.findUnique.mockResolvedValue(mockLead);
    prisma.lead.update.mockResolvedValue({ id: 'lead-1', score: 100, temperature: 'HOT' });

    const updatedLead = await calculateLeadScore('lead-1');

    expect(prisma.lead.update).toHaveBeenCalledWith({
      where: { id: 'lead-1' },
      data: { score: 100, temperature: 'HOT' }
    });
    expect(updatedLead.temperature).toBe('HOT');
  });

  it('should apply inactive decay and reduce score', async () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const mockLead = {
      id: 'lead-2',
      productInterest: 'phụ kiện', // 5
      budgetRange: '10-30tr', // 10
      phone: null,
      activities: [
        { activityType: 'view_product', scoreDelta: 0, createdAt: tenDaysAgo.toISOString() }
      ]
    };
    // Expected static: 15
    // Expected dynamic: view_product(0) + decay(-10) = -10
    // Total: 5 (>=0 max applied) -> COLD
    
    prisma.lead.findUnique.mockResolvedValue(mockLead);
    prisma.lead.update.mockResolvedValue({ id: 'lead-2', score: 5, temperature: 'COLD' });

    await calculateLeadScore('lead-2');

    expect(prisma.lead.update).toHaveBeenCalledWith({
      where: { id: 'lead-2' },
      data: { score: 5, temperature: 'COLD' }
    });
  });
});
