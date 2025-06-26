// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { UiText } from "@ory/client";
import Callout from "../common/Callout";

interface MessageProps {
  message: UiText;
}

const messageType2Intent = {
  error: "danger",
  success: "success",
  info: "info",
};
export const Message = ({ message }: MessageProps) => {
  //to style a message, go to the devtool of you browser, then go to network and check flows, there then compare the message id and create a switch statement like below

  // 1010016 = You tried to sign in with \"<useremail>\", but that email is already used by another account. Sign in to your account with one of the options below to add your account \"<useremail>\" at \"gitlab\" as another way to sign in.

  switch (message.id) {
    case 1010016:
      return (
        <Callout intent="danger">
          <p className="text-sm" data-testid={`ui/message/${message.id}`}>
            {message.text}
          </p>
        </Callout>
      );

    default:
      return (
        <p className="text-sm" data-testid={`ui/message/${message.id}`}>
          {message.text}
        </p>
      );
  }
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
    <>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </>
  );
};
