// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Alert, AlertTitle } from "@/components/ui/alert";
import { CrownIcon } from "lucide-react";
import { useTheme } from "next-themes";
import type { FunctionComponent } from "react";
import { ImageZoom } from "../../common/Zoom";
import DevguardTokenCard from "../../DevguardTokenCard";
import type { Surface } from "@/lib/surface";

export type CiProvider = "github" | "gitlab";

export const ciTokenInstructions: Record<
  CiProvider,
  { title: string; description: string }
> = {
  github: {
    title:
      'Navigate to Settings > Secrets and Variables > Actions. Press the button "New repository secret"',
    description:
      "For example, for the DevGuard project its following url: https://github.com/l3montree-dev/devguard/settings/secrets/actions",
  },
  gitlab: {
    title:
      'Navigate to CI/CD Settings > Variables > Expand. Press the button "Add variable"',
    description:
      "For example, for the DevGuard project its following URL: https://gitlab.com/l3montree/example-project/-/settings/ci_cd",
  },
};

const images: Record<CiProvider, { light: string; dark: string; alt: string }> =
  {
    github: {
      light: "/assets/repo-secret.png",
      dark: "/assets/repo-secret-dark.png",
      alt: "Open the project settings in GitHub",
    },
    gitlab: {
      light: "/assets/gitlab-token-white.png",
      dark: "/assets/gitlab-token-dark.png",
      alt: "Open the CI/CD settings in GitLab",
    },
  };

// screenshot of where to put the secret + the token card to create it
const CiTokenSetup: FunctionComponent<{
  provider: CiProvider;
  // the surface the setup is rendered on
  variant?: Surface;
}> = ({ provider, variant }) => {
  const { theme } = useTheme();
  const image = images[provider];

  return (
    <>
      {provider === "gitlab" && (
        <Alert className="mb-5">
          <CrownIcon />
          <AlertTitle>
            You have to be at least <span className="">maintainer</span> to
            configure variables.
          </AlertTitle>
        </Alert>
      )}
      <div className="relative aspect-video w-full max-w-4xl">
        <ImageZoom
          alt={image.alt}
          className="rounded-lg border object-fill"
          src={theme === "dark" ? image.dark : image.light}
          fill
        />
      </div>
      <div className="mt-10">
        <DevguardTokenCard variant={variant} />
      </div>
    </>
  );
};

export default CiTokenSetup;
