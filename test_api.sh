#!/bin/bash

echo "=== Probando TradeOptix API ==="

echo "1. Health Check:"
curl -s -X GET http://localhost:8080/health | jq '.' || curl -s -X GET http://localhost:8080/health

echo -e "\n2. Registro de Usuario:"
curl -s -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "test@example.com",
    "password": "password123",
    "phone_number": "1234567890",
    "document_type": "cedula",
    "document_number": "123456789",
    "address": "Test Address 123 Main Street"
  }' | jq '.' || curl -s -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "test@example.com",
    "password": "password123",
    "phone_number": "1234567890",
    "document_type": "cedula",
    "document_number": "123456789",
    "address": "Test Address 123 Main Street"
  }'