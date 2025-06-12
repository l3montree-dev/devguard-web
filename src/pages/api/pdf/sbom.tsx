import { renderToBuffer } from "@react-pdf/renderer";
import { NextApiRequest, NextApiResponse } from "next";
import PdfDocument from "../../../components/pdf/PdfDocument";
import { LogoutLink } from "@/hooks/logoutLink";
import { any } from "zod";
import {Text} from "@react-pdf/renderer";
import SbomPdf from "@/components/pdf/SbomPdf";





const componet = {
  purl: "pkg:npm/react@18.2.0",
  name: "React",
  version: "18.2.0",
  type: "npm",
  licenses: ["MIT"],
}

const components = [componet];

const props = {
  header: {
    title: "Software Bill of Materials",
    project: "L3montree GmbH",
    repo: "devGuard Web",
    logoLink: "public/logo_horizontal.jpg",
    logoWidth: 75,
    logoRatio: 2.832,
    pdfTitle: "SBOM Components",
  },
  body: <Text> das ist ein test </Text>,
  footer: {
    datum: "Juni 2026",
  },
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  console.log("Received request to generate PDF");
  try {
    const buffer =   await renderToBuffer(<SbomPdf {...props} />);
    // set the correct headers for PDF
    res.setHeader("Content-Type", "application/pdf");

    res.status(200).send(buffer);
  } catch (error) {}
}; 


