"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { turnBetween, type ReadingOrder } from "@/lib/reading-order";

const OrderContext = createContext<ReadingOrder>([]);

/** Hands the book's order (content/reading.ts) to everything that turns a page. */
export function ReadingOrderProvider({
  order,
  children,
}: {
  order: ReadingOrder;
  children: ReactNode;
}) {
  return <OrderContext value={order}>{children}</OrderContext>;
}

export function useReadingOrder(): ReadingOrder {
  return useContext(OrderContext);
}

/**
 * A link to another page of the book that knows which way the page turns:
 * forward if it leads further in, back if it leads nearer the front, and not
 * at all if it leads somewhere outside the book.
 */
export function TurnLink({
  href,
  ...rest
}: { href: string } & Omit<ComponentProps<typeof Link>, "href">) {
  const order = useReadingOrder();
  const pathname = usePathname();
  const turn = turnBetween(order, pathname, href);
  return <Link href={href} transitionTypes={turn ? [turn] : undefined} {...rest} />;
}
