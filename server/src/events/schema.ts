import type { Message } from "../../../schema"
import { WebSocket } from "ws";
import z from "zod"

export const messageSchema = z.custom<Message>()

const allSchema = messageSchema

export interface IMapUser {
  id: number;
  ws: WebSocket;
}

type AllSchema = z.infer<typeof allSchema>;

export interface Args<Schema extends AllSchema> {
  payload: Schema;
  users: Map<string, IMapUser>;
  idToTokens: Map<string, Set<string>>;
}
