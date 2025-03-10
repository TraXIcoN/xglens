// Test script to verify API connection
require("dotenv").config();
const axios = require("axios");

async function testConnection() {
  try {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      console.error("NEBIUS_API_KEY environment variable is not set");
      process.exit(1);
    }

    const baseURL =
      process.env.NEBIUS_API_ENDPOINT || "https://api.studio.nebius.com/v1/";
    console.log("Using API endpoint:", baseURL);

    console.log("Testing API connection...");

    // Try to list models
    try {
      const modelsResponse = await axios.get(`${baseURL}models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      console.log("Connection successful! Available models:");
      console.log(modelsResponse.data.data.map((model) => model.id));
    } catch (error) {
      console.error(
        "Error accessing models API:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Response data:", error.response?.data);
    }

    // Try to list fine-tuning jobs
    try {
      console.log("\nTesting fine-tuning API...");
      const jobsResponse = await axios.get(`${baseURL}fine_tuning/jobs`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      console.log(
        "Fine-tuning API accessible. Jobs:",
        jobsResponse.data.data.length
      );
    } catch (error) {
      console.error(
        "Error accessing fine-tuning API:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Response data:", error.response?.data);
    }

    // Try to list files
    try {
      console.log("\nTesting files API...");
      const filesResponse = await axios.get(`${baseURL}files`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      console.log(
        "Files API accessible. Files:",
        filesResponse.data.data.length
      );
    } catch (error) {
      console.error(
        "Error accessing files API:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Response data:", error.response?.data);
    }
  } catch (error) {
    console.error("Error testing API connection:", error);
  }
}

testConnection();
