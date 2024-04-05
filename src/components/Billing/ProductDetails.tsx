import Button from "@/components/common/Button";

export default function ProductDetails({
  title,
  description,
  price,
  subLink,
  buttonText,
  active,
  onButtonClick,
}: {
  title: string;
  description: string;
  price: number;
  subLink?: string;
  buttonText?: string;
  active: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <section className="flex h-80 flex-col justify-around rounded-b-md  rounded-t-sm border border-yellow-400   bg-stone-100 p-6">
      <div className="">
        <h1 className="text-xl font-bold">{title}</h1>
        <span className="font-bold">{description}</span>
      </div>
      <main className="flex ">
        <span className=" align-top">€</span>
        <div className="basis-1/3 text-3xl font-bold">{price / 100}</div>
        <div className="basis-2/3 text-sm">
          <span> Per user/month</span>
          <span>
            {price === 0
              ? "No credit card required"
              : " Billed annually at " + price * 12 + " EUR"}
          </span>
        </div>
      </main>

      <div>
        {/*className={subLink ? "visible" : "invisible"}>*/}
        {title === "Free" || active ? (
          ""
        ) : (
          <Button onClick={onButtonClick} variant="solid" intent="primary">
            {buttonText ? buttonText : `upgrade to ${title}`}
          </Button>
        )}
      </div>
    </section>
  );
}
