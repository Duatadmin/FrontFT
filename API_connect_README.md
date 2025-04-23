# Fitness Assistant API Connection Guide

This document provides all the necessary details for connecting to the Fitness Assistant API.

## Base URL

Production: `https://whatsapp-bot-production-ea3b.up.railway.app`

## Authentication

Currently, the API does not require authentication tokens. User identification is handled via the `user_id` parameter in request bodies.

## Important: User ID Format Requirements

The `user_id` parameter must be a valid UUID string format. Example:
```
"user_id": "123e4567-e89b-12d3-a456-426614174000"
```

You can generate valid UUIDs using:
```javascript
// Browser
const userId = crypto.randomUUID();

// Node.js
const { v4: uuidv4 } = require('uuid');
const userId = uuidv4();
```

Using non-UUID formats (like "frontend-user") will result in a 500 error with message about invalid UUID syntax.

## Available Endpoints

### Health Check

**Endpoint:** `GET /api/ping`

**Response:**
```json
{
  "status": "ok"
}
```

**Usage Example:**
```javascript
// JavaScript
fetch('https://whatsapp-bot-production-ea3b.up.railway.app/api/ping')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Send Message

**Endpoint:** `POST /api/send`

**Request Body:**
```json
{
  "user_id": "string", // Required - unique identifier for the user
  "message": "string"  // Required - the message text to process
}
```

**Important Notes:**
- Both fields are required
- Both fields must be strings
- Field names are case-sensitive

**Response:**
```json
{
  "reply": "string" // The assistant's response message
}
```

**Usage Example:**
```javascript
// JavaScript/React
const sendMessage = async (userId, message) => {
  try {
    const response = await fetch('https://whatsapp-bot-production-ea3b.up.railway.app/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message
      })
    });
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error sending message:', error);
    return 'Sorry, something went wrong. Please try again.';
  }
};
```

## Common Error Codes

| Status Code | Description                | Possible Causes                                   |
|-------------|----------------------------|----------------------------------------------------|
| 400         | Bad Request                | Missing required fields                            |
| 404         | Not Found                  | Incorrect endpoint URL                             |
| 422         | Unprocessable Entity       | Incorrect data types, missing fields, wrong format |
| 500         | Internal Server Error      | Server-side error                                  |

## Frontend Implementation Guide

### 1. Create API Service

```javascript
// api.js
import axios from 'axios';
// For UUID generation
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const API_URL = 'https://whatsapp-bot-production-ea3b.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Get or create user ID from local storage
const getUserId = () => {
  let userId = localStorage.getItem('fitness_assistant_user_id');
  if (!userId) {
    userId = uuidv4(); // Generate UUID
    localStorage.setItem('fitness_assistant_user_id', userId);
  }
  return userId;
};

export const sendMessage = async (message) => {
  const userId = getUserId();
  try {
    const response = await api.post('/api/send', {
      user_id: userId,
      message: message
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const checkApiStatus = async () => {
  try {
    const response = await api.get('/api/ping');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
```

### 2. React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { sendMessage, checkApiStatus } from './api';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check API connection on component mount
    const checkConnection = async () => {
      const status = await checkApiStatus();
      setIsConnected(status);
    };
    checkConnection();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    
    try {
      // Get response from API
      const reply = await sendMessage(input);
      setMessages(prev => [...prev, { text: reply, sender: 'assistant' }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Failed to get response. Please try again.', 
        sender: 'system' 
      }]);
    }
  };

  return (
    <div className="chat-container">
      {!isConnected && (
        <div className="connection-error">
          Cannot connect to backend service
        </div>
      )}
      
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatComponent;
```

## Troubleshooting

### CORS Issues
The API has CORS enabled for all origins during development. If you encounter CORS issues, check:

1. That you're using the correct endpoint URLs
2. Your request includes the proper Content-Type header
3. You're not including cookies or other credentials that might trigger preflight requests

### 422 Errors
If you receive a 422 Unprocessable Entity error:

1. Check the format of your request body
2. Ensure both user_id and message fields are included and are strings
3. Verify field names are lowercase and match exactly

### Testing Your Connection
You can test the API connection using curl:

```bash
# Health check
curl https://whatsapp-bot-production-ea3b.up.railway.app/api/ping

# Send a message (using a valid UUID)
curl -X POST https://whatsapp-bot-production-ea3b.up.railway.app/api/send \
  -H "Content-Type: application/json" \
  -d '{"user_id":"123e4567-e89b-12d3-a456-426614174000","message":"Hello"}'
```

## API Updates
The API may be updated in the future. Check back to this document for any changes to endpoints or request formats.

## Common Errors

### Invalid UUID Format
```json
{
  "reply": "Sorry, something went wrong. Please try again later."
}
```

If you receive this generic error message, check your server logs. You may see an error like:
```
invalid input syntax for type uuid: "frontend-user"
```

This means your user_id is not in the required UUID format. Make sure to use a properly formatted UUID string as shown in the examples above. 