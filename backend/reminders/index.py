'''
Business: CRUD operations for user reminders
Args: event - dict with httpMethod, body, queryStringParameters, headers (X-Auth-Token)
      context - object with request_id attribute
Returns: HTTP response with reminder data
'''
import json
import os
from typing import Dict, Any, Optional
import psycopg2
import jwt
from datetime import datetime, date, time
from pydantic import BaseModel, Field, ValidationError


class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    time: str = Field(..., pattern=r'^\d{2}:\d{2}$')
    frequency: str = Field(..., pattern=r'^(once|daily|weekly|monthly|yearly)$')


class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')
    time: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    frequency: Optional[str] = Field(None, pattern=r'^(once|daily|weekly|monthly|yearly)$')
    is_active: Optional[bool] = None


def verify_token(token: str) -> Optional[int]:
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
    return payload.get('user_id')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Verify authentication
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication token required'}),
            'isBase64Encoded': False
        }
    
    user_id = verify_token(auth_token)
    
    # Connect to database
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    # GET - List all reminders for user
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        search_query = params.get('search', '')
        
        if search_query:
            cur.execute(
                "SELECT id, title, description, date, time, frequency, is_active, created_at FROM reminders WHERE user_id = %s AND (title ILIKE %s OR description ILIKE %s) ORDER BY date, time",
                (user_id, f'%{search_query}%', f'%{search_query}%')
            )
        else:
            cur.execute(
                "SELECT id, title, description, date, time, frequency, is_active, created_at FROM reminders WHERE user_id = %s ORDER BY date, time",
                (user_id,)
            )
        
        reminders = cur.fetchall()
        cur.close()
        conn.close()
        
        result = [
            {
                'id': r[0],
                'title': r[1],
                'description': r[2],
                'date': r[3].isoformat(),
                'time': r[4].strftime('%H:%M'),
                'frequency': r[5],
                'is_active': r[6],
                'created_at': r[7].isoformat()
            }
            for r in reminders
        ]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    # POST - Create new reminder
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        reminder_data = ReminderCreate(**body_data)
        
        cur.execute(
            "INSERT INTO reminders (user_id, title, description, date, time, frequency) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, title, description, date, time, frequency, is_active, created_at",
            (user_id, reminder_data.title, reminder_data.description, reminder_data.date, reminder_data.time, reminder_data.frequency)
        )
        new_reminder = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': new_reminder[0],
                'title': new_reminder[1],
                'description': new_reminder[2],
                'date': new_reminder[3].isoformat(),
                'time': new_reminder[4].strftime('%H:%M'),
                'frequency': new_reminder[5],
                'is_active': new_reminder[6],
                'created_at': new_reminder[7].isoformat()
            }),
            'isBase64Encoded': False
        }
    
    # PUT - Update reminder
    if method == 'PUT':
        params = event.get('queryStringParameters') or {}
        reminder_id = params.get('id')
        
        if not reminder_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Reminder id is required'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        update_data = ReminderUpdate(**body_data)
        
        # Build dynamic update query
        update_fields = []
        update_values = []
        
        if update_data.title is not None:
            update_fields.append('title = %s')
            update_values.append(update_data.title)
        if update_data.description is not None:
            update_fields.append('description = %s')
            update_values.append(update_data.description)
        if update_data.date is not None:
            update_fields.append('date = %s')
            update_values.append(update_data.date)
        if update_data.time is not None:
            update_fields.append('time = %s')
            update_values.append(update_data.time)
        if update_data.frequency is not None:
            update_fields.append('frequency = %s')
            update_values.append(update_data.frequency)
        if update_data.is_active is not None:
            update_fields.append('is_active = %s')
            update_values.append(update_data.is_active)
        
        if not update_fields:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No fields to update'}),
                'isBase64Encoded': False
            }
        
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.extend([user_id, reminder_id])
        
        query = f"UPDATE reminders SET {', '.join(update_fields)} WHERE user_id = %s AND id = %s RETURNING id, title, description, date, time, frequency, is_active, updated_at"
        
        cur.execute(query, update_values)
        updated_reminder = cur.fetchone()
        
        if not updated_reminder:
            conn.rollback()
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Reminder not found'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': updated_reminder[0],
                'title': updated_reminder[1],
                'description': updated_reminder[2],
                'date': updated_reminder[3].isoformat(),
                'time': updated_reminder[4].strftime('%H:%M'),
                'frequency': updated_reminder[5],
                'is_active': updated_reminder[6],
                'updated_at': updated_reminder[7].isoformat()
            }),
            'isBase64Encoded': False
        }
    
    # DELETE - Delete reminder (soft delete by setting is_active = false)
    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        reminder_id = params.get('id')
        
        if not reminder_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Reminder id is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE reminders SET is_active = false WHERE user_id = %s AND id = %s RETURNING id",
            (user_id, reminder_id)
        )
        deleted_reminder = cur.fetchone()
        
        if not deleted_reminder:
            conn.rollback()
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Reminder not found'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Reminder deleted successfully'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
