import { FileCheckIcon, BlocksIcon, LandmarkIcon } from "lucide-react";
import React from "react";

import Image from "next/image";
import dynamic from "next/dynamic";

const ThreeJSScene = dynamic(() => import("./ThreeJSScene"), { ssr: false });

const ThreeJSFeatureScreen = () => {
  return (
    <div className="relative w-3/5 bg-background">
      <div className="absolute pointer-events-none dark:bg-card/50 bg-card/5 p-5 rounded-lg backdrop-blur-lg w-1/2 m-20 top-0 left-0 z-10">
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <Image
                className="h-6 invert dark:invert-0 text-primary w-6"
                src={"/assets/infinity-symbol.svg"}
                alt="DevGuard by l3montree Logo"
                width={40}
                height={40}
              />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">
                Get AppSec done with ease
              </span>
              <p className="text-sm text-muted-foreground">
                No need for hours of configuration or research. DevGuard
                provides you with a full OWASP DevSecOps pipeline, advanced
                supply chain security, and more.
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <FileCheckIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">
                Automated Tracking, Documentation & Reporting
              </span>
              <p className="text-sm text-muted-foreground">
                As a developer you love to code - probably not hasseling with
                compliance. DevGuard provides a pre-release checklist,
                prioritized todos, and a full audit trail.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute pointer-events-none w-1/2 dark:bg-card/50 bg-card/5 p-5 backdrop-blur-lg rounded-lg bottom-0 m-20 right-0 z-10">
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <BlocksIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">
                Use with your favorite tools
              </span>
              <p className="text-sm text-muted-foreground">
                Keep using your favorite tools. DevGuard integrates with all
                major continous integration pipelines & software development
                tools.
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <LandmarkIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white">
                Open Source & Made in Europe
              </span>
              <p className="text-sm text-muted-foreground">
                The core team behind DevGuard is based in Bonn, Germany. We are
                committed to open source. Especially when it comes to security.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ThreeJSScene />
    </div>
  );
};

export default ThreeJSFeatureScreen;
