#!/bin/bash
kubectl apply -f postgres.yaml
kubectl wait --for=condition=Ready pod -l app=postgres
kubectl apply -f redis.yaml
kubectl wait --for=condition=Ready pod -l app=redis
docker build -t crm-system .
kubectl apply -f server.yaml
kubectl wait --for=condition=Ready pod -l app=server
SERVER=$(kubectl get pods -l app=server -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $SERVER -- bash -c "npm run build && npm run typeorm:migration:create ./src/migrations/NewMigration"
kubectl exec -it $SERVER -- bash -c "npm run build"
kubectl exec -it $SERVER -- bash -c "npm run typeorm:migration:up"
# kubectl exec -it $SERVER -- bash -c "npm run start"
kubectl autoscale deployment server-deployment --cpu-percent=50 --min=1 --max=4