interface Props {
  frameworkControlId: string;
}
const ImplementsControlBadge = ({ frameworkControlId }: Props) => {
  const [framework, control] = frameworkControlId.split(":");
  return (
    <div className="rounded-full border overflow-hidden text-xs">
      <span className="bg-secondary p-1 text-secondary-foreground">
        {framework}
      </span>
      <span className="p-1 text-foreground">{control}</span>
    </div>
  );
};

export default ImplementsControlBadge;
