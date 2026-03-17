const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductFavorite = sequelize.define('ProductFavorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'product_favorites',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['userId', 'productId'], name: 'user_product_fav' },
  ],
});

module.exports = ProductFavorite;
