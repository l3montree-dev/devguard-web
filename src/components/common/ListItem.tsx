import React, { FunctionComponent, ReactNode } from "react";
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
  description?: string | JSX.Element;
}
const ListItem: FunctionComponent<Props> = ({
  Button,
  Title,
  description,
  reactOnHover,
}) => {
  return (
    <Card
      className={classNames(
        "flex flex-row items-center justify-between",
        reactOnHover && "transition-all hover:bg-accent",
      )}
    >
      <CardHeader className="justify-center">
        <CardTitle className="text-base">{Title}</CardTitle>
        {Boolean(description) && (
          <CardDescription>{description}</CardDescription>
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
