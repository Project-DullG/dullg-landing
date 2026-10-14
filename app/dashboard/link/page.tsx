import { localizedRedirect } from "@/lib/i18n/server";

// Keep previously shared student URLs usable with the personal registration form.
export default async function LinkStudentPage() {
  return localizedRedirect("/dashboard/register");
}
