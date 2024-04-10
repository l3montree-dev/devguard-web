// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { Dispatch, SetStateAction, useEffect, useState } from "react";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// tablename is used for storing the visibility state in local storage
export function useColumnVisibility(tableName: string, initialState = {}) {
  const [visibleColumns, setVisibleColumns] =
    useState<Record<string, boolean>>(initialState);
  useEffect(() => {
    const storedColumns = localStorage.getItem(tableName);
    if (storedColumns) {
      setVisibleColumns(JSON.parse(storedColumns));
    }
  }, [tableName]);

  const set: Dispatch<SetStateAction<Record<string, boolean>>> = (updater) => {
    setVisibleColumns((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(tableName, JSON.stringify(updated));
      return { ...prev, ...updated };
    });
  };

  return {
    visibleColumns,
    setVisibleColumns: set,
  };
}
