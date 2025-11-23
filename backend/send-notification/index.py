'''
Business: Send email notification for reminders
Args: event - dict with httpMethod, body (to_email, reminder_title, reminder_date, reminder_time)
      context - object with request_id attribute
Returns: HTTP response with success status
'''
import json
import os
from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel, EmailStr, Field


class NotificationRequest(BaseModel):
    to_email: EmailStr
    reminder_title: str = Field(..., min_length=1)
    reminder_date: str
    reminder_time: str
    reminder_description: str = ''


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    notification_req = NotificationRequest(**body_data)
    
    # Get SMTP configuration from environment
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_from = os.environ.get('SMTP_FROM_EMAIL', smtp_user)
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'SMTP configuration is incomplete'}),
            'isBase64Encoded': False
        }
    
    # Create email message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Напоминание: {notification_req.reminder_title}'
    msg['From'] = smtp_from
    msg['To'] = notification_req.to_email
    
    # Email body
    text = f'''
    Напоминание: {notification_req.reminder_title}
    
    Дата: {notification_req.reminder_date}
    Время: {notification_req.reminder_time}
    
    {notification_req.reminder_description}
    
    ---
    RemindMe - Ваша система напоминаний
    '''
    
    html = f'''
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0EA5E9; margin-bottom: 20px;">🔔 Напоминание</h2>
          <h3 style="color: #1e293b; margin-bottom: 15px;">{notification_req.reminder_title}</h3>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>📅 Дата:</strong> {notification_req.reminder_date}</p>
            <p style="margin: 5px 0;"><strong>⏰ Время:</strong> {notification_req.reminder_time}</p>
          </div>
          
          {f'<p style="color: #475569; margin-top: 15px;">{notification_req.reminder_description}</p>' if notification_req.reminder_description else ''}
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">RemindMe - Ваша система напоминаний</p>
        </div>
      </body>
    </html>
    '''
    
    part1 = MIMEText(text, 'plain', 'utf-8')
    part2 = MIMEText(html, 'html', 'utf-8')
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    if smtp_port == 465:
        # SSL connection
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
    else:
        # TLS connection
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Notification sent successfully'}),
        'isBase64Encoded': False
    }
