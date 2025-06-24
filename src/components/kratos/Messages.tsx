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

import { UiNode, UiNodeTextAttributes, UiText } from "@ory/client";
import Callout from "../common/Callout";

const Content = ({ node, attributes }: Props) => {
  switch (attributes.text.id) {
    case 1050015:
      // This text node contains lookup secrets. Let's make them a bit more beautiful!
      const secrets = (attributes.text.context as any).secrets.map(
        (text: UiText, k: number) => (
          <div
            key={k}
            data-testid={`node/text/${attributes.id}/lookup_secret`}
            className="col-xs-3"
          >
            {/* Used lookup_secret has ID 1050014 */}
            <code>{text.id === 1050014 ? "Used" : text.text}</code>
          </div>
        ),
      );
      return (
        <div
          className="container-fluid mt-4 rounded-sm bg-white p-2 text-sm dark:bg-slate-800"
          data-testid={`node/text/${attributes.id}/text`}
        >
          <div className="row">{secrets}</div>
        </div>
      );
  }

  return (
    <div
      className="mt-2 font-medium"
      data-testid={`node/text/${attributes.id}/text`}
    >
      {attributes.text.text}
    </div>
  );
};

interface MessageProps {
  message: UiText;
  attributes?: UiNodeTextAttributes;
}

const messageType2Intent = {
  error: "danger",
  success: "success",
  info: "info",
};

export const Message = ({ message }: MessageProps) => {
  const error = message.id === 1010016;
  console.log("error", error);
  if (error)
    return (
      <Callout intent="success">
        <p className="text-sm" data-testid={`ui/message/${message.id}`}>
          {message.text}
        </p>
      </Callout>
    );

  return (
    <p className="text-sm" data-testid={`ui/message/${message.id}`}>
      {message.text}
    </p>
  );
};

interface MessagesProps {
  messages?: Array<UiText>;
}

export const Messages = ({ messages }: MessagesProps) => {
  messages?.map((message) => {
    switch (message.id) {
      case 1010016:
        console.log("teststst!!!!!!!!!!!!");
        return (
          <>
            <Message key={message.id} message={message} />
          </>
        );
    }
  });

  if (!messages) {
    // No messages? Do nothing.
    return null;
  }
  return (
    <>
      {messages?.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </>
  );
};
