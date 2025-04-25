import { classNames } from "../../utils/common";

const getClassNames = (severity: string) => {
  switch (severity) {
    case "Bad":
      return "text-red-600 bg-red-600/20 dark:text-red-400";
    case "Mid":
      return "text-orange-700 dark:text-orange-300 bg-orange-500/20";
    case "Good":
      return "text-yellow-700 dark:text-yellow-300 bg-yellow-500/20";
    case "Awesome":
      return "dark:text-green-300 text-green-600 bg-green-500/20";
    default:
      return "text-gray-700 bg-gray-500/20 dark:text-gray-200";
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
