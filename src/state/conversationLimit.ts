import { MAX_ACTIVE_NEW_CONVERSATIONS } from "../config/aynera";
import { countActiveNewConversations } from "./threads";

export function canOpenNewConversation() {
  return countActiveNewConversations() < MAX_ACTIVE_NEW_CONVERSATIONS;
}
