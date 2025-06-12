import { TextAlignJustifyIcon } from "@radix-ui/react-icons";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { FunctionComponent } from "react";
import { Font } from "@react-pdf/renderer";
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "public/fonts/Inter-VariableFont_opsz,wght.ttf",
      fontWeight: "medium",
      fontStyle: "normal",
    },
    {
      src: "public/fonts/Inter-VariableFont_opsz,wght.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
    {
      src: "public/fonts/Inter-VariableFont_opsz,wght.ttf",
      fontWeight: "semibold",
      fontStyle: "normal",
    },
  ],
});

Font.register({
  family: "Lexend",
  fonts: [
    {
      src: "public/fonts/Lexend/Lexend-Light.ttf",
      fontWeight: "light",
      fontStyle: "normal",
    },
    {
      src: "public/fonts/Lexend/Lexend-Regular.ttf",
      fontWeight: "medium",
      fontStyle: "normal",
    },
  ],
});

interface headerProps {
  title: string;
  project: string;
  repo: string;
  logoLink: string;
  logoWidth: number;
  logoRatio: number;
  pdfTitle?: string;
}

interface footerProps {
  datum: string;
}

export interface PdfDocumentProps {
  header: headerProps;
  body: any;
  footer: footerProps;
}

const PdfDocument: FunctionComponent<PdfDocumentProps> = (props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PdfHeader {...props.header} />
      <View style={styles.body}>{props.body}</View>
      <PdfFooter datum={props.footer.datum} />
    </Page>
  </Document>
);

export default PdfDocument;

const styles = StyleSheet.create({
  fullPage: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100vh",
  },
  page: {
    //    fontFamily: "Inter",
    paddingTop: 150,
    paddingBottom: 100,
    paddingHorizontal: 75,
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "medium",
  },
  startPage: {
    //  fontFamily: "Inter",
  },
  body: {
    left: 20,
  },
  logo: {
    position: "absolute",
    top: 10,
    right: 10,
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
    left: 20,
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    paddingBottom: 20,
    gap: 2,
  },
  headerRepoText: {
    fontWeight: "semibold",
    width: "100%",
  },
  headerPdfTitle: {
    paddingBottom: 20,
    width: "100%",
  },
  headerPdfText: {
    width: "100%",
    fontFamily: "Lexend",
    fontWeight: "light",
    fontSize: 24,
  },
  headerPdfSymbol: {
    position: "absolute",
    fontSize: 100,
    paddingTop: 50,
    top: 0,
    left: 40,
  },
  footer: {
    position: "absolute",
    fontSize: 10,
    paddingHorizontal: 50,
    paddingBottom: 50,
    bottom: 0,
    left: 0,
  },
  footerText: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },

  footerBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #000",
    paddingTop: 10,
    paddingBottom: 20,
  },

  headerBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #000",
    paddingTop: 10,
    paddingBottom: 20,
  },

  pdfTitleHeader: {},

  border: {},
});

const Logo = ({
  logoLink,
  width,
  ratio,
}: {
  logoLink: string;
  width: number;
  ratio: number;
}) => (
  <View style={styles.logo}>
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    <Image src={logoLink} style={{ width: width, height: width / ratio }} />
  </View>
);
const PdfHeader = (props: headerProps) => (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    }}
    fixed
    render={({ pageNumber }) => {
      if (pageNumber === 1) {
        return (
          <View>
            <View style={styles.headerPdfSymbol}>
              <Text>*</Text>
            </View>
            <View style={styles.header}>
              <View style={styles.headerBox}>
                <View style={styles.headerPdfTitle}>
                  <Text style={styles.headerPdfText}>{props.pdfTitle}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      }
      return (
        <View style={styles.header}>
          <View style={styles.headerBox}>
            <View style={styles.headerText}>
              <Text>{props.title}</Text>
              <Text>{props.project}</Text>
              <Text style={styles.headerRepoText}>{props.repo}</Text>
            </View>
            <View style={styles.logo}>
              <Logo
                logoLink={props.logoLink}
                width={props.logoWidth}
                ratio={props.logoRatio}
              />
            </View>
          </View>
        </View>
      );
    }}
  ></View>
);

const PdfFooter = (props: footerProps) => (
  <View fixed style={styles.footer}>
    <View fixed style={styles.footerBox}>
      <View style={styles.footerText}>
        <Text>{props.datum}</Text>
        <Text>Generated by DevGuard</Text>
      </View>
      <View style={styles.pageNumber}>
        <Text render={({ pageNumber }) => `${pageNumber}`} />
      </View>
    </View>
  </View>
);
