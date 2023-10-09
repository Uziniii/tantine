import { WebSocket } from "ws";
import z from "zod"

export const messageSchemaEvent = z.object({
  id: z.number(),
  channelId: z.number(),
  authorId: z.number(),
  content: z.string(),
  nonce: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface IMapUser {
  id: number;
  ws: WebSocket;
}

type AllSchema =
  | z.infer<typeof messageSchemaEvent>

export interface Args<Schema extends AllSchema> {
  payload: Schema;
  users: Map<string, IMapUser>;
  idToTokens: Map<string, Set<string>>;
}
