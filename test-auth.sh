#!/bin/bash

# Test script for authentication endpoints
# Make sure your server is running on port 5000

echo "=== Testing Authentication API ==="
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s http://localhost:5000/api/health | jq '.' || echo "Response received"
echo ""
echo ""

# Test 2: Signup
echo "2. Testing signup endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "confirmPassword": "test123"
  }')

echo "$SIGNUP_RESPONSE" | jq '.' || echo "$SIGNUP_RESPONSE"
echo ""
echo ""

# Extract token from signup response (if jq is available)
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token' 2>/dev/null)

# Test 3: Login
echo "3. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"
echo ""
echo ""

# Test 4: Try signup with existing email (should fail)
echo "4. Testing signup with existing email (should fail)..."
curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User 2",
    "email": "test@example.com",
    "password": "test123",
    "confirmPassword": "test123"
  }' | jq '.' || echo "Response received"
echo ""
echo ""

# Test 5: Try login with wrong password (should fail)
echo "5. Testing login with wrong password (should fail)..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }' | jq '.' || echo "Response received"
echo ""
echo ""

echo "=== Testing Complete ==="

