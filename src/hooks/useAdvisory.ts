// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AdvisoryFormData } from "@/types/view/advisory";
import { useSession } from "@/context/SessionContext";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import useDecodedParams from "@/hooks/useDecodedParams";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { toast } from "@/lib/toast";
import { browserApiClient } from "@/services/devGuardApi";
import type {
  AdvisoryState,
  DetailedSecurityAdvisoryDTO,
  Paged,
  SecurityAdvisory,
  VulnEventDTO,
} from "@/types/api/api";
import { buildFilterSearchParams } from "@/utils/url";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR, { mutate } from "swr";

import type { AdvisoryEventSubmit } from "@/types/view/advisory";

const request = async (
  url: string,
  init: RequestInit,
  messages: { success: string; failure: string },
) => {
  const resp = await browserApiClient(url, init);
  if (!resp.ok) {
    const msg = await resp.text();
    toast.error(`${messages.failure}: ${msg}`);
    throw new Error(msg);
  }
  toast.success(messages.success);
  return resp;
};

const advisoryBaseURL = (params: {
  organizationSlug?: string;
  projectSlug?: string;
  assetSlug?: string;
  assetVersionSlug?: string;
}) =>
  `/organizations/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${params.assetVersionSlug}/advisory`;

export const useAdvisoryList = () => {
  const asset = useActiveAsset();
  const searchParams = useSearchParams();
  const params = useDecodedParams();

  const baseURL = advisoryBaseURL(params);

  const stateParam = searchParams?.get("state");
  const state: AdvisoryState =
    stateParam === "public" || stateParam === "withdrawn"
      ? stateParam
      : "draft";

  const listURL = useMemo(() => {
    const p = buildFilterSearchParams(searchParams);
    if (!searchParams?.has("pageSize")) p.set("pageSize", "10");
    p.append("filterQuery[state][is]", state);
    return `${baseURL}?${p.toString()}`;
  }, [searchParams, baseURL, state]);

  const {
    data: advisories,
    isLoading,
    error,
  } = useSWR<Paged<SecurityAdvisory>>(
    listURL,
    (url: string) =>
      fetcher(url).then((res: SecurityAdvisory[] | Paged<SecurityAdvisory>) =>
        Array.isArray(res)
          ? { data: res, total: res.length, page: 0, pageSize: res.length }
          : res,
      ),
    { keepPreviousData: true },
  );

  const createAdvisory = async (data: AdvisoryFormData) => {
    await request(
      `${baseURL}/`,
      { method: "POST", body: JSON.stringify({ ...data, assetID: asset?.id }) },
      {
        success: "Security Advisory created successfully!",
        failure: "Failed to create advisory",
      },
    );
    mutate(listURL);
  };

  return { advisories, isLoading, error, state, createAdvisory };
};

export const useAdvisory = () => {
  const router = useRouter();
  const { session } = useSession();
  const removeEvent = useDeleteEvent();
  const {
    organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
    advisoryId,
  } = useDecodedParams();

  const listURL = advisoryBaseURL({
    organizationSlug,
    projectSlug,
    assetSlug,
    assetVersionSlug,
  });
  const detailURL = `${listURL}/${advisoryId}/`;
  const listPath = `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/advisory`;

  const {
    data: advisory,
    isLoading,
    error,
    mutate: mutateAdvisory,
  } = useSWR<DetailedSecurityAdvisoryDTO>(
    organizationSlug &&
      projectSlug &&
      assetSlug &&
      assetVersionSlug &&
      advisoryId
      ? detailURL
      : null,
    fetcher,
  );

  const send = async (
    url: string,
    init: RequestInit,
    messages: { success: string; failure: string },
  ) => {
    const resp = await request(url, init, messages);
    mutate(detailURL);
    mutate(listURL);
    return resp;
  };

  const updateAdvisory = async (data: AdvisoryFormData) => {
    await send(
      detailURL,
      { method: "PATCH", body: JSON.stringify(data) },
      {
        success: "Advisory edited successfully",
        failure: "Failed to edit advisory",
      },
    );
  };

  const publishAdvisory = async () => {
    await send(
      `${detailURL}events/`,
      { method: "POST", body: JSON.stringify({ status: "published" }) },
      {
        success: "Advisory published successfully",
        failure: "Failed to publish advisory",
      },
    );
  };

  const withdrawAdvisory = async () => {
    await send(
      `${detailURL}events/`,
      { method: "POST", body: JSON.stringify({ status: "withdrawn" }) },
      {
        success: "Advisory withdrawn successfully",
        failure: "Failed to withdraw advisory",
      },
    );
  };

  const deleteAdvisory = async () => {
    await send(
      detailURL,
      { method: "DELETE" },
      {
        success: "Advisory deleted successfully",
        failure: "Failed to delete advisory",
      },
    );
    router.push(listPath);
  };

  const deleteAdvisoryEvent = async (eventID: string) => {
    await removeEvent(eventID);
    mutateAdvisory();
  };

  const addEvent = async (data: AdvisoryEventSubmit): Promise<boolean> => {
    if (!data.status || !advisory || !data.justification) {
      return false;
    }

    const optimisticEvent = {
      type: data.status,
      id: "optimistic",
      createdAt: new Date().toISOString(),
      justification: data.justification ?? "",
      mechanicalJustification: data.mechanicalJustification ?? "",
      userId: session?.identity.id ?? "",
      vulnId: advisory.id,
      vulnType: "securityAdvisory",
      vulnerabilityName: advisory.title ?? advisory.id,
      createdByVexRule: false,
    } as VulnEventDTO;

    try {
      await mutateAdvisory(
        async (current) => {
          const resp = await browserApiClient(`${detailURL}events/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const json = await resp.json();

          if (!json.events) {
            throw new Error("Failed to add comment");
          }
          return {
            ...current!,
            ...json,
            events: current!.events.concat([json.events.slice(-1)[0]]),
          };
        },
        {
          optimisticData: {
            ...advisory,
            events: advisory.events.concat([optimisticEvent]),
          },
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch {
      toast.error("Failed to add comment");
      return false;
    }

    toast.success("Comment added");
    return true;
  };

  return {
    advisory,
    isLoading,
    error,
    addEvent,
    deleteAdvisory,
    deleteAdvisoryEvent,
    publishAdvisory,
    updateAdvisory,
    withdrawAdvisory,
  };
};
