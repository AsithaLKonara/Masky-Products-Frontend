import { redirect } from "next/navigation";
import { FEATURES } from "@/config/features";
import PageClient from "./PageClient";

export const metadata = {
  title: "POS Sales - Admin Dashboard",
};

export default function POSSalesPage() {
  if (!FEATURES.ENABLE_POS) {
    redirect("/admin");
  }
  return <PageClient />;
}
