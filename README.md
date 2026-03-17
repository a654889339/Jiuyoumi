# 九尤米 - 购物平台

全栈购物平台，包含网页前端、后端API、微信小程序和支付宝小程序。

## 技术栈

| 模块 | 技术 |
|------|------|
| 网页前端 | Vue 3 + Vite + Vant 4 + Pinia + Vue Router |
| 后端 | Node.js + Express + Sequelize + MySQL |
| 微信小程序 | 原生微信小程序 |
| 支付宝小程序 | 原生支付宝小程序 |
| 部署 | Docker + docker-compose |

## 端口配置

| 服务 | 端口 |
|------|------|
| 前端 | 5101 |
| 后端 | 5102 |
| MySQL | 3309 |

## 功能模块

- **首页**: 轮播Banner、快捷导航、热门商品、推荐区域
- **商品**: 分类浏览、搜索、商品详情、加入购物车、立即购买
- **订单**: 订单列表(多状态Tab)、订单详情、物流追踪(快递100 SDK)
- **我的**: 个人信息、订单统计、购物车、地址管理
- **购物车**: 增删改查、批量结算
- **地址管理**: CRUD、设置默认地址
- **物流追踪**: 快递100 API集成，自动查询物流进度

## 本地开发

```bash
# 后端
cd backend
npm install
npm run dev

# 前端
cd frontend
npm install
npm run dev
```

## Docker 部署

```bash
docker-compose up -d --build
```

## 更新发布

```bash
bash deploy/deploy.sh
```

发布流程:
1. 推送代码到 GitHub (`git push origin main`)
2. SSH 到服务器
3. 服务器 `git pull` 更新代码
4. 仅重新构建前后端容器（不重启 Docker 引擎、不重启 MySQL）
5. 由服务器编译发布

仅重启服务（不重新构建）:
```bash
bash deploy/restart-services.sh
```

## 环境变量

在 `.env` 文件中配置:

```
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=3309
DB_NAME=jiuyoumi_db
DB_USER=root
DB_PASSWORD=jiuyoumi_secret_2024
KUAIDI100_KEY=your_kuaidi100_key
KUAIDI100_CUSTOMER=your_kuaidi100_customer
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
ALIPAY_APPID=your_alipay_appid
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
```
