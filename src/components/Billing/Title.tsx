function Title({
  orgName,
  orgProductName = "Free Plan",
}: {
  orgName?: string;
  orgProductName?: string;
}) {
  return (
    <div className="m-8 text-center dark:text-white">
      <h1>
        {orgName ? (
          <span>
            {orgName} is currenlty using the {orgProductName}{" "}
          </span>
        ) : (
          <span> Price </span>
        )}
      </h1>
    </div>
  );
}

export default Title;
