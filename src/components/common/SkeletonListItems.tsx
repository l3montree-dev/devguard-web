import { FunctionComponent } from "react";
import SkeletonListItem from "./SkeletonListItem";

interface Props {}
const SkeletonListItems: FunctionComponent<Props> = () => {
  return (
    <>
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </>
  );
};

export default SkeletonListItems;
