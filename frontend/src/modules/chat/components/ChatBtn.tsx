import { Badge, IconButton } from "@material-ui/core";
import { IChatInteractor } from "../interactors/chatInteractor";
import { useChatState } from "../state/chat";
import ChatIcon from "@material-ui/icons/MailOutline";

interface Props {
  chatInteractor: IChatInteractor;
}

export const ChatBtn = (props: Props) => {
  const { chat, unreadCount } = useChatState();

  const toggleChatVisibility = () => {
    props.chatInteractor.toggleChatVisibility();
  };

  return (
    <IconButton onClick={() => toggleChatVisibility()} disabled={chat == null}>
      <Badge badgeContent={unreadCount} color="primary">
        <ChatIcon />
      </Badge>
    </IconButton>
  );
};
