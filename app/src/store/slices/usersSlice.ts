import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export type UsersState = Record<number | string, User>;

const usersSlice = createSlice({
  name: "users",
  initialState: {} as UsersState,
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
