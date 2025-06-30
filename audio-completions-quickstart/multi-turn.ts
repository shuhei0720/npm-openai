import { AzureOpenAI } from "openai/index.mjs";
import { promises as fs } from 'fs';
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
    DefaultAzureCredential,
    getBearerTokenProvider,
  } from "@azure/identity";

// Set environment variables or edit the corresponding values here.
const endpoint: string = process.env.AZURE_OPENAI_ENDPOINT || "AZURE_OPENAI_ENDPOINT";
const apiVersion: string = "2025-01-01-preview"; 
const deployment: string = "gpt-4o-mini-audio-preview"; 

// Keyless authentication 
const getClient = (): AzureOpenAI => {
    const credential = new DefaultAzureCredential();
    const scope = "https://cognitiveservices.azure.com/.default";
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    const client = new AzureOpenAI({
      endpoint: endpoint,
      apiVersion: apiVersion,
      azureADTokenProvider,
    });
    return client;
};

const client = getClient(); 

async function main(): Promise<void> {

    // Buffer the audio for input to the chat completion
    const wavBuffer = await fs.readFile("dog.wav"); 
    const base64str = Buffer.from(wavBuffer).toString("base64"); 

    // Initialize messages with the first turn's user input 
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Describe in detail the spoken audio input." 
          },
          { 
            type: "input_audio", 
            input_audio: { 
              data: base64str, 
              format: "wav" 
            } 
          }
        ]
      }
    ];

    // Get the first turn's response 

    const response = await client.chat.completions.create({ 
        model: "gpt-4o-mini-audio-preview",
        modalities: ["text", "audio"], 
        audio: { voice: "alloy", format: "wav" }, 
        messages: messages
    }); 

    console.log(response.choices[0]); 

    // Add a history message referencing the previous turn's audio by ID 
    messages.push({ 
        role: "assistant", 
        audio: response.choices[0].message.audio ? { id: response.choices[0].message.audio.id } : undefined
    });

    // Add a new user message for the second turn
    messages.push({ 
        role: "user", 
        content: [ 
            { 
              type: "text", 
              text: "Very concisely summarize the favorability." 
            } 
        ] 
    }); 

    // Send the follow-up request with the accumulated messages
    const followResponse = await client.chat.completions.create({ 
        model: "gpt-4o-mini-audio-preview",
        messages: messages
    });

    console.log(followResponse.choices[0].message.content); 
}

main().catch((err: Error) => {
  console.error("Error occurred:", err);
});

export { main };