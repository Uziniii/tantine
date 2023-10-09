import { WebSocket } from "ws";
import z from "zod"
import { Payload } from "../jwt";

export const messageSchemaEvent = z.object({
  type: z.literal("message"),
  payload: z.object({
    channelId: z.string(),
    content: z.string(),
    nonce: z.string(),
  })
})

export const otherEvent = z.object({
  type: z.literal("other"),
  payload: z.object({})
})

export const allEventsSchema = z.union([
  messageSchemaEvent,
  otherEvent
])

export interface IMapUser {
  id: number;
  ws: WebSocket;
}

export interface Args<Schema extends z.infer<typeof allEventsSchema>> {
  event: Schema;
  users: Map<string, IMapUser>;
  user: Payload;
  ws: WebSocket;
}
