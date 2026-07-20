export function advisorySource(id: string): string | null {
  if (/^WID-SEC/i.test(id)) return "CERT-Bund (Germany)";
  if (/^NCSC-\d{4}-/i.test(id)) return "NCSC (Netherlands)";
  return null;
}

export function advisorySourceUrl(id: string): string | null {
  if (/^WID-SEC/i.test(id)) {
    // The portal expects the ID without the internal single-letter segment,
    const name = id.replace(/^(WID-SEC)-[A-Za-z]-/i, "$1-");
    return `https://wid.cert-bund.de/portal/wid/securityadvisory?name=${encodeURIComponent(name)}`;
  }
  // NCSC advisories live under year/id
  const ncsc = id.match(/^NCSC-(\d{4})-/i);
  if (ncsc) {
    return `https://advisories.ncsc.nl/${ncsc[1]}/${id.toLowerCase()}.html`;
  }
  return null;
}
