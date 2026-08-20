const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const getEffectiveRole = (baseRole, crmRoleHeader) => {
  if (crmRoleHeader) return crmRoleHeader.toUpperCase();
  if (!baseRole) return 'CUSTOMER';
  const roleStr = String(baseRole).toLowerCase();
  if (roleStr === 'customer') return 'CUSTOMER';
  if (roleStr === 'admin') return 'SUPER_ADMIN';
  if (roleStr === 'sales') return 'SALES';
  return String(baseRole).toUpperCase();
};

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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
      if (user && user.id && isUUID(user.id)) {
        const dbUser = await prisma.user.findUnique({ 
          where: { id: user.id },
          select: { id: true, email: true, role: true, status: true }
        });
        if (dbUser && (dbUser.status === 'BLOCKED' || dbUser.status === 'INACTIVE')) {
          return res.status(403).json({ error: 'Tài khoản của bạn đã bị khoá.' });
        }
      }
    } catch (dbErr) {
      console.warn('Warning checking user in auth middleware:', dbErr.message);
    }

    req.user = {
      ...user,
      role: getEffectiveRole(user?.role, crmRoleHeader)
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
      const dbUser = await prisma.user.findUnique({ 
        where: { id: user.id },
        select: { id: true, email: true, role: true, status: true }
      });
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
