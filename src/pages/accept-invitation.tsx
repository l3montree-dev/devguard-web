import { middleware } from "@/decorators/middleware";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { GetServerSideProps } from "next";
import React from "react";

const AcceptInvitation = () => {
  return <div></div>;
};

export default AcceptInvitation;

export const getServerSideProps: GetServerSideProps = middleware(
  async (context) => {
    // make a request to accept that invitation
    const apiClient = getApiClientFromContext(context);
    const code = context.query.code as string;
    if (!code) {
      return {
        notFound: true,
      };
    }

    const resp = await apiClient("/accept-invitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!resp.ok) {
      return {
        notFound: true,
      };
    }

    // the invitation was accepted - redirect the user to the organization
    const { slug } = await resp.json();
    return {
      redirect: {
        destination: `/${slug}`,
        permanent: false,
      },
    };

    return {
      props: {},
    };
  },
  {
    session: withSession,
  },
);
