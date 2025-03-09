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
- **/api/logs**: GET endpoint that retrieves generation logs from Supabase with filtering and pagination options.

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

### Logs API Request Format

```
GET /api/logs?limit=50&offset=0&requestId=123&status=completed&userId=anonymous
```

Query parameters:

- `limit`: Maximum number of logs to return (default: 50)
- `offset`: Number of logs to skip (default: 0)
- `requestId`: Filter logs by request ID (optional)
- `status`: Filter logs by status (optional)
- `userId`: Filter logs by user ID (optional)

### Logs API Response Format

```json
{
  "logs": [
    {
      "id": "1",
      "request_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "anonymous",
      "prompt": "A beautiful sunset over mountains",
      "status": "completed",
      "step": "image_generated",
      "details": { "imageSize": "original" },
      "image_url": "/generated/123e4567-e89b-12d3-a456-426614174000.webp",
      "created_at": "2023-05-01T12:34:58.500Z"
    }
    // More logs...
  ],
  "groupedLogs": {
    "123e4567-e89b-12d3-a456-426614174000": [
      // All logs for this request ID
    ]
  },
  "count": 100,
  "limit": 50,
  "offset": 0
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
│   │   ├── generate/
│   │   │   └── route.ts      # API endpoint for image generation
│   │   └── logs/
│   │       └── route.ts      # API endpoint for fetching logs
│   ├── components/
│   │   ├── GeneratedImage.tsx  # Component for displaying generated images
│   │   ├── LoadingSpinner.tsx  # Loading indicator component
│   │   └── Navigation.tsx      # Navigation component
│   ├── generate/
│   │   └── page.tsx          # Image generation page
│   ├── logs/
│   │   └── page.tsx          # Logs visualization page
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

## Supabase Setup

This application uses Supabase for storing generation logs. You need to set up a Supabase database with the appropriate table structure:

1. **Create a Supabase Project**:

   - Go to [Supabase](https://supabase.com/) and sign up or log in
   - Create a new project
   - Note your project URL and service role key (you'll need these for the `.env.local` file)

2. **Create the Generation Logs Table**:
   - In your Supabase dashboard, navigate to the SQL Editor
   - Create a new query and paste the following SQL:

```sql
-- Create the generation_logs table
CREATE TABLE public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'processing', 'completed', 'failed')),
  step TEXT NOT NULL,
  details JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_generation_logs_request_id ON public.generation_logs(request_id);
CREATE INDEX idx_generation_logs_user_id ON public.generation_logs(user_id);
CREATE INDEX idx_generation_logs_status ON public.generation_logs(status);
CREATE INDEX idx_generation_logs_created_at ON public.generation_logs(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON public.generation_logs
  FOR ALL
  TO authenticated
  USING (true);

-- Create a policy that allows read-only access for anonymous users
CREATE POLICY "Allow read-only access for anonymous users"
  ON public.generation_logs
  FOR SELECT
  TO anon
  USING (true);
```

3. **Run the query** to create the table and set up the necessary indexes and security policies
