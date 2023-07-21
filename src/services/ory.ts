// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { Configuration, FrontendApi } from "@ory/client";
import { edgeConfig } from "@ory/integrations/next";

export const ory = new FrontendApi(new Configuration(edgeConfig));

import { NextRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

// A small function to help us deal with errors coming from fetching a flow.
export function handleGetFlowError<S>(
  router: NextRouter,
  flowType: "login" | "registration" | "settings" | "recovery" | "verification",
  resetFlow: Dispatch<SetStateAction<S | undefined>>,
) {
  return async (err: any) => {
    console.log(err, flowType);
    switch (err.response?.data.error?.id) {
      case "session_inactive":
        await router.push("/login?return_to=" + window.location.href);
        return;
      case "session_aal2_required":
        if (err.response?.data.redirect_browser_to) {
          const redirectTo = new URL(err.response?.data.redirect_browser_to);
          if (flowType === "settings") {
            redirectTo.searchParams.set("return_to", window.location.href);
          }
          // 2FA is enabled and enforced, but user did not perform 2fa yet!
          window.location.href = redirectTo.toString();
          return;
        }
        await router.push("/login?aal=aal2&return_to=" + window.location.href);
        return;
      case "session_already_available":
        // User is already signed in, let's redirect them home!
        await router.push("/");
        return;
      case "session_refresh_required":
        // We need to re-authenticate to perform this action
        window.location.href = err.response?.data.redirect_browser_to;
        return;
      case "self_service_flow_return_to_forbidden":
        // The flow expired, let's request a new one.
        // toast.error("The return_to address is not allowed.");
        resetFlow(undefined);
        await router.push("/" + flowType);
        return;
      case "self_service_flow_expired":
        // The flow expired, let's request a new one.
        /*  toast.error(
          "Your interaction expired, please fill out the form again.",
        );*/
        resetFlow(undefined);
        await router.push("/" + flowType);
        return;
      case "security_csrf_violation":
        // A CSRF violation occurred. Best to just refresh the flow!
        /* toast.error(
          "A security violation was detected, please fill out the form again.",
        ); */
        resetFlow(undefined);
        await router.push("/" + flowType);
        return;
      case "security_identity_mismatch":
        // The requested item was intended for someone else. Let's request a new flow...
        resetFlow(undefined);
        await router.push("/" + flowType);
        return;
      case "browser_location_change_required":
        // Ory Kratos asked us to point the user to this URL.
        window.location.href = err.response.data.redirect_browser_to;
        return;
    }

    switch (err.response?.status) {
      case 410:
        // The flow expired, let's request a new one.
        resetFlow(undefined);
        await router.push("/" + flowType);
        return;
    }

    // We are not able to handle the error? Return it.
    return Promise.reject(err);
  };
}

// A small function to help us deal with errors coming from initializing a flow.
export const handleFlowError = handleGetFlowError;
