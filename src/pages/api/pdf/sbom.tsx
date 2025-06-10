import { renderToBuffer } from "@react-pdf/renderer";
import { NextApiRequest, NextApiResponse } from "next";
import MyDocument from "../../../components/pdf/PdfDocument";

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  console.log("Received request to generate PDF");
  try {
    console.log("Generating PDF...");
    const buffer =   await renderToBuffer(<MyDocument />, );

    console.log("PDF generated successfully");
   
    // set the correct headers for PDF
    res.setHeader("Content-Type", "application/pdf");

    res.status(200).send(buffer);
  } catch (error) {}
};
