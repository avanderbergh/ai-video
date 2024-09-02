import { z } from "zod";

export const slideSchema = z
  .object({
    description: z.string().describe("A description of the image in the slide"),
    caption: z.string().describe("The text that appears with the slide"),
  })
  .describe("A slide that appears in a video slideshow");

export const sceneSchema = z.object({
  caption: z.string(),
  imageUrl: z.string(),
});

export const videoSchema = z.object({
  scenes: z.array(sceneSchema),
});
