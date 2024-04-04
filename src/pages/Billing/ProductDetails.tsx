import Button from "@/components/common/Button";
import { GetServerSideProps } from "next";

export default function ProductDetails({
  title,
  description,
  price,
  subLink,
  buttonText,
}: {
  title: string;
  description: string;
  price: number;
  subLink?: string;
  buttonText?: string;
}) {
  return (
    <section className="rounded-b-md rounded-t-sm  border border-yellow-400 bg-stone-100   p-6">
      <div className="">
        <h1 className="pb-2 text-xl font-bold">{title}</h1>
        <span className="font-bold">{description}</span>
      </div>
      <main className="flex  py-5">
        <span className=" align-top">€</span>
        <div className="basis-1/2 text-7xl font-bold">{price}</div>
        <div className="basis-1/2 text-sm">
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
        <Button href={subLink} variant="solid" intent="primary">
          {buttonText ? buttonText : `upgrade to ${title}`}
        </Button>
      </div>
    </section>
  );
}
