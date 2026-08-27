// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const timeAgo = (prevDate: Date) => {
  const diff = Number(new Date()) - Number(prevDate);
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  switch (true) {
    case diff < minute:
      const seconds = Math.round(diff / 1000);
      if (seconds <= 10) return "Now";
      return `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
    case diff < hour:
      return Math.round(diff / minute) + " minutes ago";
    case diff < day:
      return Math.round(diff / hour) + " hours ago";
    case diff < month:
      return Math.round(diff / day) + " days ago";
    case diff < year:
      return Math.round(diff / month) + " months ago";
    case diff > year:
      return Math.round(diff / year) + " years ago";
    default:
      return "";
  }
};

const FormatDate = ({ dateString }: { dateString: string }) => {
  const [time, setTime] = useState<{
    localeTime: string;
    timeAgo: string;
  } | null>(null);
  useEffect(() => {
    const date = new Date(dateString);
    setTime({
      localeTime:
        date.toLocaleDateString() +
        ", " +
        date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      timeAgo: timeAgo(date),
    });
  }, [dateString]);
  if (!time) return null;
  return (
    <Tooltip>
      <TooltipTrigger>
        <time dateTime={dateString}>{time.timeAgo}</time>
      </TooltipTrigger>
      <TooltipContent>{time.localeTime}</TooltipContent>
    </Tooltip>
  );
};

export default FormatDate;
