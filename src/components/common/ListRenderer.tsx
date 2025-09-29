import React from "react";
import SkeletonListItems from "./SkeletonListItems";
import Err from "./Err";

interface Props<T> {
  isLoading: boolean;
  error: any;
  data: T[] | undefined;
  renderItem: (item: T, i: number, arr: T[]) => React.ReactNode;
  Empty: React.ReactNode;
}

function ListRenderer<T>({
  isLoading,
  error,
  data,
  renderItem,
  Empty,
}: Props<T>) {
  if (isLoading) {
    return <SkeletonListItems />;
  }
  if (error) {
    return <Err />;
  } else if (data?.length === 0) {
    return Empty;
  } else {
    return (data || []).map(renderItem);
  }
}

export default ListRenderer;
