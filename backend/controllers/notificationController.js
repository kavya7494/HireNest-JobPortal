const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const filter = { user: req.user.id };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('relatedJob', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.id, isRead: false }),
    ]);

    sendPaginated(res, 200, 'Notifications retrieved', notifications, page, limit, total);
    res.locals.unreadCount = unreadCount;
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    sendSuccess(res, 200, 'Unread count retrieved', { unreadCount: count });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('Notification not found.', 404));
    }

    sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!notification) {
      return next(new AppError('Notification not found.', 404));
    }

    sendSuccess(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
