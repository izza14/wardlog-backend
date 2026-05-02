const Notice = require('../models/Notice');
const User = require('../models/User');

exports.getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().populate('author', 'name').sort({ date: -1 });
    res.status(200).json({ success: true, data: notices, message: 'Notices retrieved' });
  } catch (error) {
    next(error);
  }
};

exports.createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, author: req.user.id });
    res.status(201).json({ success: true, data: notice, message: 'Notice posted successfully' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, data: null, message: 'Notice not found' });
    
    res.status(200).json({ success: true, data: null, message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};