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
  visibility: number;
  dayTurn: number;
  admins: number[];
  joinRequests: {
    id: number;
    userId: number;
  }[];
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

    editGroupDayTurn: (state, action: PayloadAction<{ channelId: number; dayTurn: number }>) => {
      const { channelId, dayTurn } = action.payload;
      
      const channel = state[channelId];

      if (channel.type !== "group") return state

      channel.dayTurn = dayTurn;
      return state;
    },

    removeMember: (
      state,
      action: PayloadAction<{
        channelId: string;
        memberId: number
      }>
    ) => {
      const { channelId, memberId } = action.payload;

      const channel = state[channelId];

      if (channel.type !== "group") return state;

      channel.users = channel.users.filter((id) => id !== memberId);

      return state;
    },
    removeChannel: (state, action: PayloadAction<number>) => {
      delete state[action.payload];

      return state;
    },
    addMembers: (
      state,
      action: PayloadAction<{
        channelId: number;
        membersIds: number[];
      }>
    ) => {
      const { channelId, membersIds } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.users.push(...membersIds);

      return state;
    },
    changeVisibility: (
      state,
      action: PayloadAction<{
        channelId: number;
        visibility: 0 | 1;
      }>
    ) => {
      const { channelId, visibility } = action.payload;
      const channel = state[channelId];
      
      if (channel && channel.type !== "group") return state;

      channel.visibility = visibility;

      return state;
    },
    addAdmin: (
      state,
      action: PayloadAction<{
        channelId: number;
        memberId: number;
      }>
    ) => {
      const { channelId, memberId } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.admins.push(memberId);

      return state;
    },
    addJoinRequest: (
      state,
      action: PayloadAction<{
        channelId: number;
        id: number;
        userId: number;
      }>
    ) => {
      const { channelId, userId, id } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.joinRequests.push({
        id,
        userId,
      });

      return state;
    },
    removeJoinRequest: (
      state,
      action: PayloadAction<{
        channelId: number;
        joinRequest: number;
      }>
    ) => {
      const { channelId, joinRequest } = action.payload;
      const channel = state[channelId];

      if (channel && channel.type !== "group") return state;

      channel.joinRequests = channel.joinRequests.filter((request) => request.id !== joinRequest);

      return state;
    }
  },
});

export const {
  addChannel,
  editGroupTitle,
  editGroupDayTurn,
  removeMember,
  removeChannel,
  addMembers,
  changeVisibility,
  addAdmin,
  addJoinRequest,
  removeJoinRequest,
} = channelsSlice.actions;

export default channelsSlice.reducer;
