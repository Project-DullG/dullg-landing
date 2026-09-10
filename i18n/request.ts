import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => ({
  locale: (await headers()).get("x-dullg-locale") === "en" ? "en" : "ko",
  messages: {},
  timeZone: "Asia/Seoul",
}));
