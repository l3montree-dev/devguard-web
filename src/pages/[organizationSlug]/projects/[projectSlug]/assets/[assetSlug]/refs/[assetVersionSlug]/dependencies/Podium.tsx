export function Podium() {
  return (
    <div>
      <div>test</div>
      <div className="flex items-end justify-center space-x-0">
        <div className="relative h-24 w-28 rounded-l-lg bg-gradient-to-b from-red-500 from-40% via-red-500" />
        <div className="">
          <div className="relative h-36 w-28 rounded-t-lg bg-gradient-to-b from-red-500 from-60% via-red-500" />
        </div>
        <div className="h-16 w-28 rounded-r-lg bg-gradient-to-b from-red-500 from-10% via-red-500" />
      </div>
    </div>
  );
}
