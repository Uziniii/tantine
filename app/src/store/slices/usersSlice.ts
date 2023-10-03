import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
}

const usersSlice = createSlice({
  name: "users",
  initialState: {} as Record<number, User>,
  reducers: {
    addUsers: (state, action: PayloadAction<User[]>) => {
      for (const user of action.payload) {
        state[user.id] = user;
      }

      return state
    },
  },
});

export const { addUsers } = usersSlice.actions;

export default usersSlice.reducer;
