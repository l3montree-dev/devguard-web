import { UiNode, UiNodeAnchorAttributes } from "@ory/client";

interface Props {
  node: UiNode;
  attributes: UiNodeAnchorAttributes;
}

export const NodeAnchor = ({ node, attributes }: Props) => {
  return (
    <button
      data-testid={`node/anchor/${attributes.id}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.location.href = attributes.href;
      }}
    >
      {attributes.title.text}
    </button>
  );
};
