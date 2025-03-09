# Text-to-Image Generation API

This FastAPI application serves as an intermediary between client requests and Nebius Studio's text-to-image generation service. It handles generation requests, calls the Nebius Studio API, logs detailed information at each step, and stores these logs in Supabase.

## Features

- Text-to-image generation via Nebius Studio
- Detailed request and response logging
- Storage of logs in Supabase
- Error handling and reporting

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NEBIUS_API_KEY=your_nebius_api_key
   NEBIUS_API_ENDPOINT=https://api.nebius-studio.com/v1/generate
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
4. Run the application:
   ```
   uvicorn main:app --reload
   ```

## API Routes

- **/api/generate**: POST endpoint that accepts a prompt and parameters to generate an image using Nebius Studio's API and logs the process in Supabase.

### API Request Format

```json
{
  "prompt": "A beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "diffusionStrength": 0.7,
  "styleIntensity": 0.5,
  "style": "realistic"
}
```

### API Response Format

```json
{
  "success": true,
  "imageUrl": "https://url-to-generated-image.jpg",
  "requestId": "unique-request-id",
  "metadata": {
    "prompt": "A beautiful sunset over mountains",
    "style": "realistic",
    "diffusionStrength": 0.7,
    "styleIntensity": 0.5,
    "generatedAt": "2023-05-01T12:34:56.789Z"
  },
  "logs": [
    { "step": "request_received", "timestamp": "2023-05-01T12:34:56.000Z" },
    { "step": "calling_nebius_api", "timestamp": "2023-05-01T12:34:56.100Z" },
    { "step": "image_generated", "timestamp": "2023-05-01T12:34:58.500Z" }
  ]
}
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Nebius Studio API credentials
NEBIUS_API_KEY=your_nebius_api_key
NEBIUS_API_ENDPOINT=https://api.nebius-studio.com/v1/generate

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can copy the `.env.local.example` file and fill in your actual credentials.

## Error Handling

The API returns appropriate HTTP status codes and error messages for different scenarios:

- 400: Bad Request (invalid parameters)
- 500: Internal Server Error (issues with the Nebius API or other internal errors)
- 503: Service Unavailable (Nebius API unavailable)

## Logging

All requests, responses, and errors are logged and stored in Supabase for monitoring and debugging purposes.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # API endpoint for image generation
│   ├── components/
│   │   ├── GeneratedImage.tsx  # Component for displaying generated images
│   │   ├── LoadingSpinner.tsx  # Loading indicator component
│   │   └── Navigation.tsx      # Navigation component
│   ├── generate/
│   │   └── page.tsx          # Image generation page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Home page
├── utils/
│   ├── env.ts                # Environment variable validation
│   ├── nebius-api.ts         # Nebius Studio API client
│   └── supabase.ts           # Supabase client and logging utilities
```

## API Implementation

The image generation API uses the OpenAI client library to interact with Nebius Studio's API. The implementation:

1. Receives parameters from the frontend (prompt, negative prompt, style, etc.)
2. Transforms these parameters to match Nebius Studio's API requirements
3. Calls the API using the OpenAI client
4. Processes the response (which may include base64-encoded image data)
5. Saves base64 images to the filesystem if needed
6. Returns the image URL and metadata to the client

### OpenAI Client Usage

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

const response = await client.images.generate({
  model: "stability-ai/sdxl",
  prompt: "An elephant in a desert",
  response_format: "b64_json",
  extra_body: {
    response_extension: "webp",
    width: 512,
    height: 512,
    num_inference_steps: 30,
    seed: -1,
    negative_prompt: "Giraffes, night sky",
  },
});
```
