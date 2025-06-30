import { writeFileSync } from "node:fs";
import { AzureOpenAI } from "openai/index.mjs";

// Set environment variables or edit the corresponding values here.
const endpoint: string = process.env.AZURE_OPENAI_ENDPOINT || "AZURE_OPENAI_ENDPOINT";
console.log(endpoint)
const apiKey: string = process.env.AZURE_OPENAI_API_KEY || "AZURE_OPENAI_API_KEY";
const apiVersion: string = "2025-01-01-preview"; 
const deployment: string = "gpt-4o-mini-audio-preview"; 

const client = new AzureOpenAI({ 
  endpoint, 
  apiKey, 
  apiVersion, 
  deployment 
});  

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