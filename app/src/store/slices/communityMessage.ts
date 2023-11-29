import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface CommunityMessage {
  id: number;
  content: string;
  audioFile?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: number | null;
  nonce?: number;
  system: boolean;
  invite?: number | null;
}

interface State {
  init: boolean;
  messages: {
    [key: number | string]: CommunityMessage;
  };
  position: number[];
  temp: {
    [key: number | string]: CommunityMessage;
  };
}

const messagesSlice = createSlice({
  name: "messages",
  initialState: {} as State,
  reducers: {
    init: (
      state,
      action: PayloadAction<CommunityMessage[]>
    ) => {
      if (state.init) return state;

      const messages = action.payload;

      for (const message of messages) {
        state.messages[+message.id] = message;
        state.position.push(+message.id);
      }

      return state;
    },
    addTemp: (
      state,
      action: PayloadAction<{
        nonce: number;
        message: CommunityMessage;
      }>
    ) => {
      const { message } = action.payload;

      if (!message.nonce || !state.init) return state;

      state.position.unshift(message.nonce);
      state.temp[message.nonce] = message;

      return state;
    },
    removeTemp: (
      state,
      action: PayloadAction<number>
    ) => {
      if (!state.init) return state;

      const nonce = action.payload;

      delete state.temp[nonce];

      return state;
    },
    add: (
      state,
      action: PayloadAction<{
        nonce?: number;
        message: CommunityMessage;
      }>
    ) => {
      if (!state.init) return state;

      const { message } = action.payload;

      if (message.nonce) {
        delete state.temp[message.nonce];
      }

      if (state.messages[+message.id]) return state;

      state.messages[+message.id] = message;
      state.position.unshift(+message.id);
      return state;
    },
  },
});

export const {
  init: initCommunityMessages,
  add: addCommunityMessage,
  addTemp: addCommunityTempMessage,
  removeTemp: removeCommunityTempMessage,
} = messagesSlice.actions;

export default messagesSlice.reducer;
