// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import DetailedLogsTable from "@/components/logs/DetailedLogsTable";
import { Card, CardContent } from "@/components/ui/card";
import { useInstanceAdmin } from "@/context/InstanceAdminContext";
import { fetchInstanceLogs } from "@/services/adminService";
import type { InstanceLogsHandle } from "@/types/view/admin";
import type { Log } from "@/types/view/logs";
import type { Paged } from "@/types/view/pagination";
import { useSearchParams } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

export default forwardRef<InstanceLogsHandle>(function InstanceLogs(_, ref) {
  const { getSigningKey } = useInstanceAdmin();
  const searchParams = useSearchParams();
  const query = searchParams?.toString();

  const [logs, setLogs] = useState<Paged<Log> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    const key = getSigningKey();
    if (!key) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLogs(await fetchInstanceLogs(key, query));
      setError(null);
    } catch {
      setError("Failed to fetch instance logs.");
    } finally {
      setLoading(false);
    }
  }, [getSigningKey, query]);

  useImperativeHandle(ref, () => ({ refresh: loadLogs }), [loadLogs]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return <DetailedLogsTable logs={logs} isLoading={loading} />;
});
