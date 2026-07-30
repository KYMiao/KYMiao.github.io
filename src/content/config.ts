import { defineCollection, z } from "astro:content";

const entrySchema = z
  .object({
    title: z.string(),
    date: z.coerce.date().optional(),
    summary: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

export const collections = {
  publications: defineCollection({ schema: entrySchema }),
  photography: defineCollection({ schema: entrySchema }),
  blog: defineCollection({ schema: entrySchema }),
};
