// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
/* type SbomPdfProps = Omit<PdfDocumentProps, "body"> & {
  body: sbomBody;
};
 */
interface sbomBody {
  components: sbomComponent[];
}

type sbomComponent = {
  purl: string;
  name: string;
  version: string;
  type: string;
  licenses: string[];
};

type SbomPdfProps = PdfDocumentProps;

const componetA = {
  purl: "pkg:npm/react@18.2.0",
  name: "React",
  version: "18.2.0",
  type: "npm",
  licenses: ["MIT"],
};
const componetB = {
  purl: "pkg:npm/react-dom@18.2.0",
  name: "React DOM",
  version: "18.2.0",
  type: "npm",
  licenses: ["MIT"],
};

// Create arrays with 10 copies of each component and concatenate them
const components: sbomComponent[] = [
  ...Array(10).fill(componetA),
  ...Array(10).fill(componetB),
];

import { FunctionComponent } from "react";
import PdfDocument, { PdfDocumentProps } from "./PdfDocument";
import { table } from "console";

const SbomPdf: FunctionComponent<SbomPdfProps> = (props) => {
  return (
    <PdfDocument
      header={props.header}
      body={sbomBody(components)}
      footer={props.footer}
    />
  );
};

export default SbomPdf;

const sbomBody = (components: sbomComponent[]) => {
  return (
    <View>
      <View style={styles.table}>
        <View>{sbomTableHeader()}</View>
        <View>{sbomTableBody(components)}</View>
      </View>
    </View>
  );
};

const sbomTableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={styles.col1}>Package URL</Text>
    <Text style={styles.col2}>Name</Text>
    <Text style={styles.col3}>Version</Text>
    <Text style={styles.col4}>Licenses</Text>
    <Text style={styles.col5}>Type</Text>
  </View>
);

const sbomTableBody = (components: sbomComponent[]) =>
  components.map((component, index) => (
    <View style={styles.tableRow} key={index}>
      <Text style={styles.col1}>{component.purl}</Text>
      <Text style={styles.col2}>{component.name}</Text>
      <Text style={styles.col3}>{component.version}</Text>
      <Text style={styles.col4}>{component.licenses.join(", ")}</Text>
      <Text style={styles.col5}>{component.type}</Text>
    </View>
  ));

const styles = StyleSheet.create({
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: "row",
    fontWeight: "bold",
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 10,
  },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 1 },
  col4: { flex: 1 },
  col5: { flex: 1 },
});

/* const PdfHeader = (props: headerProps) => (
  <View
    style={styles.header}
    fixed
    render={({ pageNumber }) => {
      if (pageNumber === 1) {
        return (
          <View style={styles.headerBox}>
            <Text style={styles.h1}>{props.pdfTitle}</Text>
          </View>
        );
      }
      return (
        <View style={styles.headerBox}>
          <View style={styles.headerText}>
            <Text>{props.title}</Text>
            <Text>{props.project}</Text>
            <Text style={styles.headerRepoText}>{props.repo}</Text>
          </View>
          <View style={styles.logo}>
            <Logo logoLink={props.logoLink} />
          </View>
        </View>
      );
    }}
  ></View>
); */
