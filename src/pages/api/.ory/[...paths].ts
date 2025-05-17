// Copyright 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @ory/integrations offers a package for integrating with Next.js in development. It is not needed in production.
// @ory/integrations works in a similar way as ory tunnel, read more about it what it does:
// https://www.ory.sh/docs/guides/cli/proxy-and-tunnel
import { config, createApiHandler } from "@ory/integrations/next-edge";

export { config };
// And create the Ory Network API "bridge".
export default createApiHandler({
  fallbackToPlayground: false,
  dontUseTldForCookieDomain: true,
});
