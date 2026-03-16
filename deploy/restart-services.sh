#!/bin/bash
# 九柚米 - 仅重启前后端服务（不重启docker、不重启mysql）
# 用于快速重启而不需要重新构建

SSH_KEY="F:/ItsyourTurnMy/backend/deploy/test.pem"
SERVER="ubuntu@106.54.50.88"
SSH_OPTS="-o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -o StrictHostKeyChecking=no"
REMOTE_PATH="/root/Jiuyoumi"

echo "=== 仅重启前后端服务 ==="
echo "注意: MySQL 不会被重启"

echo "[1/3] 重启后端..."
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker restart jiuyoumi-backend"

echo "[2/3] 重启前端..."
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker restart jiuyoumi-frontend"

echo "[3/3] 检查状态..."
sleep 5
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker ps --filter name=jiuyoumi --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo "=== 重启完成 ==="
