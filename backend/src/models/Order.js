const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  contactName: {
    type: DataTypes.STRING(50),
    defaultValue: '',
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  remark: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  trackingCompany: {
    type: DataTypes.STRING(100),
    defaultValue: '',
  },
  trackingNo: {
    type: DataTypes.STRING(100),
    defaultValue: '',
  },
  trackingInfo: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  trackingLastUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  adminRemark: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['orderNo'], name: 'orderNo' },
  ],
});

module.exports = Order;
