import type { ProgrammaticPage } from "@/lib/programmatic-pages";

export function toolLabel(page: ProgrammaticPage) {
  return [page.appPrimary, page.appSecondary].filter(isString).map(titleFromSlug).join(" + ") || "Zapier workflow";
}

export function titleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part === "api") return "API";
      if (part === "crm") return "CRM";
      if (part === "fb") return "Facebook";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export function textList(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isString(value: string | null): value is string {
  return Boolean(value);
}
