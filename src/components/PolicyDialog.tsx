import { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { useForm } from "react-hook-form";
import { Policy } from "../types/api/api";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import FileUpload from "./FileUpload";
import { useDropzone } from "react-dropzone";
import CopyCode, { CopyCodeFragment } from "./common/CopyCode";
import Callout from "./common/Callout";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  buttonTitle: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (policy: Policy) => void;
  policy?: Policy; // if defined -  we need to update
}

const PolicyDialog: FunctionComponent<Props> = ({
  isOpen,
  title,
  description,
  onOpenChange,
  policy,
  buttonTitle,
  onSubmit,
}) => {
  const form = useForm<Policy>({
    defaultValues: {
      title: policy?.title || "",
      description: policy?.description || "",
      rego: policy?.rego || "",
      predicateType: policy?.predicateType || "https://cyclonedx.org/bom",
    },
  });

  const dropzone = useDropzone({
    accept: {
      "text/plain": [".rego"],
    },
    onDrop: (acceptedFiles) => {
      // read the content
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        form.setValue("rego", content);
      };
      reader.readAsText(acceptedFiles[0]);
    },
  });

  const content = form.watch("rego");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="predicateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Predicate Type</FormLabel>
                  <FormControl>
                    <Input placeholder="https://cyclonedx.org/bom" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    This value will be used to match attestations to policies.
                  </FormDescription>
                </FormItem>
              )}
            />
            {content ? (
              <div>
                <CopyCode codeString={content} />
                <div className="flex flex-row justify-end">
                  <Button
                    className="mt-4"
                    variant={"outline"}
                    onClick={() => form.setValue("rego", "")}
                  >
                    Change content
                  </Button>
                </div>
              </div>
            ) : (
              <FileUpload dropzone={dropzone} />
            )}
            <p className="text-muted-foreground text-sm">
              Use a .rego editor to create a policy. Be inspired by our example
              policies you find here:{" "}
              <Link
                target="_blank"
                href={"https://play.openpolicyagent.org/p/DKToCnw0DL"}
              >
                https://play.openpolicyagent.org/p/DKToCnw0DL
              </Link>
              . Test your policies by using an example json file as input.
            </p>
            <Callout intent="info">
              Create an attestation for this policy using the command below.{" "}
              <CopyCodeFragment
                codeString={`devguard-scanner attest --predicateType "${form.watch(
                  "predicateType",
                )}" <json file>`}
              />
            </Callout>
            <DialogFooter>
              <Button type="submit">{buttonTitle}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;
