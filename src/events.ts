// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

interface AssetVersionDeletedEvent {}

type Events = {
  assetVersionDeleted: AssetVersionDeletedEvent;
};

type Listener<T extends keyof Events> = {
  id: string;
  callback: (payload: Events[T]) => void;
};
class EventBus {
  private listeners: {
    [K in keyof Events]: Listener<K>[];
  } = {
    assetVersionDeleted: [],
  };
  public dispatch<E extends keyof Events>(event: {
    type: E;
    payload: Events[E];
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
    (this.listeners[eventType] as Listener<T>[]) = this.listeners[
      eventType
    ].filter((l) => l.id !== id);
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
