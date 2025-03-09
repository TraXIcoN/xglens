// Environment variable validation

export function validateEnv() {
  const requiredEnvVars = ["NEBIUS_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(
      `Warning: Missing required environment variables: ${missingEnvVars.join(
        ", "
      )}`
    );

    // In development, provide more helpful information
    if (process.env.NODE_ENV === "development") {
      console.info(`
Create a .env.local file with the following variables:

NEBIUS_API_KEY=your_nebius_api_key
NEBIUS_API_ENDPOINT=https://api.studio.nebius.com/v1/
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
      `);
    }

    return false;
  }

  return true;
}
