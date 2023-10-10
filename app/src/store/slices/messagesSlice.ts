import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
}

export interface MessageStateSchema {
  messages: {
    [key: number]: Message;
  };
  position: number[];
}

interface State {
  [key: number]: MessageStateSchema
}

const messagesSlice = createSlice({
  name: "me",
  initialState: {} as State,
  reducers: {
    init: (
      state,
      action: PayloadAction<{
        channelId: number;
        messages: Message[]
      }>
    ) => {
      const { channelId, messages } = action.payload;
      
      state[channelId] = {
        messages: {},
        position: [],
      };

      for (const message of messages) {
        state[channelId].messages[+message.id] = message;
        state[channelId].position.push(+message.id);
      }

      return state
    },
  },
});

export const { init } = messagesSlice.actions;

export default messagesSlice.reducer;
