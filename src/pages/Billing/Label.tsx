function Label({ label, labelColor }: { label?: string; labelColor?: string }) {
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
