import React, { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  Button?: React.ReactNode;
  title: string;
  description?: string;
}
const ListItem: FunctionComponent<Props> = ({ Button, title, description }) => {
  return (
    <Card className="flex flex-row justify-between">
      <CardHeader className="justify-center">
        <CardTitle>{title}</CardTitle>
        {Boolean(description) && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-none items-center gap-x-4">{Button}</div>
      </CardContent>
    </Card>
  );
};

export default ListItem;
