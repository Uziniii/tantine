import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  nonce?: number;
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
  name: "messages",
  initialState: {} as State,
  reducers: {
    init: (
      state,
      action: PayloadAction<{
        channelId: number;
        messages: Message[];
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
    addTemp: (
      state,
      action: PayloadAction<{
        channelId: number;
        nonce: number;
        message: Message;
      }>
    ) => {
      const { channelId, message } = action.payload;
      
      return state;
    },
    add: (
      state,
      action: PayloadAction<{
        channelId: number;
        nonce?: number;
        message: Message;
      }>
    ) => {
      const { channelId, message } = action.payload;
      state[channelId].messages[+message.id] = message;
      state[channelId].position.unshift(+message.id);
      return state;
    }
  },
});

export const { init, add: addMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
