// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import React, { useEffect, useState } from "react";
import { date } from "zod";

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
  const [time, setTime] = useState(dateString);
  useEffect(() => {
    setTime(timeAgo(new Date(dateString)));
  }, [dateString]);
  return <time dateTime={dateString}>{time}</time>;
};

export default FormatDate;
