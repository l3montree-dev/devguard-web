// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useRef,
} from "react";
import { StoreApi, useStore as useZustandStore } from "zustand";
import { createGlobalStore, GlobalStore } from "./globalStore";

export const StoreContext = createContext<StoreApi<GlobalStore> | null>(null);

export const StoreProvider: FunctionComponent<
  PropsWithChildren<{
    initialZustand: any;
  }>
> = ({ children, initialZustand }) => {
  const storeRef = useRef<ReturnType<typeof createGlobalStore>>();
  console.log("StoreProvider", initialZustand);
  if (!storeRef.current) {
    storeRef.current = createGlobalStore(initialZustand);
  } else {
    // merge the initial zustand state with the current state
    storeRef.current.setState((state) => {
      return {
        ...state,
        ...initialZustand,
      };
    });
  }

  console.log("Merged state", storeRef.current.getState());
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): GlobalStore;
export function useStore<T>(selector: (s: GlobalStore) => T): T;

export function useStore<T>(
  selector: (s: GlobalStore) => T = (s) => s as T,
): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider.");
  }

  return useZustandStore(store, selector);
}
