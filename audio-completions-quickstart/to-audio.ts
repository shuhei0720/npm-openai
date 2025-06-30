import { writeFileSync } from "node:fs";
import { AzureOpenAI } from "openai/index.mjs";
import {
    DefaultAzureCredential,
    getBearerTokenProvider,
  } from "@azure/identity";

// Set environment variables or edit the corresponding values here.
const endpoint: string = process.env.AZURE_OPENAI_ENDPOINT || "AZURE_OPENAI_ENDPOINT";
const deployment: string = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini-audio-preview"; 
const apiVersion: string = process.env.OPENAI_API_VERSION || "2025-01-01-preview"; 

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

    // Make the audio chat completions request
    const response = await client.chat.completions.create({ 
        model: "gpt-4o-mini-audio-preview", 
        modalities: ["text", "audio"], 
        audio: { voice: "alloy", format: "wav" }, 
        messages: [ 
        { 
            role: "user", 
            content: "Is a golden retriever a good family dog?" 
        } 
        ] 
    }); 

  // Inspect returned data 
  console.log(response.choices[0]); 

  // Write the output audio data to a file
  if (response.choices[0].message.audio) {
    writeFileSync( 
      "dog.wav", 
      Buffer.from(response.choices[0].message.audio.data, 'base64'), 
      { encoding: "utf-8" } 
    ); 
  } else {
    console.error("Audio data is null or undefined.");
  }
}

main().catch((err: Error) => {
  console.error("Error occurred:", err);
});

export { main };