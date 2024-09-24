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

import { useState } from "react";
import ContainerScanningDialog from "./ContainerScanningDialog";
import Stage from "./Stage";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import FormatDate from "../risk-assessment/FormatDate";

// along with this program.  If not, see <https://www.gnu.org/licenses/>.
function ContainerScanning() {
  const [open, setOpen] = useState(false);
  const asset = useActiveAsset()!;
  return (
    <>
      <Stage
        title="Container Scanning"
        description="Find known security vulnerabilities in OCI images, like Docker Images."
        onButtonClick={() => setOpen(true)}
        LastScan={
          asset.lastContainerScan ? (
            <small className="w-full text-right text-muted-foreground">
              last component update{" "}
              <FormatDate dateString={asset.lastContainerScan} />, continuously
              monitoring risk changes.
            </small>
          ) : undefined
        }
      />

      <ContainerScanningDialog open={open} setOpen={setOpen} />
    </>
  );
}

export default ContainerScanning;
