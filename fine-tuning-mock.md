# XGenLens Fine-tuning Interface Mock

## Create Fine-tuning Job Tab

![Fine-tuning Form](https://i.imgur.com/placeholder.png)

```
+-----------------------------------------------------------------------+
|                                                                       |
| XGenLens                                                              |
|                                                                       |
+-----------------------------------------------------------------------+
| Home | Generate | Logs | Fine-tune                                    |
+-----------------------------------------------------------------------+
|                                                                       |
| ← Model Fine-tuning                                                   |
|                                                                       |
+-----------------------------------------------------------------------+
| [Create Fine-tuning Job] | [Job Status]                               |
+-----------------------------------------------------------------------+
|                                                                       |
| Create a Fine-tuning Job                                              |
|                                                                       |
| Fine-tune a model on your custom dataset to improve performance on    |
| specific tasks. Upload your training data in JSONL format and         |
| configure the fine-tuning parameters.                                 |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
| Model*: [meta-llama/Llama-2-7b-chat-hf ▼]                             |
|                                                                       |
| Training File*: [Choose File] No file chosen                          |
|                                                                       |
| Validation File: [Choose File] No file chosen                         |
|                                                                       |
| [+ Advanced Options]                                                  |
|                                                                       |
| [Create Job]                                                          |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
| Fine-tuning Guide                                                     |
|                                                                       |
| Preparing Your Dataset                                                |
| Your training data should be in JSONL format, with each line          |
| containing a prompt and completion pair:                              |
|                                                                       |
| {"prompt": "What is the capital of France?", "completion": "The       |
| capital of France is Paris."}                                         |
| {"prompt": "Who wrote Romeo and Juliet?", "completion": "William      |
| Shakespeare wrote Romeo and Juliet."}                                 |
|                                                                       |
| Best Practices                                                        |
| • Include a diverse set of examples that cover the range of tasks     |
|   you want the model to perform.                                      |
| • Aim for at least 50-100 examples for basic fine-tuning, but more    |
|   examples generally lead to better results.                          |
| • Balance your dataset to avoid biasing the model toward certain      |
|   responses.                                                          |
| • Consider including a validation file to monitor the model's         |
|   performance during training.                                        |
|                                                                       |
| ...                                                                   |
+-----------------------------------------------------------------------+
```

## Job Status Tab

```
+-----------------------------------------------------------------------+
|                                                                       |
| XGenLens                                                              |
|                                                                       |
+-----------------------------------------------------------------------+
| Home | Generate | Logs | Fine-tune                                    |
+-----------------------------------------------------------------------+
|                                                                       |
| ← Model Fine-tuning                                                   |
|                                                                       |
+-----------------------------------------------------------------------+
| [Create Fine-tuning Job] | [Job Status]                               |
+-----------------------------------------------------------------------+
|                                                                       |
| Fine-tuning Job Status                                                |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
| Job Information                | Actions                              |
| -------------------------------+----------------------------------    |
| Job ID: ft-abc123def456        | [Refresh Status]                     |
| Status: [running]              |                                      |
| Model: meta-llama/Llama-2-7b   |                                      |
| Created: 2023-06-15 14:30:45   |                                      |
|                                |                                      |
+-----------------------------------------------------------------------+
|                                                                       |
| Job Events                                                            |
|                                                                       |
| Time                | Level  | Message                                |
| --------------------+--------+----------------------------------------|
| 2023-06-15 14:30:45 | [info] | Created fine-tuning job                |
| 2023-06-15 14:31:02 | [info] | Validating training file               |
| 2023-06-15 14:32:15 | [info] | Training file validated                |
| 2023-06-15 14:32:30 | [info] | Job queued. Waiting for resources      |
| 2023-06-15 14:35:10 | [info] | Job started                            |
| 2023-06-15 14:40:22 | [info] | Completed epoch 1/3                    |
| 2023-06-15 14:45:35 | [info] | Completed epoch 2/3                    |
|                                                                       |
+-----------------------------------------------------------------------+
```

## Advanced Options Expanded

```
+-----------------------------------------------------------------------+
|                                                                       |
| Model*: [meta-llama/Llama-2-7b-chat-hf ▼]                             |
|                                                                       |
| Training File*: [sample_training_data.jsonl] ✓                        |
|                                                                       |
| Validation File: [sample_validation_data.jsonl] ✓                     |
|                                                                       |
| [- Advanced Options]                                                  |
|                                                                       |
| Hyperparameters:                                                      |
|   Batch Size: [4]                                                     |
|   Learning Rate: [0.0002]                                             |
|   Number of Epochs: [3]                                               |
|   Warmup Ratio: [0.1]                                                 |
|   Weight Decay: [0.01]                                                |
|                                                                       |
| LoRA Settings:                                                        |
|   [✓] Use LoRA                                                        |
|   LoRA Rank (r): [8]                                                  |
|   LoRA Alpha: [16]                                                    |
|   LoRA Dropout: [0.05]                                                |
|                                                                       |
| Weights & Biases Integration:                                         |
|   W&B API Key: [••••••••••••••••]                                     |
|   W&B Project: [my-fine-tuning-project]                               |
|                                                                       |
| [Create Job]                                                          |
|                                                                       |
+-----------------------------------------------------------------------+
```

## Completed Job with Checkpoints

```
+-----------------------------------------------------------------------+
|                                                                       |
| Fine-tuning Job Status                                                |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
| Job Information                | Actions                              |
| -------------------------------+----------------------------------    |
| Job ID: ft-abc123def456        | [Refresh Status]                     |
| Status: [succeeded]            |                                      |
| Model: meta-llama/Llama-2-7b   |                                      |
| Created: 2023-06-15 14:30:45   |                                      |
| Finished: 2023-06-15 15:15:22  |                                      |
|                                |                                      |
+-----------------------------------------------------------------------+
|                                                                       |
| Job Events                                                            |
| ... (events table as shown above) ...                                 |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
| Checkpoints                                                           |
|                                                                       |
| Checkpoint ID: ckpt-123abc456def                                      |
| Created: 2023-06-15 15:15:10                                          |
|                                                                       |
| Files:                                                                |
| file-abc123 [Download]                                                |
| file-def456 [Download]                                                |
|                                                                       |
+-----------------------------------------------------------------------+
```
