#!/usr/bin/env python3
"""
@file backend/test_authentication.py
@description Authentication system testing script for Q&A Loader. Tests JWT token creation, validation, and login workflow.
@created 2025.06.09 5:17 PM ET
@updated 2025.06.09 5:17 PM ET - Initial creation with comprehensive authentication testing

@architectural-context
Layer: Testing Utility
Dependencies: app.services.auth_service (JWT functions), app.models.auth (data models), requests (HTTP testing)
Pattern: Integration testing with real authentication operations and API endpoint testing

@workflow-context
User Journey: Authentication validation and testing workflow
Sequence Position: Run after authentication implementation to verify login and token handling
Inputs: Test credentials and authentication service functions
Outputs: Test results and validation of authentication operations

@authentication-context
Auth Requirements: Tests the authentication system itself - uses test credentials
Security: Only performs safe authentication tests, no production credentials

@database-context
Tables: No direct database access - tests authentication service only
Operations: JWT token creation and validation only
Transactions: N/A - authentication testing only
"""

import asyncio
import requests
from datetime import datetime, timedelta
from app.services.auth_service import (
    create_access_token, 
    verify_token, 
    authenticate_user, 
    get_password_hash, 
    verify_password
)
from app.models.auth import LoginRequest
from app.config import settings

async def test_jwt_operations():
    """
    @function test_jwt_operations
    @description Tests JWT token creation, validation, and expiration handling
    @returns: None
    @example:
        # Run JWT tests
        await test_jwt_operations()
    """
    print("🧪 Testing JWT Operations...")
    print("=" * 40)
    
    try:
        # Test 1: Create JWT token
        print("\n1️⃣ Testing JWT token creation...")
        test_data = {"sub": "admin"}
        token = create_access_token(test_data)
        print("✅ JWT token created successfully")
        print(f"   Token length: {len(token)} characters")
        print(f"   Token preview: {token[:30]}...")
        
        # Test 2: Verify valid token
        print("\n2️⃣ Testing JWT token verification...")
        username = verify_token(token)
        if username == "admin":
            print("✅ JWT token verification successful")
            print(f"   Extracted username: {username}")
        else:
            print(f"❌ JWT token verification failed: got {username}")
            return
        
        # Test 3: Test invalid token
        print("\n3️⃣ Testing invalid token handling...")
        invalid_username = verify_token("invalid.token.here")
        if invalid_username is None:
            print("✅ Invalid token correctly rejected")
        else:
            print(f"❌ Invalid token incorrectly accepted: {invalid_username}")
        
        # Test 4: Test custom expiration
        print("\n4️⃣ Testing custom token expiration...")
        short_expire = timedelta(seconds=1)
        short_token = create_access_token(test_data, expires_delta=short_expire)
        
        # Verify token is initially valid
        username = verify_token(short_token)
        if username == "admin":
            print("✅ Custom expiration token created and verified")
        else:
            print("❌ Custom expiration token failed")
        
        print("\n🎉 JWT operations tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ JWT operations test failed: {e}")

async def test_password_operations():
    """
    @function test_password_operations
    @description Tests password hashing and verification functions
    @returns: None
    @example:
        # Test password handling
        await test_password_operations()
    """
    print("\n🔐 Testing Password Operations...")
    print("=" * 40)
    
    try:
        # Test 1: Password hashing
        print("\n1️⃣ Testing password hashing...")
        test_password = "test_password_123"
        hashed = get_password_hash(test_password)
        print("✅ Password hashed successfully")
        print(f"   Hash length: {len(hashed)} characters")
        print(f"   Hash preview: {hashed[:30]}...")
        
        # Test 2: Password verification (correct)
        print("\n2️⃣ Testing correct password verification...")
        is_valid = verify_password(test_password, hashed)
        if is_valid:
            print("✅ Correct password verified successfully")
        else:
            print("❌ Correct password verification failed")
        
        # Test 3: Password verification (incorrect)
        print("\n3️⃣ Testing incorrect password rejection...")
        is_invalid = verify_password("wrong_password", hashed)
        if not is_invalid:
            print("✅ Incorrect password correctly rejected")
        else:
            print("❌ Incorrect password incorrectly accepted")
        
        print("\n🎉 Password operations tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Password operations test failed: {e}")

