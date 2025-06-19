#!/usr/bin/env python3
"""
Generate bcrypt password hash for test users
Password: 12345678aA1
"""

import bcrypt

def generate_password_hash(password: str) -> str:
    """Generate bcrypt hash for password"""
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hash_bytes.decode('utf-8')

if __name__ == "__main__":
    password = "12345678aA1"
    password_hash = generate_password_hash(password)
    
    print(f"Password: {password}")
    print(f"Hash: {password_hash}")
    print("\nUse this hash in your SQL INSERT statements for all test users.")