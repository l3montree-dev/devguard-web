function Title({ orgName }: { orgName?: string }) {
  return (
    <div className="m-8 text-center">
      <h1>
        {orgName ? (
          <span>{orgName} is currenlty using the Free Plan</span>
        ) : (
          <span> Price </span>
        )}
      </h1>
    </div>
  );
}

export default Title;
