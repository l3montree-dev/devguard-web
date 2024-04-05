function Label({
  orgProductID,
  productID,
  label,
  labelColor,
  recommended = "Gold",
  recommendedColor = "bg-yellow-200",
  title,
}: {
  orgProductID?: number;
  productID?: number;
  label?: string;
  labelColor?: string;
  recommended?: string;
  recommendedColor?: string;
  title?: string;
}) {
  if (orgProductID === productID) {
    label = "Your current plan";
    labelColor = "bg-gray-200";
  }
  if (recommended === title) {
    label = "Recommended";
    labelColor = recommendedColor;
  }
  if (orgProductID === productID && recommended === title) {
    label = "Your current plan and Recommended";
    labelColor = recommendedColor;
  }

  return (
    <div
      className={
        label
          ? ` ${labelColor} rounded-t-xl text-center text-black`
          : "invisible opacity-0"
      }
    >
      {label ?? "-"}
    </div>
  );
}
export default Label;
