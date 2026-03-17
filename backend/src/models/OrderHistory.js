const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderHistory = sequelize.define('OrderHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldStatus: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  newStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  operatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(200),
    defaultValue: '',
  },
}, {
  tableName: 'order_histories',
  timestamps: true,
  updatedAt: false,
});

module.exports = OrderHistory;
