const Department = require('../models/Department');
const User = require('../models/User');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('officers', 'name email phone');
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

const getFieldWorkers = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const query = { role: 'worker' };
    if (departmentId) query.department = departmentId;

    const workers = await User.find(query).select('name email phone department profileImage');
    res.json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getFieldWorkers
};
