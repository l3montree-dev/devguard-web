// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { cn } from "@/lib/utils";
import { truncateMiddle } from "@/utils/common";
import { Boxes, Building2, ChevronDown, Package } from "lucide-react";
import { Fragment, type FunctionComponent, type ReactNode } from "react";

// Longer names make the flowchart grow and squish the form next to it, use truncateMiddle beyond this
const maxNameLength = 44;

type StepState = "existing" | "pending" | "next";

const stepStyles: Record<
  StepState,
  { card: string; icon: string; value: string }
> = {
  existing: { card: "", icon: "text-muted-foreground", value: "" },
  pending: {
    card: "border-primary/60 bg-primary/5",
    icon: "text-primary",
    value: "",
  },
  next: {
    card: "border-dashed",
    icon: "text-muted-foreground",
    value: "text-muted-foreground",
  },
};

interface Step {
  Icon: typeof Building2;
  label: string;
  value: ReactNode;
  description: ReactNode;
  state: StepState;
}

const FlowchartNode: FunctionComponent<Step> = ({
  Icon,
  label,
  value,
  description,
  state,
}) => (
  <div
    className={cn(
      "shrink-0 rounded-lg border bg-card p-3",
      stepStyles[state].card,
    )}
  >
    <div className="flex flex-row items-center gap-2">
      <Icon className={cn("h-4 w-4 shrink-0", stepStyles[state].icon)} />
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
    <div
      className={cn(
        "mt-1.5 truncate text-sm font-semibold",
        stepStyles[state].value,
      )}
    >
      {value}
    </div>
    <div className="mt-1 text-sm text-muted-foreground">{description}</div>
  </div>
);

// grows to fill whatever height the form next to the flowchart has
const Connector: FunctionComponent = () => (
  <div className="flex flex-1 flex-col items-center" aria-hidden="true">
    <div className="w-px min-h-3 flex-1 bg-border" />
    <ChevronDown className="-my-1 h-3 w-3 shrink-0 text-border" />
    <div className="w-px min-h-3 flex-1 bg-border" />
  </div>
);

interface Props {
  organizationName: string;
  groupName?: string;
  repositoryName?: string;
  // the step the user is currently filling out, the other ones are just context
  highlight?: "group" | "repository";
  className?: string;
}

const Placeholder: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => <span className="font-normal text-muted-foreground">{children}</span>;

export const GroupStructureFlowchart: FunctionComponent<Props> = ({
  organizationName,
  groupName,
  repositoryName,
  highlight = "group",
  className,
}) => {
  const trimmedGroupName = groupName?.trim();
  const trimmedRepositoryName = repositoryName?.trim();
  const creatingGroup = highlight === "group";

  const steps: Step[] = [
    {
      Icon: Building2,
      label: "Organization",
      value: truncateMiddle(organizationName, maxNameLength),
      description: creatingGroup
        ? "The organization you just created. It holds all of your groups and projects."
        : "The organization this repository belongs to.",
      state: "existing",
    },
    {
      Icon: Boxes,
      label: "Group",
      value: trimmedGroupName ? (
        truncateMiddle(trimmedGroupName, maxNameLength)
      ) : (
        <Placeholder>Your new group</Placeholder>
      ),
      description: creatingGroup ? (
        <>
          What you are creating now - for example one per software product.{" "}
          <strong>
            You can create sub-groups as well to split frontend and backend
            repositories for example.
          </strong>
        </>
      ) : (
        "The group you are adding the repository to."
      ),
      state: creatingGroup ? "pending" : "existing",
    },
    {
      Icon: Package,
      label: creatingGroup ? "Repositories" : "Repository",
      value: creatingGroup ? (
        "Frontend, Backend, ..."
      ) : trimmedRepositoryName ? (
        truncateMiddle(trimmedRepositoryName, maxNameLength)
      ) : (
        <Placeholder>Your new repository</Placeholder>
      ),
      description: creatingGroup ? (
        "The repositories you will manage and scan with DevGuard. You add them inside groups."
      ) : (
        
          "What you are creating now. Your actual code you want to scan and manage with DevGuard."
      ),
      state: creatingGroup ? "next" : "pending",
    },
  ];

  return (
    <div
      className={cn("flex h-full flex-col", className)}
      data-testid="group-structure-flowchart"
    >
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          {index > 0 && <Connector />}
          <FlowchartNode {...step} />
        </Fragment>
      ))}
    </div>
  );
};

export default GroupStructureFlowchart;
