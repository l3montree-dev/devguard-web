import { middleware } from "@/decorators/middleware";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { withOrgs } from "../decorators/withOrgs";
import { withSession } from "../decorators/withSession";

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
    session: withSession,
  },
);

export default Index;
