import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface State {
  positions: number[]
  notifications: {
    [key: number]: number
  }
}

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    positions: [],
    notifications: {}
  } as State,
  reducers: {
    setPositions(state, action: PayloadAction<number[]>) {
      state.positions = action.payload;

      for (const position of action.payload) {
        state.notifications[position] = 0;
      }

      return state
    },
    addPosition(state, action: PayloadAction<number>) {
      state.positions.push(action.payload);
      state.notifications[action.payload] = 0;

      return state
    },
    toFirstPosition(state, action: PayloadAction<number>) {
      const id = action.payload;
      const pos = state.positions.indexOf(id)

      if (pos !== -1) {
        state.positions.splice(pos, 1);
      }

      state.positions.unshift(id);

      return state
    },
    addNotification(state, action: PayloadAction<number>) {
      const id = action.payload;

      state.notifications[id] += 1;
      const pos = state.positions.indexOf(id)

      if (pos !== -1) {
        state.positions.splice(pos, 1);
      }

      state.positions.unshift(id);

      return state
    },
    clearNotifications(state, action: PayloadAction<number>) {
      const id = action.payload;

      state.notifications[id] = 0;

      return state
    }
  },
});

export const {
  addNotification,
  setPositions,
  addPosition,
  toFirstPosition,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
