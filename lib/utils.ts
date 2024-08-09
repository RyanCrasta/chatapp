import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  console.log("ppp", inputs);
  return twMerge(clsx(inputs));
}

// for conditional applying classes use clsx
