import { notFound, redirect } from "next/navigation";
import { config } from "../config";
import { HttpError } from "./http-error";

export function handleHttpError(
  error: unknown,
  organizationSlug?: string,
): never {
  if (error instanceof HttpError) {
    if (error.statusCode === 402) {
      const billingUrl = new URL(config.billingUrl);
      billingUrl.searchParams.set("expired", "1");
      if (organizationSlug) {
        billingUrl.searchParams.set("orgName", organizationSlug);
      }
      redirect(billingUrl.toString());
    }
    if (error.statusCode === 403 && organizationSlug) {
      redirect("/" + organizationSlug + "/oauth2error");
    }
    if (error.statusCode === 401 || error.statusCode === 404) {
      notFound();
    }
  }
  throw error;
}
