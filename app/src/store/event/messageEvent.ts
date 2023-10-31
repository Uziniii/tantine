import { Message } from "../../../../schema";
import { trpc } from "../../utils/trpc";
import { ChannelsState, addChannel } from "../slices/channelsSlice";
import { addMessage, removeTempMessage } from "../slices/messagesSlice";
import { UsersState, addUsers } from "../slices/usersSlice";
import { useAppDispatch } from "../store";

interface createMessageProps {
  dispatch: ReturnType<typeof useAppDispatch>;
  channels: ChannelsState;
  users: UsersState;
  fetchChannel: ReturnType<typeof trpc.channel.retrieve.useMutation>;
  fetchUsers: ReturnType<typeof trpc.user.retrieve.useMutation>;
}

export function createMessageEventFactory({
  dispatch,
  channels,
  users,
  fetchChannel,
  fetchUsers,
}: createMessageProps) {
  return async function event(payload: Message) {
    if (!channels[payload.channelId]) {
      const channel = await fetchChannel.mutateAsync({
        channelId: payload.channelId,
      });

      const toFetch: number[] = [];

      for (const id of channel.users) {
        if (users[id]) continue;

        toFetch.push(id);
      }

      const fetchedUsers = await fetchUsers.mutateAsync(toFetch);
      dispatch(addUsers(fetchedUsers));
      dispatch(addChannel(channel));
    }

    dispatch(
      addMessage({
        channelId: payload.channelId,
        message: {
          id: payload.id,
          authorId: payload.authorId,
          content: payload.content,
          createdAt: payload.createdAt.toString(),
          updatedAt: payload.updatedAt.toString(),
          system: payload.system,
        },
      })
    );

    dispatch(
      removeTempMessage({
        channelId: payload.channelId,
        nonce: payload.nonce,
      })
    );
  };
}
