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

import {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  UiNode,
  UpdateLoginFlowBody,
  UpdateRecoveryFlowBody,
  UpdateRegistrationFlowBody,
  UpdateSettingsFlowBody,
  UpdateVerificationFlowBody,
  VerificationFlow,
} from "@ory/client";
import { getNodeId, isUiNodeInputAttributes } from "@ory/integrations/ui";
import { Component, FormEvent, MouseEvent } from "react";

import { Messages } from "./Messages";
import { Node } from "./Node";

export type Values = Partial<
  | UpdateLoginFlowBody
  | UpdateRegistrationFlowBody
  | UpdateRecoveryFlowBody
  | UpdateSettingsFlowBody
  | UpdateVerificationFlowBody
>;

export type Methods =
  | "oidc"
  | "password"
  | "profile"
  | "totp"
  | "webauthn"
  | "link"
  | "lookup_secret";

export type Props<T> = {
  // The flow
  flow?:
    | LoginFlow
    | RegistrationFlow
    | SettingsFlow
    | VerificationFlow
    | RecoveryFlow;
  // Only show certain nodes. We will always render the default nodes for CSRF tokens.
  only?: Methods;
  // Is triggered on submission
  onSubmit: (values: T) => Promise<void>;
  // Do not show the global messages. Useful when rendering them elsewhere.
  hideGlobalMessages?: boolean;
};

function emptyState<T>() {
  return {} as T;
}

type State<T> = {
  values: T;
  isLoading: boolean;
};

export class Flow<T extends Values> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      values: emptyState(),
      isLoading: false,
    };
  }

  componentDidMount() {
    this.initializeValues(this.filterNodes());
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (prevProps.flow !== this.props.flow) {
      // Flow has changed, reload the values!
      this.initializeValues(this.filterNodes());
    }
  }

  initializeValues = (nodes: Array<UiNode> = []) => {
    // Compute the values
    const values = emptyState<T>();
    nodes.forEach((node) => {
      // This only makes sense for text nodes
      if (isUiNodeInputAttributes(node.attributes)) {
        if (
          node.attributes.type === "button" ||
          node.attributes.type === "submit"
        ) {
          // In order to mimic real HTML forms, we need to skip setting the value
          // for buttons as the button value will (in normal HTML forms) only trigger
          // if the user clicks it.
          return;
        }
        values[node.attributes.name as keyof Values] = node.attributes.value;
      }
    });

    // Set all the values!
    this.setState((state) => ({ ...state, values }));
  };

  filterNodes = (): Array<UiNode> => {
    const { flow, only } = this.props;
    if (!flow) {
      return [];
    }
    return flow.ui.nodes.filter(({ group }) => {
      if (!only) {
        return true;
      }
      if (only === "oidc") {
        return group === "oidc";
      }
      return group === "default" || group === only;
    });
  };

  // Handles form submission
  handleSubmit = (event: FormEvent<HTMLFormElement> | MouseEvent) => {
    // Prevent all native handlers
    event.stopPropagation();
    event.preventDefault();

    // Prevent double submission!
    if (this.state.isLoading) {
      return Promise.resolve();
    }

    const form = event.currentTarget;

    let body: T | undefined;

    if (form && form instanceof HTMLFormElement) {
      const formData = new FormData(form);

      // map the entire form data to JSON for the request body
      body = Object.fromEntries(formData) as T;

      const hasSubmitter = (evt: any): evt is { submitter: HTMLInputElement } =>
        "submitter" in evt;

      // We need the method specified from the name and value of the submit button.
      // when multiple submit buttons are present, the clicked one's value is used.
      if (hasSubmitter(event.nativeEvent)) {
        const method = event.nativeEvent.submitter;
        body = {
          ...body,
          ...{ [method.name]: method.value },
        };
      }
    }

    this.setState((state) => ({
      ...state,
      isLoading: true,
    }));

    return this.props
      .onSubmit({ ...body, ...this.state.values })
      .finally(() => {
        // We wait for reconciliation and update the state after 50ms
        // Done submitting - update loading status
        this.setState((state) => ({
          ...state,
          isLoading: false,
        }));
      });
  };

  render() {
    const { hideGlobalMessages, flow } = this.props;
    const { values, isLoading } = this.state;

    // Filter the nodes - only show the ones we want
    const nodes = this.filterNodes();

    if (!flow) {
      // No flow was set yet? It's probably still loading...
      //
      // Nodes have only one element? It is probably just the CSRF Token
      // and the filter did not match any elements!
      return null;
    }

    return (
      <form
        action={flow.ui.action}
        method={flow.ui.method}
        onSubmit={this.handleSubmit}
      >
        {nodes.map((node, k) => {
          const id = getNodeId(node) as keyof Values;
          return (
            <Node
              key={`${id}-${k}`}
              disabled={isLoading}
              node={node}
              value={values[id]}
              dispatchSubmit={this.handleSubmit}
              setValue={(value) =>
                new Promise((resolve) => {
                  this.setState(
                    (state) => ({
                      ...state,
                      values: {
                        ...state.values,
                        [getNodeId(node)]: value,
                      },
                    }),
                    resolve,
                  );
                })
              }
            />
          );
        })}
        {!hideGlobalMessages ? (
          <div className="mt-6">
            <Messages messages={flow.ui.messages} />
          </div>
        ) : null}
      </form>
    );
  }
}
