const jwt = require('jsonwebtoken');
const { prisma } = require('../models/db.service');

const getEffectiveRole = (baseRole, crmRoleHeader) => {
  if (crmRoleHeader) return crmRoleHeader.toUpperCase();
  if (!baseRole) return 'CUSTOMER';
  const roleStr = String(baseRole).toLowerCase();
  if (roleStr === 'customer') return 'CUSTOMER';
  if (roleStr === 'admin') return 'SUPER_ADMIN';
  if (roleStr === 'sales') return 'SALES';
  return String(baseRole).toUpperCase();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const crmRoleHeader = req.headers['x-crm-role'];

  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token xác thực.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'apple_secret_key', async (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' });
    }

    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) {
        return res.status(401).json({ error: 'Tài khoản không tồn tại. Vui lòng đăng nhập lại.' });
      }
    } catch (dbErr) {
      console.error('Error checking user in auth middleware:', dbErr);
      return res.status(500).json({ error: 'Lỗi server khi xác thực tài khoản.' });
    }

    req.user = {
      ...user,
      role: getEffectiveRole(user.role, crmRoleHeader)
    };
    next();
  });
};

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const crmRoleHeader = req.headers['x-crm-role'];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'apple_secret_key', async (err, user) => {
    if (err) {
      return next();
    }

    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser) {
        req.user = {
          ...user,
          role: getEffectiveRole(user.role, crmRoleHeader)
        };
      }
    } catch (dbErr) {
      console.error('Error checking optional user:', dbErr);
    }
    
    next();
  });
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Không thể xác thực quyền truy cập.' });
    }

    const userRole = req.user.role.toUpperCase();

    const isAllowed = allowedRoles.some(r => {
      const upperR = r.toUpperCase();
      return upperR === userRole || (upperR === 'ADMIN' && userRole === 'SUPER_ADMIN') || (upperR === 'SALES' && userRole === 'SALES');
    });

    if (!isAllowed) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này.' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  checkRole
};
