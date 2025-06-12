// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Font } from "@react-pdf/renderer";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

const hyphenationCallback = (word: string) => {
  const result = [];
  let lastIndex = 0;
  let slashCount = 0;
  let hasSpecialChar = false;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    if (char === "@") {
      result.push(word.slice(lastIndex, i));
      lastIndex = i;
      hasSpecialChar = true;
    }

    if (char === "/") {
      slashCount++;
      if (slashCount % 2 === 0) {
        result.push(word.slice(lastIndex, i));
        lastIndex = i;
        hasSpecialChar = true;
      }
    }
  }

  if (hasSpecialChar) {
    result.push(word.slice(lastIndex));
    return result.filter(Boolean);
  }

  const chunks = [];
  for (let i = 0; i < word.length; i += 10) {
    chunks.push(word.slice(i, i + 10));
  }
  return chunks;
};

Font.registerHyphenationCallback(hyphenationCallback);

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
    <View style={styles.tableRow} key={index} wrap={false}>
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
    fontSize: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 8,
    gap: 10,
  },
  tableHeader: {
    flexDirection: "row",
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 10,
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  col1: { flex: 2 },
  col2: { flex: 2 },
  col3: { flex: 1 },
  col4: { flex: 1 },
  col5: { flex: 1 },
});
