import React, { FunctionComponent, ReactNode, type JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { classNames } from "@/utils/common";

interface Props {
  Button?: React.ReactNode;
  Title: ReactNode;
  reactOnHover?: boolean;
  Description?: string | JSX.Element;
  className?: string;
}
const ListItem: FunctionComponent<Props> = ({
  Button,
  Title,
  Description: Description,
  reactOnHover,
  className,
}) => {
  return (
    <Card
      className={classNames(
        "flex flex-row items-center justify-between",
        reactOnHover && "transition-all hover:bg-accent",
        className,
      )}
    >
      <CardHeader className="justify-center w-full">
        <CardTitle className="text-base">{Title}</CardTitle>
        {Boolean(Description) && (
          <CardDescription>{Description}</CardDescription>
        )}
      </CardHeader>
      {Boolean(Button) && (
        <CardContent className="p-6">
          <div className="flex flex-none items-center gap-x-4">{Button}</div>
        </CardContent>
      )}
    </Card>
  );
};

export default ListItem;
