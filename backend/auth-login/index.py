'''
Business: User login with JWT token generation
Args: event - dict with httpMethod, body (email, password)
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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


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
    login_req = LoginRequest(**body_data)
    
    # Connect to database
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    # Find user by email
    cur.execute(
        "SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = %s",
        (login_req.email,)
    )
    user_data = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user_data:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid email or password'}),
            'isBase64Encoded': False
        }
    
    # Verify password
    password_valid = bcrypt.checkpw(login_req.password.encode('utf-8'), user_data[2].encode('utf-8'))
    
    if not password_valid:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid email or password'}),
            'isBase64Encoded': False
        }
    
    # Generate JWT token
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    token_payload = {
        'user_id': user_data[0],
        'email': user_data[1],
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(token_payload, jwt_secret, algorithm='HS256')
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_data[0],
                'email': user_data[1],
                'full_name': user_data[3],
                'created_at': user_data[4].isoformat()
            }
        }),
        'isBase64Encoded': False
    }
