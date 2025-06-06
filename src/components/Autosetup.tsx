import Orb from "./ui/orb";
import { Loader2 } from "lucide-react";
import React, { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  handleAutosetup: (pendingAutosetup: false) => Promise<void>;
  progress: {
    [key: string]: {
      status: "notStarted" | "pending" | "success";
      message: string;
      url?: string;
    };
  };
  Loader: () => React.ReactNode;
  isLoading: boolean;
}

const Autosetup: FunctionComponent<Props> = ({
  handleAutosetup,
  progress,
  isLoading,
  Loader,
}) => {
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        toast.error(
          "The auto-setup is taking longer than expected. Please try again later.",
        );
        setTimedOut(true);
      }
    }, 18000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const isReallyLoading = isLoading && !timedOut;

  const asset = useActiveAsset();
  return (
    <div className="">
      <div className="relative isolate">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto flex max-w-2xl flex-col gap-16 px-6 py-16 ring-1 bg-card/50 ring-primary/10 sm:rounded-lg sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
            <div className="h-96 w-full flex-none max-w-sm relative">
              <span className="text-2xl font-semibold absolute inset-0 flex items-center justify-center">
                Auto-Setup
              </span>
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={false}
                hue={0}
                forceHoverState={isReallyLoading}
              />
            </div>
            <div className="w-full flex-auto">
              <CardHeader>
                <CardTitle className="flex flex-row gap-2">
                  <SparklesIcon className="w-5 text-muted-foreground" /> Get
                  started in Seconds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  You can use the auto-setup feature to automatically add the
                  DevGuard Pipeline to the GitLab CI/CD pipeline for the project{" "}
                  <span>{asset?.repositoryName}</span>, create a Merge-Request
                  and add any missing configuration variables and webhooks.
                </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-col items-start justify-start gap-4">
                {progress.mergeRequest.status === "success" &&
                progress.mergeRequest.url !== undefined ? (
                  <Link
                    href={
                      Object.values(progress).find(
                        (v) => v.url && v.status === "success",
                      )?.url || "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button disabled={isReallyLoading}>
                      <Loader />
                      View Merge Request
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled={isReallyLoading}
                    onClick={() => handleAutosetup(false)}
                  >
                    <Loader />
                    Use Auto-Setup
                  </Button>
                )}
                <div className="flex flex-col gap-2">
                  {Object.entries(progress).map(([key, value], i) => (
                    <div
                      className="flex flex-row items-center gap-2 text-sm text-muted-foreground"
                      key={key}
                    >
                      {value.status === "notStarted" ? (
                        i + 1 + "."
                      ) : value.status === "pending" && !isReallyLoading ? (
                        <ExclamationCircleIcon className="mr-2 h-4 w-4 text-red-600" />
                      ) : value.status === "pending" && isReallyLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      )}
                      <span className="flex-1">
                        {value.message}
                        {"url" in value && (
                          <>
                            <br />
                            <a
                              href={value.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {value.url}
                            </a>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 -z-20 flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
            className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#F9BC23] to-[#f4d27c] opacity-15"
          />
        </div>
      </div>
    </div>
  );
};

export default Autosetup;
