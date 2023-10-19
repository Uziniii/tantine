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
}

export type AllSchemaEvent = EventSchema<Message>;
