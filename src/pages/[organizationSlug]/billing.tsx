import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useMemo } from "react";

import Page from "@/components/Page";
import { withSession } from "@/decorators/withSession";
import { browserApiClient } from "@/services/flawFixApi";

import ProductManagement from "@/components/Billing/ProductManagement";
import Products from "@/components/Billing/ProductsList";
import { config as appConfig } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { ProductsData } from "@/types/api/billing";
import { middleware } from "@/decorators/middleware";
import { withOrg } from "@/decorators/withOrg";

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
        body: JSON.stringify({ lookupKey: selectedPlan, orgID: activeOrg.id }),
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

export const getServerSideProps: GetServerSideProps = middleware(
  async (ctx: GetServerSidePropsContext, { organizations }) => {
    const products = await fetch(appConfig.flawFixApiUrl + "/billing/products");
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

    if (orgProduct.status === 403) {
      // the user is not allowed to see the billing page -
      // redirect the user to the organization overview
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

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
  {
    session: withSession,
    organizations: withOrg,
  },
);
