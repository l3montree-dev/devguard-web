"use client";
import { BlocksIcon, FileCheckIcon, LandmarkIcon } from "lucide-react";
import Image from "next/image";
import ThreeJSScene from "./ThreeJSScene";

const ThreeJSFeatureScreen = () => {
  return (
    <div className="relative w-3/5 bg-card">
      <div className="absolute pointer-events-none dark:bg-secondary/50 bg-card/5 p-5 rounded-lg backdrop-blur-lg w-1/2 m-10 top-0 right-0 z-10">
        <div className="mt-2 flex flex-col gap-4">
          <div className="">
            <span className="text-xl text-center font-bold dark:text-white">
              See your Software-Supply-Chain in different perspectives
            </span>
          </div>
          <hr />
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
              <span className="font-medium dark:text-white">
                Get AppSec done with ease
              </span>
            </div>
          </div>
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <FileCheckIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium dark:text-white">
                Automated Tracking, Documentation & Reporting
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute pointer-events-none w-1/2 dark:bg-secondary/50 bg-card/5 p-5 backdrop-blur-lg rounded-lg bottom-0 m-10 left-0 z-10">
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <BlocksIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium dark:text-white">
                Use with your favorite tools
              </span>
            </div>
          </div>
          <div className="flex gap-4 flex-row">
            <div className="rounded-full bg-card w-10 h-10 flex flex-row items-center justify-center border">
              <LandmarkIcon className="h-6 dark:text-white w-6" />
            </div>
            <div className="flex-1">
              <span className="font-medium dark:text-white">
                Open Source & Made in Europe
              </span>
            </div>
          </div>
        </div>
      </div>
      <ThreeJSScene />
    </div>
  );
};

export default ThreeJSFeatureScreen;
