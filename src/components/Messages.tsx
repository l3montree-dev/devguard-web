import { UiText } from "@ory/client";

interface MessageProps {
  message: UiText;
}

export const Message = ({ message }: MessageProps) => {
  return <p data-testid={`ui/message/${message.id}`}>{message.text}</p>;
};

interface MessagesProps {
  messages?: Array<UiText>;
}

export const Messages = ({ messages }: MessagesProps) => {
  if (!messages) {
    // No messages? Do nothing.
    return null;
  }

  return (
    <div>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};
