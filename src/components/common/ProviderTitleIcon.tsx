import { ExternalTicketProvider } from "@/types/common";
import Image from "next/image";

export default function ProviderTitleIcon({
  provider,
}: {
  provider: ExternalTicketProvider;
}) {
  switch (provider) {
    case "github":
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
    case "gitlab":
      return (
        <span className="inline-flex items-center gap-2">
          <Image
            src="/assets/provider-icons/gitlab.svg"
            alt="GitLab and openCode Icon"
            className="h-4 w-auto"
            width={16}
            height={16}
          />{" "}
          GitLab
        </span>
      );
    case "jira":
      return (
        <span className="inline-flex items-center gap-2">
          <Image
            src="/assets/provider-icons/jira.svg"
            alt="Jira Icon"
            className="h-4 w-auto"
            width={16}
            height={16}
          />{" "}
          Jira
        </span>
      );
    case "opencode":
      return (
        <span className="inline-flex items-center gap-2">
          <Image
            src="/assets/provider-icons/opencode.svg"
            alt="openCode Icon"
            className="h-4 w-auto"
            width={16}
            height={16}
          />{" "}
          openCode
        </span>
      );
    default:
      return null;
  }
}
