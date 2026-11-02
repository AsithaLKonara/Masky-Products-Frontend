import { redirect } from "next/navigation";
import { FEATURES } from "@/config/features";
import PageClient from "./PageClient";

export default function Page() {
  if (!FEATURES.ENABLE_POS) {
    redirect("/admin");
  }
  return <PageClient />;
}
