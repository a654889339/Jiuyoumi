const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductHistory = sequelize.define('ProductHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changeType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'price, stock, status, info',
  },
  oldValue: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  newValue: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  operator: {
    type: DataTypes.STRING(100),
    defaultValue: 'admin',
  },
}, {
  tableName: 'product_histories',
  timestamps: true,
  updatedAt: false,
});

module.exports = ProductHistory;
