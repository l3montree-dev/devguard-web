// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export class HttpError extends Error {
  statusCode?: number;
  title?: string;
  description?: string;
  homeLink?: string;

  constructor(
    message = "HTTP Error",
    options?: {
      statusCode?: number;
      title?: string;
      description?: string;
      homeLink?: string;
    },
  ) {
    // Encode error context in the message so it survives serialization to client
    const contextData = {
      statusCode: options?.statusCode,
      title: options?.title,
      description: options?.description,
      homeLink: options?.homeLink,
    };
    super(JSON.stringify({ message, context: contextData }));
    this.statusCode = options?.statusCode;
    this.title = options?.title;
    this.description = options?.description;
    this.homeLink = options?.homeLink;
  }
}
