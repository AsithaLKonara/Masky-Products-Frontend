import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "Multi-Channel Control Center | Masky Admin",
  description: "Centralized marketplace management for Daraz, eBay, Amazon, and Web Store channels.",
};

export default function ChannelsPage() {
  return <PageClient />;
}
