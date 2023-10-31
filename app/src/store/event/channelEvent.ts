import { editGroupTitle } from "../slices/channelsSlice";
import { useAppDispatch } from "../store";

interface NewGroupTitleProps {
  dispatch: ReturnType<typeof useAppDispatch>
}

export function newGroupTitleEventFactory ({
  dispatch,
}: NewGroupTitleProps) {
  return function event(payload: {
    title: string;
    channelId: number;
  }) {
    dispatch(editGroupTitle(payload));
  }
}
