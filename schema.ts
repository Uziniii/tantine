interface EventSchema<Payload> {
  event: string;
  payload: Payload;
}

export interface Carousel {
  users: {
    id: number;
  }[];
  winnerId: number;
}

export interface NormalMessage {
  id: number;
  channelId: number;
  authorId: number;
  content: string;
  nonce: number;
  createdAt: Date;
  updatedAt: Date;
  system: false;
  invite?: number | null;
  audioFile?: string | null;
}

export interface SystemMessage {
  id: number;
  channelId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  system: true;
  carousel?: Carousel;
}

export type Message = NormalMessage | SystemMessage

export type CommunityMessage =
  | Omit<NormalMessage, "channelId" | "invite">
  | Omit<SystemMessage, "channelId" | "invite">;

interface NewGroupTitle {
  title: string;
  channelId: number;
}

interface NewGroupDayTurn {
  dayTurn: number;
  channelId: number;
}

export type AllSchemaEvent = 
  | EventSchema<Message>
  | EventSchema<NewGroupTitle>
  | EventSchema<NewGroupDayTurn>
  | EventSchema<undefined>
