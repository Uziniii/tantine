import z from "zod"

const messageSchemaEvent = z.object({
  event: z.literal("createMessage"),
  payload: z.object({
    id: z.number(),
    channelId: z.number(),
    authorId: z.number(),
    content: z.string(),
    nonce: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const allSchema = messageSchemaEvent;
