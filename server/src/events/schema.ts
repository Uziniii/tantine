import type { Message } from "../../../schema"
import { WebSocket } from "ws";
import z from "zod"
import { sendFactory } from "../helpers/event";

export const messageSchema = z.custom<Message>()
export const newGroupTitleSchema = z.object({
  title: z.string().trim().min(2).max(50),
  channelId: z.number(),
})

const allSchema = z.union([
  messageSchema,
  newGroupTitleSchema
]);

export interface IMapUser {
  id: number;
  ws: WebSocket;
}

type AllSchema = z.infer<typeof allSchema>;

export type IdToTokens = Map<string, Set<string>>;
export type UsersMap = Map<string, IMapUser>;

export interface Args<Schema extends AllSchema> {
  payload: Schema;
  users: UsersMap;
  idToTokens: IdToTokens;
  sendToIds: ReturnType<typeof sendFactory>;
}
