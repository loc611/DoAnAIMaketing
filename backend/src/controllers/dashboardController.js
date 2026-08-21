const dashboardService = require('../services/dashboardService');

exports.getOperationalDashboard = async (req, res, next) => {
  try {
    const days = req.query.days ? (req.query.days === 'all' ? 365 : parseInt(req.query.days, 10)) : 7;
    const data = await dashboardService.getOperationalDashboard({ days });
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getExecutiveDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getExecutiveDashboard();
    return res.json(data);
  } catch (err) {
    next(err);
  }
};
