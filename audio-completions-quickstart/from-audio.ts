import { AzureOpenAI } from "openai";
import { writeFileSync } from "node:fs";
import { promises as fs } from 'fs';

// Set environment variables or edit the corresponding values here.
const endpoint: string = process.env.AZURE_OPENAI_ENDPOINT || "AZURE_OPENAI_ENDPOINT";
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

  // Buffer the audio for input to the chat completion
  const wavBuffer = await fs.readFile("dog.wav"); 
  const base64str = Buffer.from(wavBuffer).toString("base64"); 

  // Make the audio chat completions request
  const response = await client.chat.completions.create({ 
    model: "gpt-4o-mini-audio-preview",
    modalities: ["text", "audio"], 
    audio: { voice: "alloy", format: "wav" },
    messages: [ 
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
    ] 
  }); 

  console.log(response.choices[0]); 

  // Write the output audio data to a file
  if (response.choices[0].message.audio) {
      writeFileSync("analysis.wav", Buffer.from(response.choices[0].message.audio.data, 'base64'), { encoding: "utf-8" });
  }
  else {
      console.error("Audio data is null or undefined.");
}
}

main().catch((err: Error) => {
console.error("Error occurred:", err);
});

export { main };