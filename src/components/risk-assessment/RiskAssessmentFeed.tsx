// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserRole, VulnEventDTO } from "@/types/api/api";
import { classNames } from "@/utils/common";
import {
  eventMessages,
  eventTypeMessages,
  evTypeBackground,
  findUser,
  removeUnderscores,
} from "@/utils/view";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  StopIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import {
  GitBranchIcon,
  GitPullRequestCreateArrowIcon,
  Scale,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import FormatDate from "./FormatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Alert from "../common/Alert";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useState } from "react";

function EventTypeIcon({ eventType }: { eventType: VulnEventDTO["type"] }) {
  switch (eventType) {
    case "licenseDecision":
      return <Scale className="h-4 w-4" />;
    case "ticketClosed":
      return <CheckIcon className="h-4 w-4" />;
    case "ticketDeleted":
      return <StopIcon className="h-4 w-4" />;
    case "accepted":
      return <SpeakerXMarkIcon className="h-4 w-4" />;
    case "fixed":
      return <CheckIcon className="h-4 w-4" />;
    case "detected":
      return <MagnifyingGlassIcon className="h-4 w-4" />;
    case "falsePositive":
      return <StopIcon className="h-4 w-4" />;
    case "mitigate":
      return <WrenchIcon className="h-4 w-4" />;
    case "markedForTransfer":
      return <ArrowRightStartOnRectangleIcon className="h-4 w-4" />;
    case "rawRiskAssessmentUpdated":
      return <ArrowPathIcon className="h-4 w-4" />;
    case "reopened":
      return <MagnifyingGlassIcon className="h-4 w-4" />;
    case "comment":
      return <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" />;
  }
}

const RiskFeedItem = ({
  event,
  events,
  org,
  project,
  asset,
  currentUser,
  activeAssetVersion,
  currentUserRole,
  vulnerabilityName,
  deleteEvent,
  page,
}: {
  event: VulnEventDTO;
  events: VulnEventDTO[];
  org: ReturnType<typeof useActiveOrg>;
  project: ReturnType<typeof useActiveProject>;
  asset: ReturnType<typeof useActiveAsset>;
  currentUser: ReturnType<typeof useCurrentUser>;
  activeAssetVersion: ReturnType<typeof useActiveAssetVersion>;
  currentUserRole: UserRole | null;
  vulnerabilityName: string;
  deleteEvent?: (eventId: string) => void;
  page: number;
}) => {
  const user = findUser(event.userId, org, currentUser);

  const msg = eventMessages(event);
  return (
    <li
      className={classNames(
        event.assetVersionName !== activeAssetVersion?.name &&
          "opacity-75 hover:opacity-100",

        "relative flex flex-row items-start gap-4 transition-all",
      )}
      key={event.id}
    >
      <div
        className={classNames(
          event.createdByVexRule ? "border-dashed border" : "",
          "absolute left-[13px] h-full border-l border-r -bottom-[35px]",
        )}
      />
      <div
        className={classNames(
          event.createdByVexRule
            ? "bg-secondary"
            : evTypeBackground[event.type],
          "h-7 w-7 rounded-full text-white border-2 flex flex-row items-center z-10 justify-center border-background p-1",
        )}
      >
        <EventTypeIcon eventType={event.type} />
      </div>
      <div className={classNames("w-full")}>
        <div className="flex w-full flex-col">
          <div className="flex flex-row items-start gap-2">
            {event.createdByVexRule ? (
              <Avatar>
                <AvatarFallback className="bg-secondary">
                  <GitPullRequestCreateArrowIcon className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            ) : event.userId === "system" ? (
              <Avatar>
                <AvatarFallback className="bg-secondary">
                  <Image
                    width={20}
                    height={20}
                    src="/logo_icon.svg"
                    alt="logo"
                  />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                {Boolean(user?.avatarUrl) && (
                  <AvatarImage src={user?.avatarUrl} alt={event.userId} />
                )}
                <AvatarFallback className="bg-secondary">
                  {user.realName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="w-full overflow-hidden rounded border">
              <div className="w-full">
                <p className="w-full bg-card px-2 py-2 pr-20 font-medium">
                  {event.createdByVexRule
                    ? "VEX Rule"
                    : findUser(event.userId, org, currentUser).displayName}{" "}
                  {eventTypeMessages(event, vulnerabilityName, events)}
                  {event.mechanicalJustification &&
                    "- " +
                      removeUnderscores(
                        event.mechanicalJustification,
                      ).toLowerCase()}
                </p>

                <div className="absolute right-2 top-2">
                  <div>
                    <Link
                      href={`/${org.slug}/projects/${project.slug}/assets/${asset!.slug}/refs/${event.assetVersionName}/${page}/${event.vulnId}`}
                    >
                      <Badge variant={"outline"}>
                        <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                        {event.assetVersionName}
                      </Badge>
                    </Link>
                  </div>
                </div>
              </div>

              {Boolean(msg) && (
                <div className="mdx-editor-content p-2">
                  <Markdown
                    rehypePlugins={[
                      [rehypeExternalLinks, { target: "_blank" }],
                    ]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {msg}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ml-10 flex flex-row mt-2 text-xs font-normal text-muted-foreground whitespace-nowrap items-start">
          <FormatDate dateString={event.createdAt} />
          {deleteEvent && currentUserRole === UserRole.Admin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="h-4 w-4 p-0 m-0"
                >
                  <EllipsisVerticalIcon className="h-4 w-4 text-muted-foreground p-0 m-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <Alert
                  title="Are you sure you want to delete this event?"
                  description="This action cannot be undone. All data associated with this event will be deleted."
                  onConfirm={() => deleteEvent(event.id)}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Delete
                  </DropdownMenuItem>
                </Alert>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </li>
  );
};

export default function RiskAssessmentFeed({
  events,
  vulnerabilityName,
  page,
  deleteEvent,
}: {
  events: VulnEventDTO[];
  vulnerabilityName: string;
  page: string;
  deleteEvent: (eventId: string) => Promise<void>;
}) {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const currentUser = useCurrentUser();
  const currentUserRole = useCurrentUserRole();

  const activeAssetVersion = useActiveAssetVersion();

  const [isOpen, setIsOpen] = useState(false);

  const deleteHistory = () => {
    events.slice(0, events.length - 3).forEach(async (event) => {
      // we are using await on purpose here to not overload the server with delete requests
      await deleteEvent(event.id);
    });
  };

  return (
    <div>
      <ul className="relative flex flex-col pb-10 text-foreground" role="list">
        {events.length > 3 && (
          <div className="relative mb-10">
            <div className="border-dotted border-l-2 h-20 absolute left-3.5 -bottom-10" />
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className="ml-7 flex items-center flex-row justify-center">
                <Button
                  onClick={() => setIsOpen((prev) => !prev)}
                  variant="ghost"
                >
                  {isOpen ? "Hide" : "Show"} whole history (+{events.length - 3}{" "}
                  elements)
                </Button>
                {currentUserRole === UserRole.Admin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size={"icon"}
                        className="h-4 w-4 opacity-50 p-0 m-0"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4 text-muted-foreground p-0 m-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <Alert
                        title="Are you sure you want to delete the entire event history?"
                        description="This action cannot be undone. All data associated with this event will be deleted."
                        onConfirm={() => deleteHistory()}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Delete all Events in History
                        </DropdownMenuItem>
                      </Alert>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <CollapsibleContent className="flex mt-10 flex-col gap-10">
                {events.slice(0, events.length - 3).map((event, index) => {
                  return (
                    <RiskFeedItem
                      activeAssetVersion={activeAssetVersion}
                      vulnerabilityName={vulnerabilityName}
                      deleteEvent={deleteEvent}
                      page={page as unknown as number}
                      org={org}
                      project={project}
                      asset={asset}
                      currentUser={currentUser}
                      currentUserRole={currentUserRole}
                      key={event.id}
                      event={event}
                      events={events}
                    />
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        <div className="flex flex-col gap-10">
          {events
            .slice(Math.max(events.length - 3, 0), events.length)
            .map((event, index) => {
              return (
                <RiskFeedItem
                  activeAssetVersion={activeAssetVersion}
                  vulnerabilityName={vulnerabilityName}
                  deleteEvent={deleteEvent}
                  page={page as unknown as number}
                  org={org}
                  project={project}
                  asset={asset}
                  currentUser={currentUser}
                  currentUserRole={currentUserRole}
                  key={event.id}
                  event={event}
                  events={events}
                />
              );
            })}
        </div>
      </ul>
    </div>
  );
}
