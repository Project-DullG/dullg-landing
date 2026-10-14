import { cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import { translateText } from "./translate";

/** Localize authored JSX without altering form values, URLs, or community contributions. */
export function localizeEnglishTree(node: ReactNode, locale: string): ReactNode {
  if (locale !== "en") return node;
  if (typeof node === "string") return translateText(node, locale);
  if (Array.isArray(node)) return node.map((child) => localizeEnglishTree(child, locale));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Record<string, unknown>>;
  const props = element.props;
  if (props["data-english-user-content"] !== undefined) return node;
  const changes: Record<string, unknown> = {};
  for (const key of ["aria-label", "title", "alt", "placeholder"])
    if (typeof props[key] === "string") changes[key] = translateText(props[key], locale);
  if (props.children !== undefined)
    changes.children = localizeEnglishTree(props.children as ReactNode, locale);
  return cloneElement(element, changes);
}
