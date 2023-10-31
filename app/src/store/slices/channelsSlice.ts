import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Private {
  id: number;
  type: "private";
  users: number[];
}

interface Group {
  id: number;
  type: "group";
  users: number[];
  title: string;
  description: string;
  authorId: number;
}

export type Channel = Private | Group;

export type ChannelsState = Record<number | string, Channel>

const channelsSlice = createSlice({
  name: "channels",
  initialState: {} as ChannelsState,
  reducers: {
    addChannel: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload;
      state[channel.id] = channel;

      return state;
    },
    editGroupTitle: (state, action: PayloadAction<{ channelId: number; title: string }>) => {
      const { channelId, title } = action.payload;
      
      const channel = state[channelId];

      if (channel.type !== "group") return state

      channel.title = title;
      return state;
    },
  },
});

export const { addChannel, editGroupTitle } = channelsSlice.actions;

export default channelsSlice.reducer;
