import { classNames } from "../../utils/common";

const getClassNames = (severity: string) => {
  switch (severity) {
    case "Bad":
      return "text-destructive bg-destructive-muted";
    case "Mid":
      return "text-severity-high bg-severity-high-muted";
    case "Good":
      return "text-warning bg-warning-muted";
    case "Awesome":
      return "text-success bg-success-muted";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const scoreToText = (score: number) => {
  if (score > 7) return "Awesome";
  if (score >= 5) return "Good";
  if (score >= 3) return "Mid";
  if (score >= 0) return "Bad";
  return "NONE";
};

const OpenSsfScore = ({ score }: { score: number }) => {
  const cls = getClassNames(scoreToText(score));

  return (
    <span
      className={classNames(
        "px-2 font-medium text-xs whitespace-nowrap rounded-full p-1",
        cls,
      )}
    >
      {scoreToText(score)} ({score.toFixed(1)})
    </span>
  );
};

export default OpenSsfScore;
