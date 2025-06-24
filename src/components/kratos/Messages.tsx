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
import Carriage from "../common/Carriage";

interface MessageProps {
  message: UiText;
}

const messageType2Intent = {
  error: "danger",
  success: "success",
  info: "info",
};
export const Message = ({ message }: MessageProps) => {
  return (
    <>
      <Callout intent="danger">
        <div className="flex flex-row gap-4">
          <p className="flex-1" data-testid={`ui/message/${message.id}`}>
            {message.text}
            <div className="mr-2 inline-block w-10"></div>
          </p>
        </div>
      </Callout>
    </>
  );
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
