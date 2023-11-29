import type { CommunityMessage, Message } from "../../../schema"
import { WebSocket } from "ws";
import z from "zod"
import { sendFactory } from "../helpers/event";

export const messageSchema = z.custom<Message>()
export const newGroupTitleSchema = z.object({
  title: z.string().trim().min(2).max(50),
  channelId: z.number(),
})
export const removeMemberSchema = z.object({
  channelId: z.string(),
  memberId: z.number()
})
export const addMemberSchema = z.object({
  channelId: z.string(),
  membersIds: z.array(z.number())
})
export const deleteGroupSchema = z.object({
  channelId: z.number(),
  users: z.array(z.number()),
})
export const changeVisibilitySchema = z.object({
  channelId: z.number(),
  visibility: z.number(),
})
export const memberJoinSchema = z.object({
  channelId: z.number(),
  userId: z.number(),
})
export const putAdminSchema = removeMemberSchema;
export const newGroupPictureSchema = z.object({
  channelId: z.number(),
  profilePicture: z.string(),
})
export const newProfilePictureSchema = z.object({
  userId: z.number(),
  profilePicture: z.string(),
})
export const communityMessageSchema = z.custom<CommunityMessage>()
export const sendJoinRequestSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number(),
  groupId: z.number(),
})
export const acceptJoinRequestSchema = z.object({
  channelId: z.number(),
  joinRequest: z.number(),
})
export const newGroupDayTurnSchema = z.object({
  channelId: z.number(),
  dayTurn: z.number(),
})

const allSchema = z.union([
  messageSchema,
  newGroupTitleSchema,
  removeMemberSchema,
  addMemberSchema,
  deleteGroupSchema,
  changeVisibilitySchema,
  memberJoinSchema,
  putAdminSchema,
  newGroupPictureSchema,
  newProfilePictureSchema,
  communityMessageSchema,
  sendJoinRequestSchema,
  acceptJoinRequestSchema,
  newGroupDayTurnSchema,
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
