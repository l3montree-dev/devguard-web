import Page from "@/components/Page";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { classNames } from "@/utils/common";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ProductsList from "@/pages/Billing/ProductsList";
import Title from "@/pages/Billing/Title";

import React from "react";

export default function Billing({ productsData }) {
  const activeOrg = useActiveOrg();
  const orgName = activeOrg?.name;

  return (
    <Page title="Billing">
      <Title orgName={orgName} />
      <ProductsList productsData={productsData} />
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps = withSession(
  withInitialState(
    async (ctx: GetServerSidePropsContext, _, { organizations }) => {
      // check if we can redirect to the first organization

      //fetch data from the server
      const products = await fetch("http://localhost:4040/billing/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          orgId: "1",
        },
      });

      if (!products.ok)
        throw new Error("Something went wrong with fetching movies");

      const productsData = await products.json();

      return {
        props: {
          productsData,
        },
      };
    },
  ),
);
