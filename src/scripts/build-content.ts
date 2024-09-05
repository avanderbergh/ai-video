import * as fal from "@fal-ai/serverless-client";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { slideSchema, videoSchema } from "../schemas";
import { fluxGuide, styleGuide } from "../prompts";
import { writeFile } from "fs/promises";

type FalResponse = {
  images: [
    {
      url: string;
      content_type: "image/jpeg";
    },
  ];
  prompt: string;
};

function base64ToBuffer(base64Image: string): Buffer {
  // Remove the metadata prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // Create a Buffer from the Base64 string
  const imageBuffer = Buffer.from(base64Data, "base64");

  return imageBuffer;
}

console.log("Building Content...");

const {
  object: { slides },
} = await generateObject({
  model: anthropic("claude-3-5-sonnet-20240620"),
  prompt: [
    "Your task is to create a slideshow with 5 slides.",
    "The slideshow is about developer stereotypes",
    "Each slide should be about a differnt type of developer",
    "Be creative and funny",
  ].join(". "),

  schema: z.object({
    slides: z.array(slideSchema),
  }),
});

let i = 0;

const video: z.infer<typeof videoSchema> = {
  scenes: [],
};

for (const slide of slides) {
  const { text } = await generateText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    prompt: [
      "Your task is to write a prompt to generate an image.",
      "The prompt is for the FLUX image model. Use the guide below to write an effective prompt",
      fluxGuide,
      "Here is the description of the image:",
      slide.description,
      "---",
      styleGuide,
      "Respond only with the prompt. Do not add any explanations",
      "Don't add headings, just write the prompt as a paragraph",
    ].join(". "),
  });

  console.log("=============");
  console.log(text);

  console.log("Generating image");

  const result = (await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: text,
      sync_mode: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  })) as FalResponse;

  const imageUrl = `image_${i++}.jpg`;

  await writeFile(`public/${imageUrl}`, base64ToBuffer(result.images[0].url));

  video.scenes.push({
    caption: slide.caption,
    imageUrl,
  });

  console.log("Done");
}

await writeFile("data/video.json", JSON.stringify(video, null, 2), "utf-8");
