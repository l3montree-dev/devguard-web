import AutoHeight from "embla-carousel-auto-height";
import Fade from "embla-carousel-fade";
import React, { type FunctionComponent, useCallback, useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import type { CarouselApi } from "./ui/carousel";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { AdvisoryAffectedPackage } from "@/types/api/api";
import { getSeverityClassNames } from "./common/Severity";
import { classNames } from "@/utils/common";
import {
  CVSS31_METRICS,
  CVSS40_METRICS,
  buildVectorString,
  calcCvss31,
  calcCvss40,
  parseCvssVector,
  scoreToSeverity,
  vectorStringToSeverity,
} from "@/utils/cvss";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

export interface AdvisoryFormData {
  title: string;
  description: string;
  severity: string;
  vectorString: string;
  affectedPackages: Omit<AdvisoryAffectedPackage, "id">[];
}

interface AdvisoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdvisoryFormData) => Promise<void>;
  initialValues?: AdvisoryFormData;
}

const SEVERITIES = ["Critical", "High", "Medium", "Low", "None"];

type PackageRow = Omit<AdvisoryAffectedPackage, "id">;

const emptyPackage = (): PackageRow => ({
  ecosystem: "",
  packagename: "",
  semverStart: "",
  semverEnd: "",
});

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

function isSemverValid(v: string): boolean {
  return v === "" || SEMVER_RE.test(v);
}

