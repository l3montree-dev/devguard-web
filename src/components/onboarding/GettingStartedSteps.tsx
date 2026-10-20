// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { Building2, FolderGit2, Folders, Workflow } from "lucide-react";
import type { FunctionComponent, ReactNode } from "react";
import OnboardingSteps, { type OnboardingStep } from "./OnboardingSteps";

type GettingStartedStep = "organization" | "group" | "repository";

const DOCS = "https://docs.devguard.org";

interface Props {
  // the step the user is at - the earlier ones are done
  current: GettingStartedStep;
  // the form to complete the current step
  children: ReactNode;
  description?: ReactNode;
}

// the way from an empty organization to the first scan - each step happens on another page
const GettingStartedSteps: FunctionComponent<Props> = ({
  current,
  children,
  description,
}) => {
  const steps: OnboardingStep[] = [
    {
      id: "organization",
      icon: Building2,
      title: "Create your organization",
      summary:
        "Your organization holds all groups, repositories and members of your company.",
      description:
        "Enter the name of your organization. This will be used to identify your organization in the system. Got an invitation? Join an existing organization instead.",
      docs: [
        {
          label: "Key concepts",
          href: `${DOCS}/getting-started/key-concepts/`,
        },
      ],
    },
    {
      id: "group",
      icon: Folders,
      title: "Create a group",
      summary:
        "Groups organize your software projects, e.g. one group per product.",
      description:
        "Groups help to organize your software projects. For example, you can make a group per software project, and then split the frontend and backend into individual subgroups.",
      docs: [
        {
          label: "Key concepts",
          href: `${DOCS}/getting-started/key-concepts/`,
        },
      ],
    },
    {
      id: "repository",
      icon: FolderGit2,
      title: "Create a repository",
      summary:
        "A repository is a software project you would like to manage the risks of.",
      description:
        "A repository is a software project you would like to manage the risks of. You can also create a subgroup first to split a bigger project.",
      docs: [
        {
          label: "Key concepts",
          href: `${DOCS}/getting-started/key-concepts/`,
        },
      ],
    },
    {
      id: "integrate",
      icon: Workflow,
      title: "Integrate DevGuard",
      summary: "Scan on every push and sync the risks with your issue tracker.",
    },
  ].map((step) =>
    step.id === current
      ? {
          ...step,
          description: description ?? step.description,
          content: children,
        }
      : step,
  );

  return (
    <div className="w-full">
      <OnboardingSteps
        readOnly
        hint="Get started by creating your first repository in DevGuard."
        steps={steps}
        initialStepIndex={steps.findIndex((s) => s.id === current)}
      />
    </div>
  );
};

export default GettingStartedSteps;
