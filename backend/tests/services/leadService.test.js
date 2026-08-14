const leadService = require('../../src/services/leadService');
const prisma = require('../../src/config/prisma');

jest.mock('../../src/config/prisma', () => ({
  lead: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  }
}));

describe('Lead Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeads', () => {
    it('should query leads with filters', async () => {
      prisma.lead.findMany.mockResolvedValue([]);
      await leadService.getLeads({ source: 'landing_page', status: 'NEW' });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'landing_page', status: 'NEW' })
        })
      );
    });
  });

  describe('bulkAssign', () => {
    it('should assign multiple leads', async () => {
      prisma.lead.updateMany.mockResolvedValue({ count: 2 });
      const result = await leadService.bulkAssign(['id1', 'id2'], 'user1');

      expect(prisma.lead.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['id1', 'id2'] } },
        data: { assignedToId: 'user1' }
      });
      expect(result.count).toBe(2);
    });
  });
});
