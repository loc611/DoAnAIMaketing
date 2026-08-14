const userService = require('../services/userService');

exports.getUsers = async (req, res, next) => {
  try {
    const data = await userService.getUsers();
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Họ tên, Email và Mật khẩu là bắt buộc.' });
    }
    const user = await userService.createUser(req.body);
    return res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.message === 'Email này đã được sử dụng.') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.json({ success: true, message: 'Đã xoá tài khoản và huỷ gán các lead liên quan.' });
  } catch (err) {
    next(err);
  }
};

exports.updatePermissionMatrix = async (req, res, next) => {
  try {
    const { permissionMatrix } = req.body;
    if (Array.isArray(permissionMatrix)) {
      await userService.updatePermissionMatrix(permissionMatrix);
    }
    return res.json({ success: true, permissionMatrix });
  } catch (err) {
    next(err);
  }
};
