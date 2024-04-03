import Page from "@/components/Page";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { classNames } from "@/utils/common";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

import React from "react";

import Button from "@/components/common/Button";

export default function Billing() {
  const activeOrg = useActiveOrg();

  return (
    <Page title="Billing">
      <header className="m-8 text-center">
        <span> L3montree is currenlty using the Free Plan</span>
      </header>
      <section className="m-12 flex h-full flex-row justify-center gap-4 ">
        <Subscription
          label="Your current plan"
          labelColor="bg-gray-200"
          title="Free"
          description="Use GitLab for personal projects"
          price={0}
        />
        <Subscription
          label="Recommended"
          labelColor="bg-yellow-400"
          title="Premium"
          description="  For scaling organizations and multi-team usage"
          price={29}
          subLink="/billing/upgrade-to-premium"
          buttonText="Upgrade to Premium"
        />
        <Subscription
          title="Ultimate"
          description="for enterprises looking to deliver software faster"
          price={99}
          subLink="/billing/upgrade-to-ultimate"
          buttonText="Upgrade to Ultimate"
        ></Subscription>
      </section>
    </Page>
  );
}

function Subscription({
  label,
  labelColor,
  title,
  description,
  price,
  subLink,
  buttonText,
  children,
}: {
  label?: string;
  labelColor?: string;
  title: string;
  description: string;
  price: number;
  subLink?: string;
  buttonText?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-1/3  basis-1/3 flex-col ">
      <Label label={label} labelColor={labelColor} />

      <SubscriptionDetails
        title={title}
        description={description}
        price={price}
        subLink={subLink}
        buttonText={buttonText}
      />

      <SubscriptionDescription />

      <div>{children}</div>
    </div>
  );
}

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

function SubscriptionDetails({
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

      <div className={subLink ? "visible" : "invisible"}>
        <Button href={subLink} variant="solid" intent="primary">
          {buttonText ? buttonText : "-"}
        </Button>
      </div>
    </section>
  );
}

function SubscriptionDescription() {
  return (
    <div>
      <h1 className="my-4">Everything from Free, plus:</h1>
      <ul>
        <li className="mb-2">Unlimited projects</li>
        <li className="mb-2">Unlimited storage</li>
        <li className="mb-2">Advanced analytics</li>
        <li className="mb-2">Custom permissions</li>
        <li className="mb-2">Advanced integrations</li>
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(
  withInitialState(
    async (ctx: GetServerSidePropsContext, _, { organizations }) => {
      // check if we can redirect to the first organization

      return {
        props: {},
      };
    },
  ),
);
