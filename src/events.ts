// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

interface AssetVersionDeletedEvent {}

type Events = {
  assetVersionDeleted: AssetVersionDeletedEvent;
};

type Listener = {
  id: string;
  callback: (payload: Events[keyof Events]) => void;
};
class EventBus {
  private listeners: {
    [key in keyof Events]: Listener[];
  } = {
    assetVersionDeleted: [],
  };
  public dispatch(event: {
    type: keyof Events;
    payload: Events[keyof Events];
  }) {
    const listeners = this.listeners[event.type] || [];

    for (const listener of listeners) {
      listener.callback(event.payload);
    }
  }

  public subscribe<T extends keyof Events>(
    id: string,
    eventType: T,
    callback: (payload: Events[T]) => void,
  ) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push({ id, callback });
  }

  public unsubscribe(id: string) {
    for (const eventType in this.listeners) {
      this.listeners[eventType as keyof Events] = this.listeners[
        eventType as keyof Events
      ].filter((listener) => listener.id !== id);
    }
  }
}

// THIS WILL ALWAYS BE A SINGLETON THANKS JAVASCRIPT
export const eventBus = new EventBus();
