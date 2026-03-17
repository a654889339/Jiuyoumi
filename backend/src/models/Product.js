const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  videos: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  mediaItems: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('mediaItems');
      try { return JSON.parse(raw || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('mediaItems', JSON.stringify(val || []));
    },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
