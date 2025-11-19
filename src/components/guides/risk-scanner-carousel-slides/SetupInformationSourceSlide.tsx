import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArtifactCreateUpdateRequest } from "@/types/api/api";
import { FunctionComponent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ArtifactForm from "../../common/ArtifactForm";
import { Form } from "../../ui/form";

interface SetupInformationSourceSlideProps {
  api?: {
    scrollTo: (index: number) => void;
    reInit: () => void;
  };
  prevIndex: number;
  onInformationSourceSetup: (params: {
    branchOrTagName: string;
    isTag: boolean;
    artifactName: string;
    isDefault: boolean;
    informationSources: Array<{ url: string; purl?: string }>;
  }) => void;
}

export const SetupInformationSourceSlide: FunctionComponent<
  SetupInformationSourceSlideProps
> = ({ api, onInformationSourceSetup, prevIndex }) => {
  const form = useForm<ArtifactCreateUpdateRequest>({
    defaultValues: {
      artifactName: "",
      informationSources: [],
    },
  });

  const sources = form.watch("informationSources");
  // this is necessary since we sometimes add a purl and thus the form object changes
  // we do this dynamically in the artifact form itself.
  const sourceURLs = sources.reduce((acc, curr) => acc + curr.url, "");
  useEffect(() => {
    api?.reInit();
  }, [api, sourceURLs]);

  const handleSubmit = async (data: ArtifactCreateUpdateRequest) => {
    if (data.informationSources.length === 0) {
      toast.error("Please add at least one information source URL.");
      return;
    }
    if (data.informationSources.some((el) => !el.url || el.url.trim() === "")) {
      toast.error("Please ensure all information source URLs are valid.");
      return;
    }

    if (!data.artifactName || data.artifactName.trim() === "") {
      toast.error("Please provide a valid artifact name.");
      return;
    }

    return onInformationSourceSetup({
      branchOrTagName: "main",
      isTag: false,
      artifactName: data.artifactName,
      isDefault: true,
      informationSources: data.informationSources || [],
    });
  };

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>How do you want to Setup Devguard?</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="flex flex-col px-1 mt-10 gap-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ArtifactForm form={form} isEditMode={false} />
          <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
            <Button
              variant={"secondary"}
              id="setup-information-sources-back"
              onClick={() => {
                api?.scrollTo(prevIndex);
              }}
            >
              Back
            </Button>
            <Button id="setup-information-sources-create" type="submit">
              Create
            </Button>
          </div>
        </form>
      </Form>
    </CarouselItem>
  );
};
