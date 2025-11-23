'''
Business: User registration with JWT token generation
Args: event - dict with httpMethod, body (email, password, full_name)
      context - object with request_id attribute
Returns: HTTP response with JWT token and user data
'''
import json
import os
from typing import Dict, Any
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field, ValidationError


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Parse and validate request
    body_data = json.loads(event.get('body', '{}'))
    register_req = RegisterRequest(**body_data)
    
    # Connect to database
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    # Check if user already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (register_req.email,))
    existing_user = cur.fetchone()
    
    if existing_user:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User with this email already exists'}),
            'isBase64Encoded': False
        }
    
    # Hash password
    password_hash = bcrypt.hashpw(register_req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Insert user
    cur.execute(
        "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id, email, full_name, created_at",
        (register_req.email, password_hash, register_req.full_name)
    )
    user_data = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    # Generate JWT token
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    token_payload = {
        'user_id': user_data[0],
        'email': user_data[1],
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(token_payload, jwt_secret, algorithm='HS256')
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_data[0],
                'email': user_data[1],
                'full_name': user_data[2],
                'created_at': user_data[3].isoformat()
            }
        }),
        'isBase64Encoded': False
    }
