import { ProjectDTO } from "@/types/api/api";
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { FunctionComponent } from "react";
import { Input } from "../ui/input";

interface Props {
    form: UseFormReturn<ProjectDTO, any, undefined>;
  }



export const ProjectForm: FunctionComponent<Props> = ({ form}) =>  (
 <>
            <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>The name of the project.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>The description of the project.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
      </>
);