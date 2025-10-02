"use client";

import { useMemo } from "react";
import useSWR from "swr";

import Page from "@/components/Page";
import { browserApiClient } from "@/services/devGuardApi";

import ProductManagement from "@/components/billling/ProductManagement";
import Products from "@/components/billling/ProductsList";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { ProductsData } from "@/types/api/billing";
import Link from "next/link";
import { fetcher } from "@/data-fetcher/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import Err from "@/components/common/Err";

export default function Billing() {
  const activeOrg = useActiveOrg();
  const orgName = activeOrg.name;
  const orgID = activeOrg.id;

  // Fetch products data
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useSWR<ProductsData[]>("/billing/products", fetcher);

  // Fetch organization product/subscription data
  const {
    data: orgProductData,
    error: orgProductError,
    isLoading: orgProductLoading,
  } = useSWR<{ productID: string }>(`/billing/subscriptions/${orgID}`, fetcher);

  const productsDataSorted = useMemo(
    () => productsData?.sort((a, b) => a.price - b.price) || [],
    [productsData],
  );

  const isLoading = productsLoading || orgProductLoading;
  const error = productsError || orgProductError;

  // Show loading state
  if (isLoading) {
    return (
      <Page
        title="Billing"
        Title={
          <span className="flex flex-row gap-2">
            <Link
              href={`/${activeOrg.slug}`}
              className="text-white hover:no-underline"
            >
              {activeOrg.name}
            </Link>
            <span className="opacity-75">/</span>
            <Link
              className="text-white hover:no-underline"
              href={`/${activeOrg.slug}/billing`}
            >
              Billing
            </Link>
          </span>
        }
      >
        <div className="space-y-4">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-48" />
        </div>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return <Err />;
  }

  const orgProductID = orgProductData?.productID;

  const orgProduct = productsData?.find(
    (product) => product.id === orgProductID,
  );

  const orgProductName = orgProduct ? orgProduct.name : "Free";

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
    <Page
      title="Billing"
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="text-white hover:no-underline"
          >
            {activeOrg.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg.slug}/billing`}
          >
            Billing
          </Link>
        </span>
      }
    >
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
