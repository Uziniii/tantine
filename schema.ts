interface EventSchema<Payload> {
  event: string;
  payload: Payload;
}

export interface Message {
  id: number;
  channelId: number;
  authorId: number;
  content: string;
  nonce: number;
  createdAt: Date;
  updatedAt: Date;
  system: boolean;
  invite?: number | null;
  audioFile?: string | null;
}

export type CommunityMessage = Omit<Message, "channelId">

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
