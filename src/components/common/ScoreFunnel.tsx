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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useWindowSize } from "@/hooks/useWindowSize";
import { cvssToColor } from "@/utils/common";
// @ts-expect-error
import FunnelGraph from "funnel-graph-js";
import { useEffect } from "react";
import "reactflow/dist/style.css";

interface VulnRisk {
  withEnvironment: number;
  withEnvironmentAndThreatIntelligence: number;
}
interface Props {
  baseScore: number;

  risk: VulnRisk;
}

export default function ScoreFunnel(props: Props) {
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!windowSize.width) return;

    // get the parent element and check the height
    const parent =
      document.querySelector(".funnel")!.parentElement?.parentElement;

    // clear the element
    document.querySelector(".funnel")!.innerHTML = "";

    const graph = new FunnelGraph({
      container: ".funnel",
      gradientDirection: windowSize.width > 768 ? "horizontal" : "vertical",
      data: {
        colors: [
          [
            cvssToColor(props.baseScore),
            cvssToColor(props.risk.withEnvironment),
            cvssToColor(props.risk.withEnvironmentAndThreatIntelligence),
          ],
        ],
        values: [
          [Math.pow(props.baseScore, 6)],
          [Math.pow(props.risk.withEnvironment, 6)],
          [Math.pow(props.risk.withEnvironmentAndThreatIntelligence, 6)],
        ],
      },
      width:
        windowSize.width > 768 ? windowSize.width : 2 * (windowSize.width / 3),
      height: 50,
      displayPercent: false,
      direction: windowSize.width > 768 ? "horizontal" : "vertical",
    });

    graph.draw();
  }, [windowSize.width, props.baseScore, props.risk]);

  return <div className="funnel" style={{ width: windowSize.width }}></div>;
}
