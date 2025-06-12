import { renderToBuffer } from "@react-pdf/renderer";
import { NextApiRequest, NextApiResponse } from "next";
import PdfDocument from "../../../components/pdf/PdfDocument";
import { LogoutLink } from "@/hooks/logoutLink";
import { any } from "zod";
import { Text } from "@react-pdf/renderer";
import SbomPdf from "@/components/pdf/SbomPdf";
import { SBOM } from "@/components/pdf/sbom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("Received request to generate PDF");

  let sbom = req.body as SBOM;
  if (!sbom) {
    sbom = {
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      version: 1,
      metadata: {
        timestamp: "2025-06-12T08:56:23Z",
        component: {
          "bom-ref": "main",
          type: "application",
          author: "L3montree Cybersecurity",
          publisher: "github.com/l3montree-dev/devguard",
          name: "main",
          version: "latest",
        },
      },
      components: [
        {
          "bom-ref": "pkg:deb/debian/base-files@12.4+deb12u11",
          type: "application",
          name: "debian/base-files",
          version: "12.4+deb12u11",
          licenses: [],
          purl: "pkg:deb/debian/base-files@12.4+deb12u11",
        },
        {
          "bom-ref": "pkg:deb/debian/netbase@6.4",
          type: "application",
          name: "debian/netbase",
          version: "6.4",
          licenses: [],
          purl: "pkg:deb/debian/netbase@6.4",
        },
        {
          "bom-ref": "pkg:deb/debian/tzdata@2025b-0+deb12u1",
          type: "application",
          name: "debian/tzdata",
          version: "2025b-0+deb12u1",
          licenses: [],
          purl: "pkg:deb/debian/tzdata@2025b-0+deb12u1",
        },
        {
          "bom-ref": "pkg:golang/al.essio.dev/pkg/shellescape@v1.6.0",
          type: "library",
          name: "al.essio.dev/pkg/shellescape",
          version: "v1.6.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/al.essio.dev/pkg/shellescape@v1.6.0",
        },
        {
          "bom-ref": "pkg:golang/dario.cat/mergo@v1.0.2",
          type: "library",
          name: "dario.cat/mergo",
          version: "v1.0.2",
          licenses: [{ license: { id: "BSD-3-Clause", name: "BSD-3-Clause" } }],
          purl: "pkg:golang/dario.cat/mergo@v1.0.2",
        },
        {
          "bom-ref": "pkg:golang/filippo.io/edwards25519@v1.1.0",
          type: "library",
          name: "filippo.io/edwards25519",
          version: "v1.1.0",
          licenses: [{ license: { id: "BSD-3-Clause", name: "BSD-3-Clause" } }],
          purl: "pkg:golang/filippo.io/edwards25519@v1.1.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/agnivade/levenshtein@v1.2.1",
          type: "library",
          name: "github.com/agnivade/levenshtein",
          version: "v1.2.1",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/agnivade/levenshtein@v1.2.1",
        },
        {
          "bom-ref":
            "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/azcore@v1.14.0",
          type: "library",
          name: "github.com/azure/azure-sdk-for-go/sdk/azcore",
          version: "v1.14.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/azcore@v1.14.0",
        },
        {
          "bom-ref":
            "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/azidentity@v1.7.0",
          type: "library",
          name: "github.com/azure/azure-sdk-for-go/sdk/azidentity",
          version: "v1.7.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/azidentity@v1.7.0",
        },
        {
          "bom-ref":
            "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/security/keyvault/azkeys@v1.1.0",
          type: "library",
          name: "github.com/azure/azure-sdk-for-go/sdk/security/keyvault/azkeys",
          version: "v1.1.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/azure/azure-sdk-for-go/sdk/security/keyvault/azkeys@v1.1.0",
        },
        {
          "bom-ref":
            "pkg:golang/github.com/azure/go-ansiterm@v0.0.0-20210617225240-d185dfc1b5a1",
          type: "library",
          name: "github.com/azure/go-ansiterm",
          version: "v0.0.0-20210617225240-d185dfc1b5a1",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/azure/go-ansiterm@v0.0.0-20210617225240-d185dfc1b5a1",
        },
        {
          "bom-ref": "pkg:golang/github.com/bahlo/generic-list-go@v0.2.0",
          type: "library",
          name: "github.com/bahlo/generic-list-go",
          version: "v0.2.0",
          licenses: [{ license: { id: "BSD-3-Clause", name: "BSD-3-Clause" } }],
          purl: "pkg:golang/github.com/bahlo/generic-list-go@v0.2.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/beorn7/perks@v1.0.1",
          type: "library",
          name: "github.com/beorn7/perks",
          version: "v1.0.1",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/beorn7/perks@v1.0.1",
        },
        {
          "bom-ref": "pkg:golang/github.com/bmatcuk/doublestar/v4@v4.8.1",
          type: "library",
          name: "github.com/bmatcuk/doublestar/v4",
          version: "v4.8.1",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/bmatcuk/doublestar/v4@v4.8.1",
        },
        {
          "bom-ref":
            "pkg:golang/github.com/bradleyfalzon/ghinstallation/v2@v2.15.0",
          type: "library",
          name: "github.com/bradleyfalzon/ghinstallation/v2",
          version: "v2.15.0",
          licenses: [{ license: { id: "Apache-2.0", name: "Apache-2.0" } }],
          purl: "pkg:golang/github.com/bradleyfalzon/ghinstallation/v2@v2.15.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/briandowns/spinner@v1.23.2",
          type: "library",
          name: "github.com/briandowns/spinner",
          version: "v1.23.2",
          licenses: [{ license: { id: "Apache-2.0", name: "Apache-2.0" } }],
          purl: "pkg:golang/github.com/briandowns/spinner@v1.23.2",
        },
        {
          "bom-ref": "pkg:golang/github.com/buger/jsonparser@v1.1.1",
          type: "library",
          name: "github.com/buger/jsonparser",
          version: "v1.1.1",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/buger/jsonparser@v1.1.1",
        },
        {
          "bom-ref": "pkg:golang/github.com/casbin/casbin/v2@v2.105.0",
          type: "library",
          name: "github.com/casbin/casbin/v2",
          version: "v2.105.0",
          licenses: [{ license: { id: "Apache-2.0", name: "Apache-2.0" } }],
          purl: "pkg:golang/github.com/casbin/casbin/v2@v2.105.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/casbin/gorm-adapter/v3@v3.32.0",
          type: "library",
          name: "github.com/casbin/gorm-adapter/v3",
          version: "v3.32.0",
          licenses: [{ license: { id: "Apache-2.0", name: "Apache-2.0" } }],
          purl: "pkg:golang/github.com/casbin/gorm-adapter/v3@v3.32.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/casbin/govaluate@v1.7.0",
          type: "library",
          name: "github.com/casbin/govaluate",
          version: "v1.7.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/casbin/govaluate@v1.7.0",
        },
        {
          "bom-ref": "pkg:golang/github.com/cenkalti/backoff/v4@v4.3.0",
          type: "library",
          name: "github.com/cenkalti/backoff/v4",
          version: "v4.3.0",
          licenses: [{ license: { id: "MIT", name: "MIT" } }],
          purl: "pkg:golang/github.com/cenkalti/backoff/v4@v4.3.0",
        },
      ],
    };

    // res.status(400).json({ error: "No SBOM data provided" });
    //return;
  }
  //console.log("SBOM data received:", sbom);

  const props = {
    frontPage: null, // No front page for SBOM PDF
    header: {
      title: "Software Bill of Materials",
      project: sbom.metadata.component.author,
      repo: sbom.metadata.component.name,
      logoLink: "public/logo_horizontal.jpg",
      logoWidth: 75,
      logoRatio: 2.832,
      pdfTitle: "SBOM\nComponents",
    },
    body: sbom,
    footer: {
      datum: new Date().toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
      }),
    },
  };

  try {
    const buffer = await renderToBuffer(<SbomPdf {...props} />);
    // set the correct headers for PDF
    res.setHeader("Content-Type", "application/pdf");

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
