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
type SbomPdfProps = Omit<PdfDocumentProps, "body"> & {
  body: SBOM;
};

import { FunctionComponent } from "react";
import PdfDocument, { PdfDocumentProps } from "./PdfDocument";
import { table } from "console";
import { Components, SBOM } from "./sbom";

const SbomPdf: FunctionComponent<SbomPdfProps> = (props) => {
  return (
    <PdfDocument
      header={props.header}
      body={sbomBody(props.body.components)}
      footer={props.footer}
    />
  );
};

export default SbomPdf;

const sbomBody = (components: Components[]) => {
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

const sbomTableBody = (components: Components[]) =>
  components.map((component, index) => (
    <View style={styles.tableRow} key={index}>
      <Text style={styles.col1}>{component.purl}</Text>
      <Text style={styles.col2}>{component.name}</Text>
      <Text style={styles.col3}>{component.version}</Text>
      {component.licenses && component.licenses.length > 0 ? (
        <Text style={styles.col4}>
          {component.licenses
            .map((l) => l.license.name || l.license.id)
            .join(", ")}
        </Text>
      ) : (
        <Text style={styles.col4}></Text>
      )}
      <Text style={styles.col4}></Text>
      <Text style={styles.col5}>{component.type}</Text>
    </View>
  ));
//component.licenses.join(", ")
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
    wordBreak: "break-all",
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
