const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

const initializeSocketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    socket.join(`user_${userId}`);
    onlineUsers.set(userId, socket.id);

    console.log(`[SOCKET] User connected: ${userId}`);

    io.emit('onlineUsers', { count: onlineUsers.size });

    socket.on('joinRoom', (room) => {
      socket.join(room);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
    });

    socket.on('markNotificationRead', async (data) => {
      try {
        const Notification = require('../models/Notification');
        await Notification.findByIdAndUpdate(data.notificationId, { isRead: true });
        socket.emit('notificationRead', { id: data.notificationId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', { count: onlineUsers.size });
      console.log(`[SOCKET] User disconnected: ${userId}`);
    });

    socket.on('error', (err) => {
      console.error(`[SOCKET] Error for user ${userId}:`, err.message);
    });
  });

  return io;
};

module.exports = { initializeSocketHandler, onlineUsers };
