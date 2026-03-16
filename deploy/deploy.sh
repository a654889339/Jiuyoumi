#!/bin/bash
# 九柚米 - 部署脚本
# 流程: git push -> SSH到服务器 -> git pull -> 仅重启前后端服务（不重启docker和mysql）
# 服务器编译发布

set -e

# ========= 配置区 =========
SSH_KEY="F:/ItsyourTurnMy/backend/deploy/test.pem"
SERVER="ubuntu@106.54.50.88"
SSH_OPTS="-o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -o StrictHostKeyChecking=no"
REMOTE_PATH="/root/Jiuyoumi"
GIT_REPO="https://github.com/a654889339/Jiuyoumi.git"
GITHUB_MIRROR="https://ghfast.top/${GIT_REPO}"
# ==========================

echo "========================================="
echo "  九柚米 - 部署到服务器"
echo "  前端: 5101  后端: 5102  MySQL: 3309"
echo "========================================="

# [1/4] 推送代码到 GitHub
echo "[1/4] 推送代码到GitHub..."
git push origin main

# [2/4] 服务器拉取最新代码
echo "[2/4] 服务器拉取最新代码..."
REPO_EXISTS=$(ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo test -d $REMOTE_PATH/.git && echo yes || echo no")

if [ "$REPO_EXISTS" = "yes" ]; then
    echo "  -> git pull (更新已有代码)"
    ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo git -C $REMOTE_PATH pull"
else
    echo "  -> git clone (首次部署)"
    ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo bash -c 'cd /root && git clone $GITHUB_MIRROR Jiuyoumi'"
    ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo git -C $REMOTE_PATH remote set-url origin $GITHUB_MIRROR"
fi

# [3/4] 仅重启前后端服务（不重启docker引擎、不重启mysql）
echo "[3/4] 重新构建并重启前后端服务（保持MySQL不动）..."
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo bash -c 'cd $REMOTE_PATH && docker-compose up -d --build --no-deps jiuyoumi-frontend jiuyoumi-backend'"

# [4/4] 检查容器状态
echo "[4/4] 检查容器状态..."
sleep 8
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker ps --filter name=jiuyoumi --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo "========================================="
echo "  部署完成!"
echo "  前端: http://106.54.50.88:5101"
echo "  后端: http://106.54.50.88:5102/api/health"
echo "========================================="
