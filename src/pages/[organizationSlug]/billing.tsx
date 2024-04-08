import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import Page from "@/components/Page";
import { browserApiClient } from "@/services/flawFixApi";
import Button from "@/components/common/Button";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import ProductManagement from "@/components/Billing/ProductManagement";
import { ProductsData } from "@/types/api/billing";
import Products from "@/components/Billing/Productslist";

const freeProduct = {
  id: "999",
  name: "Free",
  description: "Use GitLab for personal projects",
  price: 0,
  features: [
    "Unlimited projects",
    "Unlimited storage",
    "Advanced analytics",
    "Custom permissions",
    "Advanced integrations",
  ],
};

export default function Billing({
  productsData,
  orgProductID,
}: {
  productsData: ProductsData[];
  orgProductID: string;
}) {
  const activeOrg = useActiveOrg();
  const orgName = activeOrg?.name;
  const orgID = activeOrg?.id;

  const orgProduct = productsData.find(
    (product) => product.id === orgProductID,
  );
  const orgProductName = orgProduct?.name;

  const productsDataWithFree = [freeProduct, ...productsData];
  const productsDataWithFreeSorted = productsDataWithFree.sort(
    (a, b) => a.price - b.price,
  );

  const handleClick = async (selectedPlan: string) => {
    const resp = await browserApiClient(
      "/billing/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lookupKey: selectedPlan, orgID: activeOrg?.id }),
      },
      "",
    );
    const data: { sessionUrl: string } = await resp.json();

    window.location.href = data.sessionUrl;
  };

  return (
    <Page title="Billing">
      {orgProductID === null ? (
        <Products
          productsDataWithFreeSorted={productsDataWithFreeSorted}
          onButtonClick={handleClick}
        />
      ) : (
        <ProductManagement
          orgName={orgName}
          orgProductName={orgProductName}
          orgID={orgID}
        />
      )}
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(
  withInitialState(
    async (ctx: GetServerSidePropsContext, _, { organizations }) => {
      const products = await fetch("http://localhost:4040/billing/products");
      if (!products.ok)
        throw new Error("Something went wrong with fetching the products");

      const productsData = await products.json();

      const orgID = organizations[0].id;
      const orgProduct = await fetch(
        //"http://localhost:4040/billing/subscriptions/" + orgID,
        "http://localhost:4040/billing/subscriptions/13",
        {
          method: "GET",
          headers: {
            Cookie: ctx.req.headers.cookie as string,
          },
        },
      );
      let orgProductData = null;
      let orgProductID = null;
      if (orgProduct.ok) {
        orgProductData = await orgProduct.json();
        orgProductID = orgProductData?.productID;
      }

      return {
        props: {
          productsData,
          orgProductID,
        },
      };
    },
  ),
);
