import { useText } from "@/lib/i18n/use-text";
export default function DashboardLoading() {
  const t = useText();
  return (
    <div className="dash-loading">
      <div className="dash-skeleton" />
      <div className="dash-skeleton short" />
      <div className="dash-skeleton" />
    </div>
  );
}
