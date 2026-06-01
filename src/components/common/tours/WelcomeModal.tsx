"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapIcon, CompassIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface WelcomeModalProps {
  open: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ open, onStartTour, onSkip }: WelcomeModalProps) {
  const theme = useTheme();
  const isDark = theme.resolvedTheme === "dark";
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onSkip()}>
      <DialogContent className="max-w-2xl p-8 pt-20 [&>button]:cursor-pointer">
        <div className="absolute top-6 left-8">
          {isDark ? (
            <Image
              src="/logo_inverse_horizontal.svg"
              alt="DevGuard"
              width={120}
              height={32}
            />
          ) : (
            <Image
              src="/logo_horizontal.svg"
              alt="DevGuard"
              width={120}
              height={32}
            />
          )}
        </div>

        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-bold">
            Welcome to DevGuard
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            Do you want a quick intro to get started, or would you rather
            explore on your own? You will also have the opportunity to use the
            tutorials later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onStartTour}
            className="cursor-pointer outline-none focus:outline-none flex flex-col gap-4 rounded-lg border border-primary/50 bg-primary/10 p-6 text-left hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <MapIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Quick Intro</p>
              <p className="text-sm text-muted-foreground mt-1">
                Let me show you around DevGuard in a few steps.
              </p>
            </div>
          </button>

          <button
            onClick={onSkip}
            className="cursor-pointer outline-none focus:outline-none flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-left hover:bg-accent transition-colors"
            data-testid="explore-button"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
              <CompassIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Explore myself</p>
              <p className="text-sm text-muted-foreground mt-1">
                I know my way around, let me dive right in.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
