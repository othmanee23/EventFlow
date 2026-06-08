import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateRange(startValue: string, endValue: string) {
  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(startDate)} - ${new Intl.DateTimeFormat("en", {
      day: "numeric",
      year: "numeric",
    }).format(endDate)}`;
  }

  if (sameYear) {
    return `${new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(startDate)} - ${new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(endDate)}`;
  }

  return `${formatDate(startValue)} - ${formatDate(endValue)}`;
}

export function isPastDate(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(value);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
