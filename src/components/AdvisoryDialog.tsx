import React, { type FunctionComponent, useState } from "react";
import dynamic from "next/dynamic";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter } from "./ui/dialog";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import type { AdvisoryAffectedPackage } from "@/types/api/api";
import { CVSSBadge } from "./common/Severity";
import { compareSemver } from "@/services/versionCheck";
import {
  CVSS31_METRICS,
  CVSS40_METRICS,
  buildVectorString,
  parseCvssVector,
  vectorStringToScore,
  vectorStringToSeverity,
} from "@/utils/cvss";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  { ssr: false },
);

export interface AdvisoryFormData {
  title: string;
  description: string;
  severity: string;
  vectorString: string;
  affectedPackages: Omit<AdvisoryAffectedPackage, "id">[];
  state: string;
}

interface AdvisoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdvisoryFormData) => Promise<void>;
  initialValues?: AdvisoryFormData;
}

type PackageRow = Omit<AdvisoryAffectedPackage, "id">;

const emptyPackage = (): PackageRow => ({
  ecosystem: "",
  packageName: "",
  versionStart: "",
  versionEnd: "",
});

const Version_RE = /^v?\d+\.\d+\.\d+$/;

const defaultValues = (initialValues?: AdvisoryFormData): AdvisoryFormData => ({
  title: initialValues?.title ?? "",
  description: initialValues?.description ?? "",
  severity: initialValues?.severity ?? "",
  vectorString: initialValues?.vectorString ?? "",
  affectedPackages:
    initialValues?.affectedPackages && initialValues.affectedPackages.length > 0
      ? initialValues.affectedPackages
      : [emptyPackage()],
  state: initialValues?.state ?? "draft",
});

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

  const form = useForm<AdvisoryFormData>({
    defaultValues: defaultValues(initialValues),
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "affectedPackages",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvssVersion, setCvssVersion] = useState<"3.1" | "4.0">(
    parsedInitialVector?.version ?? "3.1",
  );
  const [cvssVals, setCvssVals] = useState<Record<string, string>>(
    parsedInitialVector?.metrics ?? {},
  );

  const vectorstring = form.watch("vectorString");

  const handleVectorChange = (val: string) => {
    form.setValue("vectorString", val, { shouldValidate: true });
    const parsed = parseCvssVector(val);
    if (parsed) {
      setCvssVersion(parsed.version);
      setCvssVals(parsed.metrics);
    }
  };

  const handleCvssVersionChange = (ver: "3.1" | "4.0") => {
    setCvssVersion(ver);
    setCvssVals({});
    form.setValue("vectorString", "", { shouldValidate: true });
  };

  const setMetricValue = (metricKey: string, value: string) => {
    const next = { ...cvssVals, [metricKey]: value };
    setCvssVals(next);
    form.setValue("vectorString", buildVectorString(cvssVersion, next), {
      shouldValidate: true,
    });
  };

  const cvssMetrics = cvssVersion === "3.1" ? CVSS31_METRICS : CVSS40_METRICS;
  const cvssScore = vectorStringToScore(vectorstring);

  const handleClose = (open: boolean) => {
    if (open) return;
    form.reset(defaultValues());
    setCvssVals({});
    onOpenChange(false);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        severity: vectorStringToSeverity(data.vectorString) ?? "",
        affectedPackages: data.affectedPackages.map((pkg) => ({
          ...pkg,
          versionStart: pkg.versionStart || null,
          versionEnd: pkg.versionEnd || null,
        })),
        state: "draft",
      });
      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  });

  const submitLabel = editAdvisory ? "Save Changes" : "Create Draft Advisory";
  const submittingLabel = editAdvisory ? "Editing..." : "Creating...";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editAdvisory
              ? "Edit Security Advisory"
              : "Create Security Advisory"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="title-security-advisory"
                      placeholder="Advisory title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      placeholder={`### Summary\nShort summary of the problem. Make the impact and severity as clear as possible.\n\n### Details\nGive all details on the vulnerability.`}
                      value={field.value}
                      setValue={(value) => field.onChange(value ?? "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vectorString"
              rules={{
                validate: (value) =>
                  vectorStringToSeverity(value) !== null ||
                  "Enter a valid CVSS vector string, or use the calculator below",
              }}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Vector string</FormLabel>
                    {cvssScore !== null && !isNaN(cvssScore) && (
                      <CVSSBadge cvss={cvssScore} />
                    )}
                  </div>
                  <FormControl>
                    <Input
                      data-testid="vectorString-security-advisory"
                      placeholder="CVSS:4.0/AV:N/AC:L/…"
                      {...field}
                      onChange={(e) => handleVectorChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <Tabs
                value={cvssVersion}
                onValueChange={(v) =>
                  handleCvssVersionChange(v as "3.1" | "4.0")
                }
              >
                <TabsList>
                  <TabsTrigger value="3.1">CVSS 3.1</TabsTrigger>
                  <TabsTrigger value="4.0">CVSS 4.0</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col gap-3">
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
                              <a
                                target="_blank"
                                rel="noreferrer noopener"
                                href={`https://www.first.org/cvss/calculator/${cvssVersion}`}
                              >
                                More information.
                              </a>
                            </div>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    </Label>

                    <div className="flex flex-wrap gap-1.5">
                      {metric.options.map((opt) => (
                        <Button
                          key={opt.v}
                          variant="outline"
                          type="button"
                          size={"sm"}
                          onClick={() => setMetricValue(metric.key, opt.v)}
                          className={` ${
                            cvssVals[metric.key] === opt.v
                              ? "bg-secondary text-secondary-foreground"
                              : ""
                          }`}
                        >
                          {opt.l} ({opt.v})
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Affected Packages</Label>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Package {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`affectedPackages.${index}.ecosystem`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ecosystem</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="ecosystem-security-advisory"
                              placeholder="go, npm, pypi…"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`affectedPackages.${index}.packageName`}
                      rules={{ required: "Package name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="packageName-security-advisory"
                              placeholder="pkg:example"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`affectedPackages.${index}.versionStart`}
                      rules={{
                        required: "Version Start is required",
                        pattern: {
                          value: Version_RE,
                          message: "Format: 1.2.3",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version Start</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="semverStart-security-advisory"
                              placeholder="0.0.0"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`affectedPackages.${index}.versionEnd`}
                      rules={{
                        required: "Version End is required",
                        pattern: {
                          value: Version_RE,
                          message: "Format: 1.2.3",
                        },
                        validate: (value) => {
                          const start = form.getValues(
                            `affectedPackages.${index}.versionStart`,
                          );
                          if (
                            !value ||
                            !start ||
                            !Version_RE.test(value) ||
                            !Version_RE.test(start)
                          ) {
                            return true;
                          }
                          return (
                            compareSemver(value, start) >= 0 ||
                            "Must be greater than or equal to Semver Start"
                          );
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version End</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="semverEnd-security-advisory"
                              placeholder="1.0.0"
                              {...(field as any)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => append(emptyPackage())}
                disabled={fields.length >= 10}
                className={fields.length >= 10 ? "opacity-50" : ""}
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                Add Package
              </Button>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-security-advisory"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisoryDialog;
