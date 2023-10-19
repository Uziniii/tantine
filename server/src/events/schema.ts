import { WebSocket } from "ws";
import z from "zod"

export const messageSchemaEvent = z.object({
  event: z.literal("createMessage"),
  payload: z.object({
    id: z.number(),
    channelId: z.number(),
    authorId: z.number(),
    content: z.string(),
    nonce: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
})

const allSchema = messageSchemaEvent

export interface IMapUser {
  id: number;
  ws: WebSocket;
}


export type AllSchema = z.infer<typeof allSchema>

export interface Args<Schema extends AllSchema> {
  payload: Schema["payload"];
  users: Map<string, IMapUser>;
  idToTokens: Map<string, Set<string>>;
}
