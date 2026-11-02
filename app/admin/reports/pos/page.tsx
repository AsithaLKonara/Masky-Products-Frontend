import { redirect } from "next/navigation";
import { FEATURES } from "@/config/features";
import PageClient from "./PageClient";

export default function PosReportPage() {
  if (!FEATURES.ENABLE_POS) {
    redirect("/admin/reports");
  }
  return <PageClient />;
}
