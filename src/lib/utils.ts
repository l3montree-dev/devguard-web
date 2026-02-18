import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkDeletedProject(projectName: string): boolean {
  return projectName.includes("-deletion_scheduled-");
}
