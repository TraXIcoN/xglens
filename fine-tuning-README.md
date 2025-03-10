# XGenLens Fine-tuning Feature

This document provides detailed instructions on how to use the fine-tuning feature in XGenLens.

## Overview

The fine-tuning feature allows you to customize large language models (LLMs) for specific tasks by training them on your own data. This can improve performance for domain-specific applications, such as:

- Customizing prompt enhancement for specific image generation styles
- Training models to follow specific formatting guidelines
- Improving performance on domain-specific knowledge

## Prerequisites

Before using the fine-tuning feature, ensure you have:

1. A Nebius Studio API key set in your environment variables as `NEBIUS_API_KEY`
2. Prepared your training data in JSONL format
3. Optionally, prepared validation data in JSONL format

## Preparing Your Data

### Data Format

Your training and validation data should be in JSONL format, with each line containing a JSON object with a `messages` array. Each message should have a `role` and `content` field:

```json
{"messages": [{"role": "user", "content": "What is the capital of France?"}, {"role": "assistant", "content": "The capital of France is Paris."}]}
{"messages": [{"role": "user", "content": "Who wrote Romeo and Juliet?"}, {"role": "assistant", "content": "William Shakespeare wrote Romeo and Juliet."}]}
```

This format follows the OpenAI chat completion format, where:

- `role` can be "user" or "assistant"
- `content` contains the text of the message

### Sample Files

We've provided sample files to help you get started:

- `sample_training_data.jsonl`: Contains 10 example message pairs for training
- `sample_validation_data.jsonl`: Contains 5 example message pairs for validation

You can use these as templates for creating your own datasets.

### Validating Your Data

We've provided a validation script to help you check your JSONL files before uploading them:

```bash
node validate-jsonl.js your-training-data.jsonl
```

This script will:

- Check that each line is valid JSON
- Verify that each example has a `messages` array
- Ensure each message has the required `role` and `content` fields
- Confirm that both "user" and "assistant" roles are present in each example

If any errors are found, the script will provide detailed information to help you fix them.

## File Processing

When you upload files for fine-tuning, they go through a processing stage before they can be used. This is important to understand:

1. **Upload**: When you upload a file, it's first sent to the Nebius Studio API.
2. **Processing**: The API then processes the file to validate its format and prepare it for fine-tuning.
3. **Ready State**: Only after processing is complete can the file be used for fine-tuning.

The processing time can vary from a few seconds to several minutes depending on file size and server load. If you attempt to create a fine-tuning job before the file is fully processed, you'll receive a "file not ready yet" error.

### Handling Processing Delays

If you encounter a "file not ready yet" error:

1. Wait a few moments (30-60 seconds) and try submitting the form again.
2. The application will automatically attempt to wait for file processing, but in some cases, you may need to retry manually.
3. For large files, it may take longer for processing to complete.

## Using the Fine-tuning Interface

1. **Navigate to the Fine-tune Page**:

   - Click on "Fine-tune" in the main navigation

2. **Create a Fine-tuning Job**:

   - Select a model from the dropdown
   - Upload your training data file (JSONL format)
   - Optionally upload a validation data file (JSONL format)
   - Click "Create Job"

3. **Advanced Options** (optional):

   - Click "Show Advanced Options" to configure hyperparameters:
     - Batch Size: Number of samples processed in each training step
     - Learning Rate: Controls how quickly the model adapts to the training data
     - Number of Epochs: How many times the model will see each example during training

4. **Monitor Job Status**:

   - After creating a job, you'll be redirected to the status page
   - The status page shows:
     - Job information (ID, status, model, creation time)
     - Job events (progress updates)
     - Checkpoints (when the job completes)

5. **Download Checkpoints**:
   - When a job completes successfully, you can download the checkpoint files
   - These files can be used to deploy your fine-tuned model

## API Implementation Notes

The fine-tuning feature uses direct API calls to the Nebius Studio API using axios instead of the OpenAI client library. This approach was chosen to address compatibility issues with the Nebius API endpoints.

### Key Implementation Details:

1. **File Uploads**: Files are uploaded using a multipart form request with axios
2. **API Authentication**: All requests include the Nebius API key in the Authorization header
3. **Error Handling**: Detailed error information is captured and displayed to help troubleshoot issues

If you encounter API-related errors, the application will log detailed information to the console, including:

- HTTP status codes
- Response data
- Request parameters

### Testing API Connectivity

You can test your API connectivity using the provided test script:

```bash
node test-api-connection.js
```

This script will check:

- Connection to the models endpoint
- Connection to the fine-tuning jobs endpoint
- Connection to the files endpoint

## Troubleshooting

If you encounter errors during the fine-tuning process:

1. **API Connection Issues**:

   - Verify your `NEBIUS_API_KEY` is set correctly
   - Run the `test-api-connection.js` script to check connectivity

2. **File Format Issues**:

   - Ensure your JSONL files are properly formatted with the `messages` array
   - Each message must have a `role` ("user" or "assistant") and `content` field
   - Check for any syntax errors in your JSON

3. **400 or 422 Errors**:

   - This typically indicates an issue with the request parameters or file format
   - Check that your model name is valid and supports fine-tuning
   - Ensure your training file has been properly uploaded and processed
   - Verify that your JSONL format follows the exact structure shown above

4. **File Processing Issues**:

   - Files must be processed before they can be used for fine-tuning
   - Check the file status using the API
   - If a file is stuck in processing, try uploading it again

5. **Other Issues**:
   - Check the console logs for detailed error messages
   - Verify that your files are not too large (keep under 100MB)

## Best Practices

1. **Data Quality**:

   - Include diverse examples that cover the range of tasks you want the model to perform
   - Aim for at least 50-100 examples for basic fine-tuning
   - Balance your dataset to avoid biasing the model

2. **Hyperparameters**:

   - Start with the default hyperparameters
   - For larger datasets, you may need to increase the batch size
   - Lower learning rates (0.0001-0.0005) are more stable but train slower

3. **Validation**:

   - Always include a validation file to monitor the model's performance
   - The validation file should represent the types of queries you expect in production

4. **Iterative Approach**:
   - Start with a smaller model for faster iterations
   - Test the fine-tuned model and refine your dataset based on results
   - Gradually move to larger models as needed

## API Reference

The fine-tuning feature is built on top of the Nebius Studio API. For more details, refer to the API documentation.

### Endpoints

- `POST /api/fine-tune`: Create a new fine-tuning job
- `GET /api/fine-tune?jobId={jobId}&action=status`: Get job status
- `GET /api/fine-tune?jobId={jobId}&action=events`: Get job events
- `GET /api/fine-tune?jobId={jobId}&action=checkpoints`: Get job checkpoints
- `GET /api/fine-tune?jobId={jobId}&action=download&fileId={fileId}`: Download checkpoint file
