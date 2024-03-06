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
import { useId } from "react";
import { FieldError } from "react-hook-form";

type Props = {
  label?: string;
  Element: (id: string) => JSX.Element;
  error?: FieldError;
  className?: string;
};
const FormField = (props: Props) => {
  const { label, Element, error, className } = props;
  const id = useId();

  return (
    <div className={className}>
      {Boolean(label) && (
        <label htmlFor={id} className="block text-sm font-medium leading-6">
          {label}
        </label>
      )}
      {Element(id)}
      {error && <small className="text-sm text-red-500">{error.message}</small>}
    </div>
  );
};

export default FormField;
