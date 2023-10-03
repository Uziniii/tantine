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

const channelSlice = createSlice({
  name: "channels",
  initialState: {} as Record<number | string, Channel>,
  reducers: {
    addChannel: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload;
      state[channel.id] = channel;

      return state;
    },
  },
});

export const { addChannel } = channelSlice.actions;

export default channelSlice.reducer;
