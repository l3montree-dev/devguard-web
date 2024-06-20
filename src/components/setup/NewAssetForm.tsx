// Copyright (C) 2024 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { hasErrors } from "@/utils/common";
import SecReqSelectGroup from "../SecReqSelectGroup";
import ToggleWithIcon from "../common/ToggleWithIcon";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  FormState,
  UseFormGetFieldState,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { CreateAssetReq } from "@/types/api/req";

interface Props {
  handleSubmit: UseFormHandleSubmit<CreateAssetReq, undefined>;
  register: UseFormRegister<CreateAssetReq>;
  getFieldState: UseFormGetFieldState<CreateAssetReq>;
  formState: FormState<CreateAssetReq>;
  handleCreateAsset: (data: CreateAssetReq) => Promise<void>;
}

export default function NewAssetForm({
  handleSubmit,
  register,
  getFieldState,
  formState,
  handleCreateAsset,
}: Props) {
  return (
    <form onSubmit={handleSubmit(handleCreateAsset)}>
      <Input
        variant="dark"
        label="Name*"
        {...register("name", {
          required: "Please enter a name",
        })}
        error={getFieldState("name")?.error}
      />
      <div className="mt-4">
        <Input
          variant="dark"
          label="Description*"
          {...register("description", {
            required: "Please enter a description",
          })}
          error={getFieldState("description")?.error}
        />
      </div>
      <div className="mt-10 border-t border-gray-700">
        <div className="mt-6">
          <SecReqSelectGroup
            label="Confidentiality Requirement"
            {...register("confidentialityRequirement")}
          />
        </div>
        <div className="mt-6">
          <SecReqSelectGroup
            label="Integrity Requirement"
            {...register("integrityRequirement")}
          />
        </div>
        <div className="mt-6">
          <SecReqSelectGroup
            label="Availability Requirement"
            {...register("availabilityRequirement")}
          />
        </div>
      </div>
      <div className="mt-10 border-t border-gray-700">
        <div className="mt-10">
          <ToggleWithIcon
            label="Reachable from the internet"
            {...register("reachableFromTheInternet")}
          />
        </div>
      </div>
      <div className="mt-12 flex justify-end ">
        <Button
          disabled={hasErrors(formState.errors)}
          type="submit"
          variant="solid"
        >
          Create
        </Button>
      </div>
    </form>
  );
}
