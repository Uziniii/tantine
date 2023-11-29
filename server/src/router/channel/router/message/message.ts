import { retrieveCommunityMessage } from './function/retrieveCommunityMessage';
import { createCommunityMessage } from './function/createCommunityMessage';
import { retrieveMessages } from './function/retrieveMessages';
import { create } from './function/create';
import { router } from "@/trpc";

export const messageRouter = router({
  create,
  retrieveMessages,
  createCommunityMessage,
  retrieveCommunityMessage,
});