const AdvisoryDialog: FunctionComponent<AdvisoryDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}) => {
  const editAdvisory = initialValues != null;
  const parsedInitialVector = initialValues?.vectorString
    ? parseCvssVector(initialValues.vectorString)
    : null;

  const [api, setApi] = React.useState<{
    scrollTo: (index: number) => void;
    reInit: () => void;
  }>({ scrollTo: () => {}, reInit: () => {} });

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [severity, setSeverity] = useState(initialValues?.severity ?? "");
  const [vectorstring, setVectorstring] = useState(
    initialValues?.vectorString ?? "",
  );
  const [severityFromVector, setSeverityFromVector] = useState(
    !!initialValues?.vectorString &&
      !!vectorStringToSeverity(initialValues.vectorString),
  );
  const initialPackages = initialValues?.affectedPackages;
  const [packages, setPackages] = useState<PackageRow[]>(
    initialPackages && initialPackages.length > 0
      ? initialPackages
      : [emptyPackage()],
  );
  const [pkgIndex, setPkgIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cvssVersion, setCvssVersion] = useState<"3.1" | "4.0">(
    parsedInitialVector?.version ?? "3.1",
  );
  const [cvssVals, setCvssVals] = useState<Record<string, string>>(
    parsedInitialVector?.metrics ?? {},
  );

  const setProxyApi = useCallback((emblaApi: CarouselApi) => {
    setApi({
      scrollTo: (index: number) => emblaApi?.scrollTo(index),
      reInit: () => emblaApi?.reInit(),
    });
  }, []);

  const handleVectorChange = (val: string) => {
    setVectorstring(val);
    const sev = vectorStringToSeverity(val);
    if (sev) {
      setSeverity(sev);
      setSeverityFromVector(true);
    } else {
      setSeverityFromVector(false);
      if (severity && severityFromVector) setSeverity("");
    }
  };

  const handleCvssVersionChange = (ver: "3.1" | "4.0") => {
    setCvssVersion(ver);
    setCvssVals({});
  };

  const cvssMetrics = cvssVersion === "3.1" ? CVSS31_METRICS : CVSS40_METRICS;
  const cvssComplete = cvssMetrics.every((m) => cvssVals[m.key]);
  const cvssScore = cvssComplete
    ? cvssVersion === "3.1"
      ? calcCvss31(cvssVals)
      : calcCvss40(cvssVals)
    : null;

  const applyCvssBuilder = () => {
    const vec = buildVectorString(cvssVersion, cvssVals);
    setVectorstring(vec);
    const sev = scoreToSeverity(cvssScore ?? 0);
    setSeverity(sev);
    setSeverityFromVector(true);
    api.scrollTo(0);
  };

  const updatePackage = (field: keyof PackageRow, value: string) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === pkgIndex ? { ...pkg, [field]: value } : pkg)),
    );
  };

  const addPackage = () => {
    if (packages.length >= 10) return;
    setPackages((prev) => [...prev, emptyPackage()]);
    setPkgIndex(packages.length);
  };

  const removePackage = (index: number) => {
    setPackages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) return [emptyPackage()];
      return next;
    });
    setPkgIndex((prev) => Math.min(prev, packages.length - 2));
  };

  const handleClose = (open: boolean) => {
    if (open) return;
    setTitle("");
    setDescription("");
    setSeverity("");
    setVectorstring("");
    setSeverityFromVector(false);
    setPackages([emptyPackage()]);
    setPkgIndex(0);
    setCvssVals({});
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        severity,
        vectorString: vectorstring,
        affectedPackages: packages.map((pkg) => ({
          ...pkg,
          semverStart: pkg.semverStart || null,
          semverEnd: pkg.semverEnd || null,
        })),
      });
      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slide1Valid = title.trim() && severity;
  const pkg = packages[pkgIndex] ?? emptyPackage();
  const semverStartValid = isSemverValid(pkg.semverStart ?? "");
  const semverEndValid = isSemverValid(pkg.semverEnd ?? "");
  const isPackageComplete = (p: PackageRow) =>
    p.packagename.trim() !== "" &&
    SEMVER_RE.test((p.semverStart ?? "").trim()) &&
    SEMVER_RE.test((p.semverEnd ?? "").trim());
  const allPackagesValid = packages.every(isPackageComplete);
  const submitLabel = editAdvisory ? "Save Changes" : "Create Draft Advisory";
  const submittingLabel = editAdvisory ? "Editing..." : "Creating...";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto">
        <Carousel
          opts={{ watchDrag: false, containScroll: false, startIndex: 0 }}
          className="w-full"
          plugins={[AutoHeight(), Fade()]}
          setApi={setProxyApi}
        >
          <CarouselContent className="px-1">
            <CarouselItem>
              <DialogHeader>
                <DialogTitle>
                  {editAdvisory
                    ? "Edit Security Advisory"
                    : "Create Security Advisory"}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="advisory-title">Title *</Label>
                  <Input
                    id="advisory-title"
                    placeholder="Advisory title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="advisory-description">Description *</Label>
                  <Textarea
                    id="advisory-description"
                    placeholder={`### Summary\nShort summary of the problem. Make the impact and severity as clear as possible.\n\n### Details\nGive all details on the vulnerability.`}
                    className="resize-none"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="advisory-severity">Severity *</Label>
                    <span
                      className={`text-xs text-muted-foreground transition-opacity ${severityFromVector ? "opacity-100" : "opacity-0"}`}
                    >
                      — derived from vector string
                    </span>
                  </div>
                  <Select
                    value={severity}
                    onValueChange={severityFromVector ? undefined : setSeverity}
                    disabled={severityFromVector}
                  >
                    <SelectTrigger
                      id="advisory-severity"
                      className={
                        severityFromVector
                          ? "opacity-80 cursor-not-allowed"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span
                            className={classNames(
                              "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                              getSeverityClassNames(s.toUpperCase(), false),
                            )}
                          >
                            {s}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="advisory-vectorstring">Vector string</Label>
                  <Input
                    id="advisory-vectorstring"
                    placeholder="CVSS:4.0/AV:N/AC:L/…"
                    value={vectorstring}
                    onChange={(e) => handleVectorChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs cursor-pointer text-link text-left"
                    onClick={() => api.scrollTo(1)}
                  >
                    Calculate vector string
                  </button>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button disabled={!slide1Valid} onClick={() => api.scrollTo(2)}>
                  Add Packages
                </Button>
              </div>
            </CarouselItem>

            <CarouselItem>
              <DialogHeader>
                <DialogTitle>Calculate Vector String</DialogTitle>
              </DialogHeader>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm shrink-0">CVSS Version</Label>
                  <div className="flex rounded-md border overflow-hidden">
                    {(["3.1", "4.0"] as const).map((ver) => (
                      <button
                        key={ver}
                        type="button"
                        className={`px-3 py-1 cursor-pointer text-sm transition-colors ${
                          cvssVersion === ver
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleCvssVersionChange(ver)}
                      >
                        {ver}
                      </button>
                    ))}
                  </div>
                  {cvssScore !== null && (
                    <span className="ml-auto text-sm font-medium">
                      Score: {cvssScore.toFixed(1)} —{" "}
                      <span className="font-semibold">
                        {scoreToSeverity(cvssScore)}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3 border rounded-lg p-3 max-h-[50vh] overflow-y-auto pr-1">
                  {cvssMetrics.map((metric) => (
                    <div key={metric.key} className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {metric.label}{" "}
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleHelp className="w-3 h-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent>
                              <div className="relative font-normal">
                                {metric.description}{" "}
                                {cvssVersion === "4.0" && (
                                  <a
                                    target="_blank"
                                    href="https://www.first.org/cvss/calculator/4.0"
                                  >
                                    More information.
                                  </a>
                                )}
                                {cvssVersion === "3.1" && (
                                  <a
                                    target="_blank"
                                    href="https://www.first.org/cvss/calculator/3.1"
                                  >
                                    More information.
                                  </a>
                                )}
                              </div>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </Label>

                      <div className="flex flex-wrap gap-1.5">
                        {metric.options.map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() =>
                              setCvssVals((prev) => ({
                                ...prev,
                                [metric.key]: opt.v,
                              }))
                            }
                            className={`rounded-md cursor-pointer border px-3 py-1 text-xs transition-colors ${
                              cvssVals[metric.key] === opt.v
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            {opt.l} {opt.v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-2">
                <Button variant="secondary" onClick={() => api.scrollTo(0)}>
                  Back
                </Button>
                <Button disabled={!cvssComplete} onClick={applyCvssBuilder}>
                  Apply & Continue
                </Button>
              </div>
            </CarouselItem>

            <CarouselItem>
              <DialogHeader>
                <DialogTitle>Affected Packages</DialogTitle>
              </DialogHeader>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pkgIndex === 0}
                      onClick={() => setPkgIndex((i) => i - 1)}
                      className="rounded-md p-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                      Package {pkgIndex + 1} / {packages.length}
                    </span>
                    <button
                      type="button"
                      disabled={pkgIndex === packages.length - 1}
                      onClick={() => setPkgIndex((i) => i + 1)}
                      className="rounded-md p-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPackage}
                      disabled={packages.length >= 10}
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      Add Package
                    </Button>
                    {packages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removePackage(pkgIndex)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div
                  className={classNames(
                    "flex justify-center gap-1.5",
                    packages.length < 2 && "invisible",
                  )}
                >
                  {packages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPkgIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === pkgIndex
                          ? "w-4 bg-primary"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                    />
                  ))}
                </div>

                <div className="rounded-lg border p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Ecosystem</Label>
                      <Input
                        placeholder="go, npm, pypi…"
                        value={pkg.ecosystem}
                        onChange={(e) =>
                          updatePackage("ecosystem", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Package Name *</Label>
                      <Input
                        placeholder="pkg:example"
                        value={pkg.packagename}
                        onChange={(e) =>
                          updatePackage("packagename", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Semver Start *</Label>
                      <Input
                        placeholder="0.0.0"
                        value={pkg.semverStart ?? ""}
                        onChange={(e) =>
                          updatePackage("semverStart", e.target.value)
                        }
                        className={
                          !semverStartValid
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {!semverStartValid && (
                        <p className="text-xs text-destructive">
                          Format: 1.2.3
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Semver End *</Label>
                      <Input
                        placeholder="1.0.0"
                        value={pkg.semverEnd ?? ""}
                        onChange={(e) =>
                          updatePackage("semverEnd", e.target.value)
                        }
                        className={
                          !semverEndValid
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {!semverEndValid && (
                        <p className="text-xs text-destructive">
                          Format: 1.2.3
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-2">
                <Button variant="secondary" onClick={() => api.scrollTo(0)}>
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !allPackagesValid}
                  >
                    {isSubmitting ? submittingLabel : submitLabel}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisoryDialog;
