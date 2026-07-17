import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { classNames } from "../../utils/common";

interface Props {
  text: string;
  definitions?: Record<string, string>;
  split?: boolean;
  noUnderline?: boolean;
}

export function TokenizedText({
  text,
  definitions,
  split = true,
  noUnderline = false,
}: Props) {
  var tokens = [text];
  if (split) {
    tokens = text.match(/\p{L}+|\s+|[^\p{L}\s]+/gu) ?? [];
  }
  return (
    <span>
      {tokens.map((token, index) =>
        definitions &&
        Object.prototype.hasOwnProperty.call(definitions, token) ? (
          <Tooltip key={token + ":" + index}>
            <TooltipTrigger>
              <span
                className={classNames(
                  noUnderline ? "cursor-help" : "underline cursor-help",
                )}
              >
                {token}
              </span>
            </TooltipTrigger>
            <TooltipContent className="font-normal!">
              <p>{definitions[token]}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          token
        ),
      )}
    </span>
  );
}
