import Page from "@/components/Page";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { classNames } from "@/utils/common";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ProductsList from "@/components/Billing/ProductsList";
import Title from "@/components/Billing/Title";

import Button from "@/components/common/Button";

import React from "react";
import { browserApiClient } from "@/services/flawFixApi";

interface productsData {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default function Billing({
  productsData,
  orgProductID,
}: {
  productsData: productsData[];
  orgProductID: number;
}) {
  const activeOrg = useActiveOrg();
  const orgName = activeOrg?.name;
  const orgID = activeOrg?.id;
  console.log("orgProductID", orgProductID);

  const orgProduct = productsData.find(
    (product) => product.id === orgProductID,
  );
  const orgProductName = orgProduct?.name;

  const handleClick = async (selectedPlan: string) => {
    console.log("clicked", selectedPlan);
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
        <>
          <Title orgName={orgName} />
          <ProductsList
            recommended="Gold"
            productsData={productsData}
            orgProductID={orgProductID}
            onButtonClick={handleClick}
          />
        </>
      ) : (
        <>
          <Title orgName={orgName} orgProductName={orgProductName} />
          <Button
            //add body to request

            href={`http://localhost:4040/billing/create-portal-session/${orgID}`}
            variant="solid"
            intent="primary"
          >
            {" "}
            mange subscription
          </Button>
        </>
      )}
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(
  withInitialState(
    async (ctx: GetServerSidePropsContext, _, { organizations }) => {
      console.log(organizations[0].id, ctx.params);
      // check if we can redirect to the first organization

      //fetch data from the server
      const products = await fetch("http://localhost:4040/billing/products");
      if (!products.ok)
        throw new Error("Something went wrong with fetching the products");

      const productsData = await products.json();

      const orgID = organizations[0].id;
      console.log("orgID", orgID);
      const orgProduct = await fetch(
        "http://localhost:4040/billing/subscriptions/" + orgID,
        //"http://localhost:4040/billing/subscriptions/13",
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
        console.log("orgProduct", orgProduct);
        orgProductData = await orgProduct.json();
        orgProductID = orgProductData?.productID;
      }

      console.log("orgProductID", orgProductID);

      return {
        props: {
          productsData,
          orgProductID,
        },
      };
    },
  ),
);
