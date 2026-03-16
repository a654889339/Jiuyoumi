#!/bin/bash
# 九柚米 - 检查运行状态

SSH_KEY="F:/ItsyourTurnMy/backend/deploy/test.pem"
SERVER="ubuntu@106.54.50.88"
SSH_OPTS="-o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -o StrictHostKeyChecking=no"

echo "=== 九柚米 容器状态 ==="
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker ps --filter name=jiuyoumi --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo "=== 健康检查 ==="
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "curl -s http://localhost:5102/api/health"
echo ""

echo ""
echo "=== Git 版本 ==="
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo git -C /root/Jiuyoumi log --oneline -3"

echo ""
echo "=== 后端日志 (最后20行) ==="
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker logs --tail 20 jiuyoumi-backend 2>&1"

echo ""
echo "=== 前端日志 (最后10行) ==="
ssh $SSH_OPTS -i "$SSH_KEY" $SERVER "sudo docker logs --tail 10 jiuyoumi-frontend 2>&1"
