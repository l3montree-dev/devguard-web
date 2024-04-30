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
import { Popover, Transition } from "@headlessui/react";
import {
  Fragment,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { classNames } from "../../utils/common";

interface Props {
  Button: ReactNode;
}

const PopupMenu: FunctionComponent<PropsWithChildren<Props>> = ({
  Button,
  children,
}) => {
  // calculate to which side is more space.
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Record<string, any>>({
    top: 0,
    left: 0,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (buttonRef.current) {
      // calculate if there is more space to the left or to the right
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const spaceLeft = buttonRect.left;
      const spaceRight = windowWidth - buttonRect.right;

      const newStyle: Record<string, any> = {};

      if (spaceLeft > spaceRight) {
        // more space to the left
        newStyle.right = 0;
      } else {
        // more space to the right
        newStyle.left = 0;
      }

      setPosition(newStyle);
    }
  }, []);
  return (
    <>
      <div className={"relative"}>
        <div
          role="button"
          className="cursor-pointer"
          onClick={() => setIsOpen((s) => !s)}
          ref={buttonRef}
        >
          {Button}
        </div>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div
            style={position}
            className={classNames("popover-panel absolute mt-2")}
          >
            <div className="flex-auto overflow-hidden rounded-md border bg-white p-1 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {children}
            </div>
          </div>
        </Transition>
      </div>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-10"
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default PopupMenu;
