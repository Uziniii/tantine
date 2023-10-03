import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
}

const channelSlice = createSlice({
  name: "channels",
  initialState: {} as Record<number, User>,
  reducers: {
    addUsers: (state, action: PayloadAction<User[]>) => {
      for (const user of action.payload) {
        state[user.id] = user;
      }

      return state;
    },
  },
});

export const { addUsers } = channelSlice.actions;

export default channelSlice.reducer;
