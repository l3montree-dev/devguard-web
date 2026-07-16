"use client";

import { classNames } from "@/utils/common";
import { ShieldCheck } from "lucide-react";
import type { FunctionComponent } from "react";

interface Props {
    framework: string;
    className?: string;
}

const FrameworkIcon: FunctionComponent<Props> = ({ framework, className }) => {
    return (
        <ShieldCheck
            className={classNames(
                "h-4 w-4 shrink-0 text-muted-foreground",
                className,
            )}
            aria-hidden
        />
    );
};

export default FrameworkIcon;
