# Frontend Integration: Initiating a Chat Session

This document outlines how the Main Application (Frontend) initiates a chat session with the backend.

## Chat Initiation Flow Summary

The chat session doesn't have a dedicated "start chat" or "initiate session" endpoint. Instead, the very first message sent by a user to the general message handling endpoint triggers the chat initiation and, typically, an onboarding process if the user is new or hasn't completed it.

## Audit Details

| Aspect                    | Details                                                                                                                               |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Entry-point Route & HTTP Method** | `POST /api/v1/message`                                                                                                                |
| **Server-Side Handler**   | **File:** `pipelines/message_pipeline.py` <br> **Function:** `process_incoming_message` (around line 34) <br> This function is called by the route handler in `routers/fitness.py` (around line 12). |
| **Frontend Call Location**| To be confirmed (TBC). The frontend makes a POST request to `/api/v1/message`.                                                              |
| **Request Contract**      | **Headers:** `Content-Type: application/json` <br> **Body (JSON):** <br> ```json
{
  "user_id": "string", // Unique identifier for the user
  "message": "string"  // User's message content
}
```                                     |
| **Response Contract (Minimal for first chat view)** | **Headers:** `Content-Type: application/json` <br> **Body (JSON):** <br> ```json
{
  "reply": "string" // The bot's first message (e.g., welcome or first onboarding question)
}
```                                   |

## Detailed Explanation

1.  **Frontend Action**: When the user sends their first message (or the chat UI decides to initiate contact), the frontend sends a `POST` request to `/api/v1/message`.
    *   The request body **must** include `user_id` (obtained from authentication) and the `message` (the user's typed text).

2.  **Backend - Router (`routers/fitness.py`)**: 
    *   The `@router.post("/message")` route receives the request.
    *   It validates that `user_id` and `message` are present.
    *   It calls `await process_incoming_message(request.user_id, request.message)`.

3.  **Backend - Pipeline (`pipelines/message_pipeline.py`)**: 
    *   The `process_incoming_message` function is the core logic.
    *   It first calls `await get_or_create_user(user_id)` from `services/user_service.py`. This retrieves existing user data or creates a new user entry in the database if the `user_id` is not found.
    *   It checks the `onboarding_complete` status for the user.
    *   **If Onboarding is NOT complete (typical for a new user's first message):**
        *   It calls `await handle_onboarding_step(user_id, user_state, message)` from `services/onboarding_service.py`.
        *   This service likely determines the first onboarding question/statement based on the user's current (empty) onboarding state.
        *   The `reply` from this step (e.g., "Welcome! What's your name?") is returned to the frontend.
    *   **If Onboarding IS complete:**
        *   The message is routed to the appropriate agent (e.g., `CoreAgent`, `PlannerAgent`) based on `user_state.current_agent_id`.

4.  **Frontend Action (Receiving Response)**: 
    *   The frontend receives a JSON response containing the `reply`.
    *   This `reply` is displayed in the chat interface as the first message from the bot.

## Risks / TODOs

*   **Frontend Call Location**: The exact file and line number in the React frontend codebase where the initial `/api/v1/message` call is made still needs to be pinpointed. The `grep_search` for frontend API calls was inconclusive.
*   **`user_id` Source**: Ensure the `user_id` sent by the frontend is reliably generated/retrieved (e.g., from an authentication provider) and is unique per user.
*   **Error Handling**: Robust error handling should be present on the frontend for the `/api/v1/message` call (e.g., network errors, 500 server errors, 400 bad requests if `user_id` or `message` is missing).
*   **API URL Configuration**: Verify how the base API URL (e.g., `http://localhost:8000` or a production URL) is configured on the frontend (likely via an environment variable like `NEXT_PUBLIC_API_URL` or `REACT_APP_API_URL`).
*   **Initial Message Content**: Clarify if the content of the very first `message` sent by the user has any significance if the system immediately diverts to onboarding. It seems required by the Pydantic model `MessageRequest`.
*   **Security (CORS)**: The `app.py` currently has `allow_origins=["*"]`. For production, this should be restricted to the specific frontend domain(s).
