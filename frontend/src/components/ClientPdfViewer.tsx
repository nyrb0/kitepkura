"use client";

import dynamic from "next/dynamic";

const ClientPdfViewer = dynamic(
  () => import("@/app/PdfViewer").then((mod) => mod.PdfViewer),
  { ssr: false },
);

export default ClientPdfViewer;
