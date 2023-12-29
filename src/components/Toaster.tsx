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
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import EventEmitter from "events";
import React, { Fragment, useEffect } from "react";

export interface ToastMsg {
  msg: string;
  title: string;
  intent: "info" | "success" | "warning" | "error";
}

const toasterEventEmitter = new EventEmitter();

export const toast = (msg: ToastMsg) => {
  toasterEventEmitter.emit("msg", msg);
};
const getIcon = (type: ToastMsg["intent"]) => {
  switch (type) {
    case "info":
      return <InformationCircleIcon className="w-6 h-6 text-blue-600" />;
    case "success":
      return (
        <CheckCircleIcon
          className="w-6 h-6 text-green-600"
          aria-hidden="true"
        />
      );
    case "warning":
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
    case "error":
      return (
        <ExclamationCircleIcon
          className="w-6 h-6 text-red-600"
          aria-hidden="true"
        />
      );
  }
};

const Msg = ({
  msg,
  intent: intent,
  title,
  onRemove,
}: ToastMsg & { onRemove: () => void }) => {
  const [show, setShow] = React.useState(true);
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="flex flex-row p-4 items-start">
          <div className="flex-shrink-0">{getIcon(intent)}</div>
          <div className="ml-3  flex-1 pt-0.5">
            <p className="font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-slate-700">{msg}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              onClick={() => {
                setShow(false);
                setTimeout(onRemove, 1000);
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};
const Toaster = () => {
  const [msgs, setMsgs] = React.useState<Array<ToastMsg & { id: string }>>([]);

  useEffect(() => {
    const listener = (msg: ToastMsg) => {
      setMsgs((msgs) => [...msgs, { ...msg, id: Date.now().toString() }]);
    };
    toasterEventEmitter.addListener("msg", listener);
    return () => {
      toasterEventEmitter.removeListener("msg", listener);
    };
  }, []);
  return (
    <div className="fixed flex flex-col gap-2 right-4 top-4 toaster">
      {msgs.map((msg, i) => (
        <Msg
          key={msg.id}
          {...msg}
          onRemove={() => {
            setMsgs((msgs) => msgs.filter((_, j) => j !== i));
          }}
        />
      ))}
    </div>
  );
};

export default Toaster;
