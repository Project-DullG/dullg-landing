import { useLocale } from "next-intl";
import { translateValue } from "./translate";
export function useText() {
  const locale = useLocale();
  return <T>(value: T): T => translateValue(value, locale);
}
