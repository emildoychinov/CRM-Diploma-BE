#!/bin/bash
kubectl scale deployment server-deployment --replicas=0
kubectl scale statefulset redis-statefulset --replicas=0
kubectl scale statefulset postgres-statefulset --replicas=0
sleep 20s
kubectl delete hpa server-deployment