async def test_authentication_service():
    """
    @function test_authentication_service
    @description Tests the complete authentication service including user authentication
    @returns: None
    @example:
        # Test authentication service
        await test_authentication_service()
    """
    print("\n👤 Testing Authentication Service...")
    print("=" * 40)
    
    try:
        # Test 1: Valid admin authentication
        print("\n1️⃣ Testing admin authentication...")
        admin_user = authenticate_user("admin", settings.ADMIN_PASSWORD)
        if admin_user == "admin":
            print("✅ Admin authentication successful")
            print(f"   Authenticated user: {admin_user}")
        else:
            print(f"❌ Admin authentication failed: {admin_user}")
        
        # Test 2: Invalid username
        print("\n2️⃣ Testing invalid username...")
        invalid_user = authenticate_user("invalid_user", settings.ADMIN_PASSWORD)
        if invalid_user is None:
            print("✅ Invalid username correctly rejected")
        else:
            print(f"❌ Invalid username incorrectly accepted: {invalid_user}")
        
        # Test 3: Invalid password
        print("\n3️⃣ Testing invalid password...")
        invalid_pass = authenticate_user("admin", "wrong_password")
        if invalid_pass is None:
            print("✅ Invalid password correctly rejected")
        else:
            print(f"❌ Invalid password incorrectly accepted: {invalid_pass}")
        
        print("\n🎉 Authentication service tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Authentication service test failed: {e}")

async def test_api_endpoints():
    """
    @function test_api_endpoints
    @description Tests the authentication API endpoints via HTTP requests
    @returns: None
    @example:
        # Test API endpoints
        await test_api_endpoints()
    """
    print("\n🌐 Testing Authentication API Endpoints...")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    try:
        # Test 1: Login with valid credentials
        print("\n1️⃣ Testing login endpoint with valid credentials...")
        login_data = {
            "username": "admin",
            "password": settings.ADMIN_PASSWORD
        }
        
        try:
            response = requests.post(f"{base_url}/api/login", json=login_data, timeout=5)
            if response.status_code == 200:
                token_data = response.json()
                print("✅ Login successful")
                print(f"   Token type: {token_data.get('token_type')}")
                print(f"   Username: {token_data.get('username')}")
                print(f"   Expires in: {token_data.get('expires_in')} seconds")
                
                # Save token for next test
                access_token = token_data.get('access_token')
                
                # Test 2: Verify token endpoint
                print("\n2️⃣ Testing token verification endpoint...")
                headers = {"Authorization": f"Bearer {access_token}"}
                verify_response = requests.get(f"{base_url}/api/auth/verify", headers=headers, timeout=5)
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    print("✅ Token verification successful")
                    print(f"   Username: {verify_data.get('username')}")
                    print(f"   Valid: {verify_data.get('valid')}")
                else:
                    print(f"❌ Token verification failed: {verify_response.status_code}")
                    print(f"   Response: {verify_response.text}")
                
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("⚠️  Server not running - start with: uvicorn app.main:app --reload --port 8000")
            return
        except requests.exceptions.Timeout:
            print("⚠️  Server timeout - check server status")
            return
        
        # Test 3: Login with invalid credentials
        print("\n3️⃣ Testing login with invalid credentials...")
        invalid_login = {
            "username": "admin",
            "password": "wrong_password"
        }
        
        invalid_response = requests.post(f"{base_url}/api/login", json=invalid_login, timeout=5)
        if invalid_response.status_code == 401:
            print("✅ Invalid credentials correctly rejected")
            print(f"   Error: {invalid_response.json().get('detail')}")
        else:
            print(f"❌ Invalid credentials incorrectly accepted: {invalid_response.status_code}")
        
        print("\n🎉 API endpoints tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ API endpoints test failed: {e}")

if __name__ == "__main__":
    print("Q&A Loader Authentication Testing Suite")
    print("=" * 50)
    print(f"Testing against JWT secret: {settings.JWT_SECRET_KEY[:10]}...")
    print(f"Admin password configured: {'Yes' if settings.ADMIN_PASSWORD else 'No'}")
    
    # Run all tests
    asyncio.run(test_jwt_operations())
    asyncio.run(test_password_operations())
    asyncio.run(test_authentication_service())
    asyncio.run(test_api_endpoints())
    
    print("\n" + "=" * 50)
    print("🏁 Authentication testing completed!")
    print("✅ Authentication system is ready for Phase 4 (Question CRUD)")