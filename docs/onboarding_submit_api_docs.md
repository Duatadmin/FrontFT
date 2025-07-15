# API Documentation: /api/v1/onboarding/submit

## Overview

The `/api/v1/onboarding/submit` endpoint allows frontend applications to submit complete user onboarding data in a single request. This endpoint bypasses the conversational flow and directly processes structured onboarding information to create a personalized training plan.

## Endpoint Details

- **URL**: `/api/v1/onboarding/submit`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Not required (user_id serves as identifier)

## Request Format

### Request Body Schema

```json
{
  "user_id": "string",
  "onboarding_data": {
    "goal": "string",
    "goal_detail": "string",
    "goal_timeline_weeks": "number",
    "level": "string",
    "age": "number",
    "sex": "string",
    "height_cm": "number",
    "weight_kg": "number",
    "available_days_per_week": "number",
    "preferred_days": ["string"],
    "session_duration_minutes": "number",
    "split_preference": "string",
    "location": "string",
    "equipment": ["string"],
    "injuries": "string",
    "sleep_hours_normalized": "number",
    "baseline_capacity": {
      "pushups": "number",
      "squats": "number",
      "plank_seconds": "number"
    },
    "preferences": "string"
  }
}
```

### Field Descriptions

#### Required Fields

1. **user_id** (string, required)
   - Unique identifier for the user
   - Can be any string (e.g., UUID, email, or custom ID)
   - Used to create or update user profile

2. **onboarding_data** (object, required)
   - Contains all user onboarding information
   - All 18 fields should be included for complete profile

#### Onboarding Data Fields

1. **goal** (string)
   - Primary fitness goal
   - Expected values: `"Build Muscle"`, `"Get Stronger"`, `"Lose Weight"`, `"Improve Endurance"`, `"Stay Healthy"`
   - Will be normalized to: `"hypertrophy"`, `"strength"`, `"general_fitness"`

2. **goal_detail** (string)
   - Specific areas or details about the goal
   - Example: `"bigger arms and shoulders"`, `"improve core strength"`

3. **goal_timeline_weeks** (number)
   - Target timeframe in weeks
   - Common values: `4`, `8`, `12`, `24`, `0` (no rush)

4. **level** (string)
   - Fitness experience level
   - Expected values: `"beginner"`, `"intermediate"`, `"advanced"`
   - Will be normalized to: `"novice"`, `"beginner"`, `"pre_intermediate"`, `"intermediate"`, `"pro"`

5. **age** (number)
   - User's age in years
   - Range: 16-100

6. **sex** (string)
   - Biological sex
   - Expected values: `"male"`, `"female"`

7. **height_cm** (number)
   - Height in centimeters
   - Range: 140-220

8. **weight_kg** (number)
   - Weight in kilograms
   - Range: 40-150

9. **available_days_per_week** (number)
   - Days available for training per week
   - Range: 1-7

10. **preferred_days** (array of strings)
    - Preferred training days
    - Format: `["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]`

11. **session_duration_minutes** (number)
    - Workout duration in minutes
    - Common values: `30`, `45`, `60`, `90`

12. **split_preference** (string)
    - Training split preference
    - Expected values: `"full_body"`, `"push_pull_legs"`, `"upper_lower"`, `"body_part"`, `"no_preference"`

13. **location** (string)
    - Training location
    - Expected values: `"home"`, `"gym"`, `"both"`

14. **equipment** (array of strings)
    - Available equipment
    - Examples: `["dumbbells", "barbell", "pull-up bar", "resistance bands", "gym machines"]`
    - Use `["bodyweight"]` if no equipment

15. **injuries** (string)
    - Current injuries or limitations
    - Examples: `"lower back pain"`, `"bad knee"`, `"none"`

16. **sleep_hours_normalized** (number)
    - Average sleep hours per night
    - Range: 4-10 (supports decimals)

