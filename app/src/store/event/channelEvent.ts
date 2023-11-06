import { editGroupTitle, removeMember } from "../slices/channelsSlice";
import { AppDispatch } from "../store";

interface NewGroupTitleProps {
  dispatch: AppDispatch
}

export function newGroupTitleEventFactory ({
  dispatch,
}: NewGroupTitleProps) {
  return function event(payload: {
    title: string;
    channelId: number;
  }) {
    console.log(payload);
    
    dispatch(editGroupTitle(payload));
  }
}

interface RemoveMemberProps {
  dispatch: AppDispatch
}

export function removeMemberEventFactory ({
  dispatch
}: RemoveMemberProps) {
  return function event(payload: {
    memberId: number;
    channelId: string;
  }) {
    dispatch(removeMember(payload))
  }
}
