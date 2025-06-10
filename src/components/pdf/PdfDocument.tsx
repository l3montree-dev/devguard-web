import React, { FunctionComponent } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// Create Document Component
const MyDocument: FunctionComponent = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PdfHeader />
      <View style={styles.section}>
        <Text>test</Text>
      </View>
    </Page>
  </Document>
);

export default MyDocument;

const fontFamily: string[] = ["Lexend", "Inter", "Roboto", "sans-serif"];

const styles = StyleSheet.create({
  fullPage: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100vh",
  },
  page: {
    //    fontFamily: "Inter",
    padding: 75,
    paddingTop: 75,
  },
  startPage: {
    //  fontFamily: "Inter",
  },
  section: {
    marginBottom: 10,
  },
  hero: {
    position: "absolute",
    bottom: 100,
    padding: 50,
    color: "#17406E",
  },
  h1: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  h2: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  h4: {
    fontSize: 14,
    marginBottom: 7,
    marginTop: 14,
    fontWeight: "bold",
  },
  p: {
    fontSize: 12,
    marginBottom: 10,
  },
  list: {
    flexDirection: "column",
  },
  bold: {
    fontWeight: "bold",
  },
  pageNumber: {},
  header: {
    //  fontFamily: "Inter",
    position: "absolute",
    fontSize: 10,
    paddingHorizontal: 75,
    paddingTop: 50,
    top: 0,
    left: 0,
    width: "100%",
  },
  borderBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #000",
  },
});

const PdfHeader = () => (
  <View fixed style={styles.header}>
    <View style={styles.borderBox}>
      <Text>DevGuard</Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber }) => `${pageNumber}`}
      />
    </View>
  </View>
);
