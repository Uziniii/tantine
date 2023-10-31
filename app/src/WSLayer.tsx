import { PropsWithChildren } from "react"
import { useAppDispatch, useAppSelector } from "./store/store"
import { trpc } from "./utils/trpc"
import useWebSocket from "react-use-websocket"
import { host } from "./utils/host"
import { allSchemaEvent } from "../schema"
import { createMessageEventFactory } from "./store/event/messageEvent"
import { newGroupTitleEventFactory } from "./store/event/channelEvent"

export default function WSLayer({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()
  const me = useAppSelector(state => state.me)
  const channels = useAppSelector(state => state.channels)
  const users = useAppSelector(state => state.users)
  const fetchChannel = trpc.channel.retrieve.useMutation()
  const fetchUsers = trpc.user.retrieve.useMutation()

  const { sendJsonMessage } = useWebSocket(`ws://${host}:3001/${me?.token}`, {
    onOpen() {
      sendJsonMessage({
        event: "init",
        payload: me?.token
      })
    },
    onError(event) {
      console.log(event)
    },
    shouldReconnect: () => true,
    async onMessage(ev: MessageEvent<string>) {
      let event = allSchemaEvent.safeParse(JSON.parse(ev.data));
      console.log(event);

      if (!event.success) return

      const { payload } = event.data

      interface EventsObj {
        [key: string]: (payload: any) => Promise<void> | void
      }

      const events: EventsObj = {
        "createMessage": createMessageEventFactory({
          dispatch,
          channels,
          users,
          fetchChannel,
          fetchUsers,
        }),
        "newGroupTitle": newGroupTitleEventFactory({
          dispatch,
        })
      } as const

      const eventFn = events[event.data.event]

      if (eventFn) {
        eventFn(payload)
      }
    },
    heartbeat: {
      message: "ping",
      interval: 25000,
    }
  });

  return children
}
