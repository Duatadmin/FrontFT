# Nutrition Service v2 - Frontend Integration Guide

## Overview

This FastAPI-based service analyzes food photos using OpenAI's Vision API and returns detailed nutritional information in a structured JSON format. The service acts as a middleware between your frontend application and OpenAI, providing consistent nutrition data for meal tracking applications.

## API Endpoint

### Analyze Photo
**Endpoint:** `POST /photo/analyze`

**Request Body:**
```json
{
  "image_url": "https://imagedelivery.net/90dwPMQle0zqp8U9Bh0QDw/meals/.../public",
  "prompt_version": "v1"
}
```

**Request Fields:**
- `image_url` (required): Must be a valid HTTPS URL from one of these domains:
  - `imagedelivery.net`
  - `cloudflare.com`
  - `cloudflareimages.com`
- `prompt_version` (optional): Currently only supports `"v1"` (default)

## Response Structure

### Success Response (200 OK)
```json
{
  "dish_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Grilled Chicken Salad",
  "meal_type": "lunch",
  "tagline": "Fresh and healthy grilled chicken on a bed of mixed greens",
  "prep_time_min": 15,
  "rating": 4.5,
  "energy_kcal": 350,
  "ingredients": [
    {
      "qty": "150",
      "unit": "g",
      "name": "grilled chicken breast"
    },
    {
      "qty": "2",
      "unit": "cups",
      "name": "mixed greens"
    },
    {
      "qty": "1",
      "unit": "tbsp",
      "name": "olive oil"
    }
  ],
  "macros": {
    "protein_g": 35.5,
    "fat_g": 12.3,
    "carbs_g": 15.7
  },
  "daily_goal_pct": {
    "kcal": 18,
    "protein": 45,
    "carbs": 12,
    "fat": 20
  },
  "micros": {
    "vitamin_c_mg": 45,
    "iron_mg": 2.5,
    "calcium_mg": 120,
    "vitamin_a_iu": 1500
  },
  "recipe_steps": [
    "Season chicken with salt and pepper",
    "Grill chicken for 6-8 minutes per side",
    "Prepare salad greens",
    "Slice chicken and place on greens",
    "Drizzle with olive oil"
  ],
  "confidence": 0.85,
  "photo_url": "https://imagedelivery.net/90dwPMQle0zqp8U9Bh0QDw/meals/.../public"
}
```

### Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `dish_id` | UUID (string) | Unique identifier generated for this dish |
| `name` | string | Short English name of the dish |
| `meal_type` | string | One of: `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"` |
| `tagline` | string | Brief description (max 120 characters) |
| `prep_time_min` | integer | Estimated preparation time in minutes |
| `rating` | float | Dish rating from 0.0 to 5.0 (one decimal place) |
| `energy_kcal` | integer | Total calories per serving |
| `ingredients` | array | List of ingredients with quantity, unit, and name |
| `macros` | object | Macronutrient breakdown in grams |
| `daily_goal_pct` | object | Percentage of daily nutritional goals (0-100) |
| `micros` | object | Micronutrients (flexible structure, varies by dish) |
| `recipe_steps` | array | Cooking instructions (can be empty array) |
| `confidence` | float | AI confidence score (0.0-1.0, <0.8 means estimate) |
| `photo_url` | string | Same as input image_url |

### Error Responses

#### 400 Bad Request
```json
{
  "error": "invalid_image_url",
  "message": "Image URL must be from allowed domains"
}
```

#### 404 Not Found
```json
{
  "error": "image_not_accessible",
  "message": "Unable to access the image at the provided URL"
}
```

#### 408 Request Timeout
```json
{
  "error": "timeout",
  "message": "Request timed out after 60 seconds"
}
```

#### 422 Unprocessable Entity
```json
{
  "error": "invalid_response",
  "message": "Failed to parse OpenAI response: [details]"
}
```

#### 500 Internal Server Error
```json
{
  "error": "openai_error",
  "message": "OpenAI API error: [details]"
}
```

## Integration Example

### JavaScript/TypeScript
```typescript
interface NutritionAnalysisRequest {
  image_url: string;
  prompt_version?: string;
}

interface NutritionAnalysisResponse {
  dish_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  tagline: string;
  prep_time_min: number;
  rating: number;
  energy_kcal: number;
  ingredients: Array<{
    qty: string;
    unit?: string;
    name: string;
  }>;
  macros: {
    protein_g: number;
    fat_g: number;
    carbs_g: number;
  };
  daily_goal_pct: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  micros: Record<string, any>;
  recipe_steps: string[];
  confidence: number;
  photo_url: string;
}

async function analyzeFoodPhoto(imageUrl: string): Promise<NutritionAnalysisResponse> {
  const response = await fetch('https://your-api-domain.com/photo/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt_version: 'v1'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze photo');
  }

  return response.json();
}
```

## Important Notes

1. **Image Requirements:**
   - Images must be hosted on Cloudflare's image delivery service
   - URLs must be publicly accessible (service validates with HEAD request)
   - Square photos work best for accurate analysis

2. **Response Times:**
   - Typical response time: 5-15 seconds
   - Maximum timeout: 60 seconds
   - Consider showing a loading state during analysis

3. **Confidence Score:**
   - Values < 0.8 indicate the nutritional data is an estimate
   - Consider displaying a warning for low confidence scores

4. **Micronutrients:**
   - The `micros` field structure varies based on what nutrients AI detects
   - Common keys: `vitamin_c_mg`, `iron_mg`, `calcium_mg`, `fiber_g`
   - Always check if a micronutrient exists before displaying

5. **CORS:**
   - Service allows all origins (`*`)
   - No authentication required (consider implementing if needed)

## Development Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Create `.env` file with: `OPENAI_API_KEY=your_key_here`
4. Run server: `uvicorn app.main:app --reload`
5. API will be available at `http://localhost:8000`

## Health Check

**Endpoint:** `GET /healthz`

Returns `200 OK` with `{"status": "healthy"}` when service is running.

## Architecture Overview

```
Frontend App
    ↓
[POST /photo/analyze]
    ↓
FastAPI Service
    ↓
OpenAI Vision API (o3 model)
    ↓
Structured JSON Response
```

The service validates inputs, handles errors gracefully, and ensures consistent response format for frontend consumption.