17. **baseline_capacity** (object)
    - Current strength baseline
    - Structure:
      ```json
      {
        "pushups": 25,
        "squats": 30,
        "plank_seconds": 60
      }
      ```

18. **preferences** (string)
    - Exercise preferences or notes
    - Example: `"Love compound movements, not a fan of cardio"`

## Response Format

### Success Response (200 OK)

```json
{
  "reply": "[Full training plan with exercises and satisfaction question]",
  "plan_id": "uuid-of-generated-plan"
}
```

### Error Responses

#### 400 Bad Request
Missing required fields:
```json
{
  "detail": "user_id is required"
}
```
or
```json
{
  "detail": "onboarding_data is required"
}
```

#### 500 Internal Server Error
Processing error:
```json
{
  "detail": "Failed to process onboarding: [error details]"
}
```

## Complete Example

### Request Example

```bash
curl -X POST http://localhost:8000/api/v1/onboarding/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "onboarding_data": {
      "goal": "Build Muscle",
      "goal_detail": "bigger arms and shoulders",
      "goal_timeline_weeks": 12,
      "level": "intermediate",
      "age": 28,
      "sex": "male",
      "height_cm": 180,
      "weight_kg": 75,
      "available_days_per_week": 4,
      "preferred_days": ["Mon", "Tue", "Thu", "Fri"],
      "session_duration_minutes": 60,
      "split_preference": "push_pull_legs",
      "location": "gym",
      "equipment": ["dumbbells", "barbell", "pull-up bar", "gym machines"],
      "injuries": "none",
      "sleep_hours_normalized": 7.5,
      "baseline_capacity": {
        "pushups": 25,
        "squats": 30,
        "plank_seconds": 60
      },
      "preferences": "Love compound movements, not a fan of cardio"
    }
  }'
```

### Response Example

```json
{
  "reply": "Here's your personalized 12-week muscle-building plan:\n\n[Full plan details with exercises]\n\nAre you happy with this plan?",
  "plan_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Processing Flow

1. **User Creation/Retrieval**: System creates new user or retrieves existing user based on `user_id`

2. **Data Storage**: Raw onboarding data is stored in `raw_onboarding_answers` field

3. **Normalization**: Data is normalized using LLM or fallback logic to match database schema

4. **Profile Update**: User profile is updated with normalized data and marked as complete

5. **Plan Generation**: PlannerAgent generates initial training plan based on user profile

6. **Agent Switching**: System switches to FeedbackAgent for plan refinement

7. **Plan Response**: The generated plan is returned in the response with the same format as regular messages

## Integration Notes

### Frontend Considerations

1. **Data Validation**: Validate data on frontend before submission to ensure all required fields are present

2. **User ID Generation**: Generate unique user IDs on frontend (e.g., using UUID or authenticated user ID)

3. **Error Handling**: Implement retry logic for network failures and display user-friendly error messages

4. **Loading States**: Show loading indicator during submission as plan generation may take 10-30 seconds

### Data Format Tips

1. **Arrays**: Ensure arrays are properly formatted JSON arrays, not strings

2. **Numbers**: Send numeric values as numbers, not strings

3. **Equipment**: Use lowercase, consistent naming for equipment items

4. **Days**: Use three-letter abbreviations with capital first letter (Mon, Tue, etc.)

## Testing

Use the provided test script at `/scripts/test_frontend_onboarding.py` for testing:

```python
python scripts/test_frontend_onboarding.py
```

This script demonstrates proper request formatting and handles responses appropriately.

## Notes

- The endpoint performs comprehensive normalization, so minor variations in input format are acceptable
- If normalization fails, sensible defaults are applied to ensure plan generation succeeds
- The generated plan ID can be used to retrieve plan details via other endpoints
- After successful onboarding, the user is automatically switched to the FeedbackAgent for plan refinement
- The response format matches the regular message endpoints for consistency
- The plan includes the satisfaction question, ready for the user's response