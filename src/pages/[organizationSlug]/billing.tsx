import { useMemo, useState } from "react";
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
import Products from "@/components/Billing/ProductsList";
import { config as appConfig } from "@/config";

export default function Billing({
  productsData,
  orgProductID,
}: {
  productsData: ProductsData[];
  orgProductID: string;
}) {
  const activeOrg = useActiveOrg();
  const orgName = activeOrg.name;
  const orgID = activeOrg.id;

  const orgProduct = productsData.find(
    (product) => product.id === orgProductID,
  );

  const orgProductName = orgProduct ? orgProduct.name : "Free";

  const productsDataSorted = useMemo(
    () => productsData.sort((a, b) => a.price - b.price),
    [productsData],
  );

  const handleClick = async (selectedPlan: string) => {
    const resp = await browserApiClient(
      "/billing/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lookupKey: selectedPlan,
          orgSlug: activeOrg.name.toLowerCase(),
        }),
      },
      "",
    );
    const data: { sessionUrl: string } = await resp.json();

    window.location.href = data.sessionUrl;
  };

  return (
    <Page title="Billing">
      {orgID === null ? (
        <div>
          <h1>Organization not found</h1>
        </div>
      ) : orgProductID === null ? (
        <Products
          productsDataWithFreeSorted={productsDataSorted}
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
      const products = await fetch(
        appConfig.flawFixApiUrl + "/billing/products",
      );
      if (!products.ok)
        throw new Error("Something went wrong with fetching the products");

      const productsData = await products.json();

      const orgID = organizations[0].id;
      const orgProduct = await fetch(
        appConfig.flawFixApiUrl + "/billing/subscriptions/" + orgID,
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
