import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React from "react";
import { withSession } from "../decorators/withSession";
import { withOrgs } from "../decorators/withOrgs";
import { middleware } from "@/decorators/middleware";
import { withOrganization } from "@/decorators/withOrganization";

const Index = () => {
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = middleware(
  async (ctx: GetServerSidePropsContext, { organizations }) => {
    // check if we can redirect to the first organization
    if (organizations.length > 0) {
      return {
        redirect: {
          destination: `/${organizations[0].slug}`,
          permanent: false,
        },
      };
    } else {
      // redirect to the create organization page
      return {
        redirect: {
          destination: `/setup-organization`,
          permanent: false,
        },
      };
    }
  },
  {
    organizations: withOrgs,
    organization: withOrganization,
    session: withSession,
  },
);

export default Index;
