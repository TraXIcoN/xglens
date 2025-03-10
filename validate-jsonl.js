// Script to validate JSONL files for fine-tuning
const fs = require("fs");
const readline = require("readline");

// Check if a file path was provided
if (process.argv.length < 3) {
  console.error("Usage: node validate-jsonl.js <path-to-jsonl-file>");
  process.exit(1);
}

const filePath = process.argv[2];

// Check if the file exists
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

async function validateJsonl(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let validLines = 0;
  let errors = [];

  console.log(`Validating file: ${filePath}`);

  for await (const line of rl) {
    lineNumber++;

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    try {
      // Parse the JSON
      const data = JSON.parse(line);

      // Check for messages array
      if (!data.messages || !Array.isArray(data.messages)) {
        errors.push(`Line ${lineNumber}: Missing or invalid 'messages' array`);
        continue;
      }

      // Check if messages array has at least 2 entries
      if (data.messages.length < 2) {
        errors.push(
          `Line ${lineNumber}: 'messages' array should have at least 2 entries (user and assistant)`
        );
        continue;
      }

      // Check each message
      let hasUserMessage = false;
      let hasAssistantMessage = false;

      for (const message of data.messages) {
        // Check for role
        if (!message.role) {
          errors.push(`Line ${lineNumber}: Message missing 'role' field`);
          continue;
        }

        // Check for content
        if (!message.content && message.content !== "") {
          errors.push(`Line ${lineNumber}: Message missing 'content' field`);
          continue;
        }

        // Check role values
        if (message.role === "user") {
          hasUserMessage = true;
        } else if (message.role === "assistant") {
          hasAssistantMessage = true;
        } else {
          errors.push(
            `Line ${lineNumber}: Invalid role '${message.role}'. Must be 'user' or 'assistant'`
          );
        }
      }

      // Check if both user and assistant messages are present
      if (!hasUserMessage) {
        errors.push(`Line ${lineNumber}: Missing 'user' message`);
      }

      if (!hasAssistantMessage) {
        errors.push(`Line ${lineNumber}: Missing 'assistant' message`);
      }

      // If we got here without errors, the line is valid
      if (hasUserMessage && hasAssistantMessage) {
        validLines++;
      }
    } catch (error) {
      errors.push(`Line ${lineNumber}: Invalid JSON - ${error.message}`);
    }
  }

  // Print results
  console.log("\nValidation Results:");
  console.log(`Total lines: ${lineNumber}`);
  console.log(`Valid examples: ${validLines}`);
  console.log(`Errors found: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
    console.log(
      "\nPlease fix these errors before using this file for fine-tuning."
    );
  } else {
    console.log("\nSuccess! This file is valid for fine-tuning.");
  }
}

validateJsonl(filePath).catch((error) => {
  console.error("Error validating file:", error);
  process.exit(1);
});
