const leadService = require('../services/leadService');

exports.trackLead = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email là bắt buộc để ghi nhận tương tác.' });
    }

    const updatedLead = await leadService.trackLead(req.body);

    if (req.io) {
      req.io.emit('crm:lead_updated', updatedLead);
    }

    return res.json({ success: true, lead: updatedLead });
  } catch (err) {
    next(err);
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const leads = await leadService.getLeads(req.query);
    return res.json({ leads, total: leads.length });
  } catch (err) {
    next(err);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Tên và Email là bắt buộc.' });
    }
    const lead = await leadService.createLead(req.body, req.user?.userId);
    return res.status(201).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

exports.bulkAssign = async (req, res, next) => {
  try {
    const { leadIds, assignedToId } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Danh sách leadIds không hợp lệ.' });
    }

    await leadService.bulkAssign(leadIds, assignedToId);
    return res.json({ success: true, message: `Đã gán ${leadIds.length} lead cho nhân viên.` });
  } catch (err) {
    next(err);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Không tìm thấy Lead.' });

    // Static breakdown is purely derived for presentation
    const staticBreakdown = [];
    const product = (lead.productInterest || '').toLowerCase();
    if (product.includes('pro max') || product.includes('macbook pro')) staticBreakdown.push({ label: 'Sản phẩm flagship / Pro', points: 25 });
    else if (product.includes('iphone') || product.includes('macbook') || product.includes('ipad') || product.includes('mac')) staticBreakdown.push({ label: 'Sản phẩm tiêu chuẩn', points: 15 });
    else staticBreakdown.push({ label: 'Phụ kiện / Thiết bị khác', points: 5 });

    if (lead.budgetRange === '>30tr') staticBreakdown.push({ label: 'Ngân sách cao (>30tr)', points: 20 });
    else if (lead.budgetRange === '10-30tr') staticBreakdown.push({ label: 'Ngân sách trung (10-30tr)', points: 10 });

    if (lead.phone && lead.phone.trim().length >= 9) staticBreakdown.push({ label: 'Đã cung cấp SĐT hợp lệ', points: 10 });

    return res.json({ lead, staticBreakdown });
  } catch (err) {
    next(err);
  }
};

exports.addManualActivity = async (req, res, next) => {
  try {
    const userFullName = req.user?.fullName || req.user?.email;
    const lead = await leadService.addManualActivity(req.params.id, req.body, userFullName);
    return res.status(201).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { status, assignedToId, name, phone, productInterest, budgetRange } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (productInterest) updateData.productInterest = productInterest;
    if (budgetRange) updateData.budgetRange = budgetRange;

    const lead = await leadService.updateLead(req.params.id, updateData);
    return res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};
