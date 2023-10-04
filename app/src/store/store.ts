import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import loginReducer from "./slices/loginSlice";
import usersReducer from "./slices/usersSlice";
import channelsSlice from "./slices/channelsSlice";
import meSlice from "./slices/meSlice";

export const store = configureStore({
  reducer: {
    me: meSlice,
    login: loginReducer,
    users: usersReducer,
    channels: channelsSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
