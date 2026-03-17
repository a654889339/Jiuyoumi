const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const ProductCategory = require('./ProductCategory');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Address = require('./Address');
const Cart = require('./Cart');
const HomeConfig = require('./HomeConfig');
const Message = require('./Message');
const ProductHistory = require('./ProductHistory');
const ProductFavorite = require('./ProductFavorite');

User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ProductCategory.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(ProductCategory, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(ProductHistory, { foreignKey: 'productId', as: 'histories' });
ProductHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(ProductFavorite, { foreignKey: 'productId', as: 'favorites' });
ProductFavorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(ProductFavorite, { foreignKey: 'userId', as: 'favorites' });
ProductFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const models = { User, Product, ProductCategory, Order, OrderItem, Address, Cart, HomeConfig, Message, ProductHistory, ProductFavorite };

const ADMIN_PASSWORD = 'Jiuyoumi@2024admin';

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('[DB] All models synchronized.');

    const admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      await User.create({
        username: 'admin',
        email: 'admin@jiuyoumi.com',
        password: ADMIN_PASSWORD,
        nickname: '管理员',
        role: 'admin',
      });
      console.log('[DB] Default admin account created.');
    }

    const catCount = await ProductCategory.count();
    if (catCount === 0) {
      await ProductCategory.bulkCreate([
        { name: '热门推荐', sortOrder: 1 },
        { name: '新品上市', sortOrder: 2 },
        { name: '限时特惠', sortOrder: 3 },
      ]);
      console.log('[DB] Default product categories created.');
    }

    const hcCount = await HomeConfig.count();
    if (hcCount === 0) {
      await HomeConfig.bulkCreate([
        { section: 'banner', title: '九尤米 品质生活', desc: '精选好物，品质保障', color: 'linear-gradient(135deg, #667eea, #764ba2)', sortOrder: 1 },
        { section: 'banner', title: '新人专享', desc: '首单立减20元', color: 'linear-gradient(135deg, #f093fb, #f5576c)', sortOrder: 2 },
        { section: 'nav', title: '全部商品', icon: 'apps-o', path: '/products', color: '#667eea', sortOrder: 1 },
        { section: 'nav', title: '新品', icon: 'fire-o', path: '/products?cat=new', color: '#f5576c', sortOrder: 2 },
        { section: 'nav', title: '特惠', icon: 'coupon-o', path: '/products?cat=sale', color: '#fda085', sortOrder: 3 },
        { section: 'nav', title: '订单', icon: 'bill-o', path: '/orders', color: '#a18cd1', sortOrder: 4 },
        { section: 'tabbar', title: '首页', icon: 'wap-home-o', path: '/', sortOrder: 1 },
        { section: 'tabbar', title: '商品', icon: 'shopping-cart-o', path: '/products', sortOrder: 2 },
        { section: 'tabbar', title: '订单', icon: 'bill-o', path: '/orders', sortOrder: 3 },
        { section: 'tabbar', title: '我的', icon: 'contact-o', path: '/mine', sortOrder: 4 },
      ]);
      console.log('[DB] Default home configs created.');
    }

    return true;
  } catch (error) {
    console.error('[DB] Unable to connect:', error.message);
    return false;
  }
};

module.exports = { ...models, sequelize, syncDatabase };
