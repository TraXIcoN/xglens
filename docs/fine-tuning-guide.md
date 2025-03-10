# Fine-tuning the Prompt Enhancement Model

This guide explains how to fine-tune the Meta-Llama-3.1-8B-Instruct model used for prompt enhancement in XGenLens.

## Prerequisites

1. Access to Nebius AI Studio
2. An API key with fine-tuning permissions
3. A dataset of prompt pairs (original and enhanced)

## Creating a Fine-tuning Dataset

The dataset should be in JSONL format with pairs of prompts and their enhanced versions. Here's an example:

```jsonl
{"messages": [{"role": "system", "content": "You are an expert at crafting optimal prompts for text-to-image AI models."}, {"role": "user", "content": "Please enhance this image generation prompt: 'A cat sitting on a windowsill'"}, {"role": "assistant", "content": "{\"enhancedPrompt\": \"A fluffy tabby cat sitting gracefully on a wooden windowsill, bathed in warm afternoon sunlight streaming through a partially open window, with delicate dust particles visible in the light beams, photorealistic style, soft focus, 8k resolution\", \"negativePrompt\": \"blurry, low quality, distorted proportions, unrealistic features, oversaturated colors, harsh lighting\", \"explanation\": \"I've added details about the cat's appearance, the lighting conditions, and the atmosphere. I've also specified a photorealistic style and high resolution for better quality. The negative prompt helps avoid common issues in AI-generated images.\"}"}]}
{"messages": [{"role": "system", "content": "You are an expert at crafting optimal prompts for text-to-image AI models."}, {"role": "user", "content": "Please enhance this image generation prompt: 'Mountain landscape'"}, {"role": "assistant", "content": "{\"enhancedPrompt\": \"Majestic snow-capped mountain range at sunrise, dramatic peaks reflecting golden-pink light, crystal-clear alpine lake in the foreground, lush pine forests on lower slopes, wispy clouds around summits, ultra-detailed landscape photography, crisp focus\", \"negativePrompt\": \"cartoon style, flat colors, blurry, oversaturated, unrealistic proportions, poor composition, low resolution\", \"explanation\": \"I've expanded the basic concept with specific details about lighting, foreground elements, and atmospheric conditions. I've also specified a photographic style for realism and added composition elements.\"}"}]}
```

## Fine-tuning Process

1. **Prepare your environment**:

   ```bash
   export NEBIUS_API_KEY=your_api_key
   ```

2. **Upload your dataset to Nebius AI Studio**:

   You can do this through the web interface or programmatically.

3. **Create a fine-tuning job**:

   ```javascript
   const OpenAI = require("openai");

   const client = new OpenAI({
     baseURL: "https://api.studio.nebius.com/v1/",
     apiKey: process.env.NEBIUS_API_KEY,
   });

   async function createFineTuningJob() {
     try {
       const response = await client.fineTuning.jobs.create({
         training_file: "file-abc123", // Replace with your file ID
         model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
         hyperparameters: {
           n_epochs: 3,
           batch_size: 4,
           learning_rate_multiplier: 2,
         },
       });

       console.log("Fine-tuning job created:", response);
     } catch (error) {
       console.error("Error creating fine-tuning job:", error);
     }
   }

   createFineTuningJob();
   ```

4. **Monitor the fine-tuning job**:

   ```javascript
   async function getFineTuningJob(jobId) {
     try {
       const response = await client.fineTuning.jobs.retrieve(jobId);
       console.log("Job status:", response.status);
       console.log("Job details:", response);
     } catch (error) {
       console.error("Error retrieving job:", error);
     }
   }
   ```

5. **Use the fine-tuned model**:

   Once the fine-tuning is complete, update the model name in `src/utils/prompt-enhancer.ts`:

   ```typescript
   const response = await client.chat.completions.create({
     // ... other parameters
     model:
       "ft:meta-llama/Meta-Llama-3.1-8B-Instruct:your-org:your-model-name:1234",
     // ... rest of the parameters
   });
   ```

## Evaluation

To evaluate the fine-tuned model:

1. Create a test set of prompts not used in training
2. Compare the enhanced prompts from both the base and fine-tuned models
3. Generate images using both sets of prompts and compare the results
4. Collect user feedback on which enhanced prompts produce better images

## Tips for Better Fine-tuning

1. **Diverse Dataset**: Include a wide variety of prompt types and styles
2. **Consistent Format**: Ensure all responses follow the same JSON structure
3. **Quality over Quantity**: A smaller, high-quality dataset is better than a large, noisy one
4. **Iterative Approach**: Start with a small number of epochs and increase as needed
5. **Validation**: Use a validation set to prevent overfitting

## Resources

- [Nebius AI Studio Documentation](https://docs.nebius.ai/studio/fine-tuning/how-to-fine-tune-a-model)
- [Meta Llama 3.1 Model Card](https://ai.meta.com/llama/)
