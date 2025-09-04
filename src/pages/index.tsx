import { middleware } from "@/decorators/middleware";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { withOrgs } from "../decorators/withOrgs";
import { withSession } from "../decorators/withSession";
import { getApiClientFromContext } from "../services/devGuardApi";

const Index = () => {
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = middleware(
  async (ctx: GetServerSidePropsContext, { organizations, session }) => {
    // check if we can redirect to the first organization
    // trigger a sync - maybe we navigated here to fast after registration
    const orgsAfterTrigger = await getApiClientFromContext(ctx)(
      "/trigger-sync",
      {
        method: "GET",
      },
    );

    if (orgsAfterTrigger.ok) {
      const orgs = await orgsAfterTrigger.json();
      // merge the orgs
      organizations = [...organizations, ...orgs];
    }

    if (organizations.length > 0) {
      return {
        redirect: {
          destination: `/${organizations[0].slug}`,
          permanent: false,
        },
      };
    } else if (session) {
      // redirect to the create organization page
      return {
        redirect: {
          destination: `/setup`,
          permanent: false,
        },
      };
    }
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
    };
  },
  {
    organizations: withOrgs,
    session: withSession,
  },
);

export default Index;
