import { ExternalTicketProvider } from "@/types/common";
import Image from "next/image";

export default function ProviderTitleIcon({
  provider,
}: {
  provider: ExternalTicketProvider;
}) {
  switch (provider) {
    case ExternalTicketProvider.GITHUB:
      return (
        <span className="inline-flex items-center gap-2">
          <Image
            src="/assets/provider-icons/github.svg"
            alt="GitHub Icon"
            className="h-4 w-4 dark:invert"
            width={16}
            height={16}
          />{" "}
          GitHub
        </span>
      );
    case ExternalTicketProvider.GITLAB:
      return (
        <span className="inline-flex items-center gap-2">
          <Image
            src="/assets/provider-icons/gitlab-opencode.svg"
            alt="GitLab and openCode Icon"
            className="h-4 w-auto"
            width={16}
            height={16}
          />{" "}
          GitLab/ openCode
        </span>
      );
    default:
      return null;
  }
}
