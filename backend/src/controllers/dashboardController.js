const dashboardService = require('../services/dashboardService');

exports.getOperationalDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getOperationalDashboard();
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
