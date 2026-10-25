"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type Route = {
  path: string;
  segments: string[];
  query: URLSearchParams;
};

export function useRoute(): Route {
  const path = usePathname() || "/";
  const params = useSearchParams();
  return { path, segments: path.split("/").filter(Boolean), query: new URLSearchParams(params.toString()) };
}

export function navigate(to: string) {
  window.location.assign(to);
}

type LinkProps = {
  to: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Link({ to, children, ...rest }: LinkProps) {
  const external = /^(https?:|mailto:|tel:|sms:)/.test(to);
  if (external) {
    return (
      <a href={to} target={to.startsWith("http") ? "_blank" : undefined} rel={to.startsWith("http") ? "noreferrer" : undefined} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}
