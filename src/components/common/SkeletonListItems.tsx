import type { FunctionComponent } from "react";
import SkeletonListItem from "./SkeletonListItem";

interface Props {
  variant?: "card" | "project";
}
const SkeletonListItems: FunctionComponent<Props> = ({ variant }) => {
  return (
    <>
      <SkeletonListItem variant={variant} />
      <SkeletonListItem variant={variant} />
      <SkeletonListItem variant={variant} />
    </>
  );
};

export default SkeletonListItems;
