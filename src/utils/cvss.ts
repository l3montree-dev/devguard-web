export type CvssMetric = {
  key: string;
  label: string;
  group?: string;
  options: { v: string; l: string }[];
  description?: string;
};

export const CVSS31_METRICS: CvssMetric[] = [
  {
    key: "AV",
    label: "Attack Vector",
    options: [
      { v: "(N)", l: "Network" },
      { v: "(A)", l: "Adjacent" },
      { v: "(L)", l: "Local" },
      { v: "(P)", l: "Physical" },
    ],
    description:
      "This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.",
  },
  {
    key: "AC",
    label: "Attack Complexity",
    options: [
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.",
  },
  {
    key: "PR",
    label: "Privileges Required",
    options: [
      { v: "(N)", l: "None" },
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric describes the level of privileges an attacker must possess prior to successfully exploiting the vulnerability. The method by which the attacker obtains privileged credentials prior to the attack (e.g., free trial accounts), is outside the scope of this metric. Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack.",
  },
  {
    key: "UI",
    label: "User Interaction",
    options: [
      { v: "(N)", l: "None" },
      { v: "(R)", l: "Required" },
    ],
    description:
      "This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable system. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner.",
  },
  {
    key: "S",
    label: "Scope",
    options: [
      { v: "(U)", l: "Unchanged" },
      { v: "(C)", l: "Changed" },
    ],
    description:
      "Does a successful attack impact a component other than the vulnerable component? If so, the Base Score increases and the Confidentiality, Integrity and Authentication metrics should be scored relative to the impacted component.",
  },
  {
    key: "C",
    label: "Confidentiality Impact",
    options: [
      { v: "(N)", l: "None" },
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
  },
  {
    key: "I",
    label: "Integrity Impact",
    options: [
      { v: "(N)", l: "None" },
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information.",
  },
  {
    key: "A",
    label: "Availability Impact",
    options: [
      { v: "(N)", l: "None" },
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. It refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component.",
  },
];

export const CVSS40_METRICS: CvssMetric[] = [
  {
    key: "AV",
    label: "Attack Vector",
    options: [
      { v: "(N)", l: "Network" },
      { v: "(A)", l: "Adjacent" },
      { v: "(L)", l: "Local" },
      { v: "(P)", l: "Physical" },
    ],
    description:
      "This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.",
  },
  {
    key: "AC",
    label: "Attack Complexity",
    options: [
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric reflects the context by which vulnerability exploitation is possible. This metric value (and consequently the resulting severity) will be larger the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable system. The assumption is that the number of potential attackers for a vulnerability that could be exploited from across a network is larger than the number of potential attackers that could exploit a vulnerability requiring physical access to a device, and therefore warrants a greater severity.",
  },
  {
    key: "AT",
    label: "Attack Requirements",
    options: [
      { v: "(N)", l: "None" },
      { v: "(P)", l: "Present" },
    ],
    description:
      "This metric captures the prerequisite deployment and execution conditions or variables of the vulnerable system that enable the attack. These differ from security-enhancing techniques/technologies (ref Attack Complexity) as the primary purpose of these conditions is not to explicitly mitigate attacks, but rather, emerge naturally as a consequence of the deployment and execution of the vulnerable system.",
  },
  {
    key: "PR",
    label: "Privileges Required",
    options: [
      { v: "(N)", l: "None" },
      { v: "(L)", l: "Low" },
      { v: "(H)", l: "High" },
    ],
    description:
      "This metric describes the level of privileges an attacker must possess prior to successfully exploiting the vulnerability. The method by which the attacker obtains privileged credentials prior to the attack (e.g., free trial accounts), is outside the scope of this metric. Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack.",
  },
  {
    key: "UI",
    label: "User Interaction",
    options: [
      { v: "(N)", l: "None" },
      { v: "(P)", l: "Passive" },
      { v: "(A)", l: "Active" },
    ],
    description:
      "This metric captures the requirement for a human user, other than the attacker, to participate in the successful compromise of the vulnerable system. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner.",
  },
  {
    key: "VC",
    label: "Confidentiality",
    group: "Vulnerable System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to the confidentiality of the information managed by the VULNERABLE SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
  },
  {
    key: "VI",
    label: "Integrity",
    group: "Vulnerable System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the VULNERABLE SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).",
  },
  {
    key: "VA",
    label: "Availability",
    group: "Vulnerable System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to the availability of the VULNERABLE SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.",
  },
  {
    key: "SC",
    label: "Confidentiality",
    group: "Subsequent System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to the confidentiality of the information managed by the SUBSEQUENT SYSTEM due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
  },
  {
    key: "SI",
    label: "Integrity",
    group: "Subsequent System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information. Integrity of the SUBSEQUENT SYSTEM is impacted when an attacker makes unauthorized modification of system data. Integrity is also impacted when a system user can repudiate critical actions taken in the context of the system (e.g. due to insufficient logging).",
  },
  {
    key: "SA",
    label: "Availability",
    group: "Subsequent System Impact Metrics",
    options: [
      { v: "(H)", l: "High" },
      { v: "(L)", l: "Low" },
      { v: "(N)", l: "None" },
    ],
    description:
      "This metric measures the impact to the availability of the SUBSEQUENT SYSTEM resulting from a successfully exploited vulnerability. While the Confidentiality and Integrity impact metrics apply to the loss of confidentiality or integrity of data (e.g., information, files) used by the system, this metric refers to the loss of availability of the impacted system itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of a system.",
  },
];

export function scoreToSeverity(score: number): string {
  if (score === 0) return "None";
  if (score < 4) return "Low";
  if (score < 7) return "Medium";
  if (score < 9) return "High";
  return "Critical";
}

function roundup(input: number): number {
  const intInput = Math.round(input * 100000);
  if (intInput % 10000 === 0) return intInput / 100000;
  return (Math.floor(intInput / 10000) + 1) / 10;
}

export function calcCvss31(v: Record<string, string>): number {
  const AV =
    ({ N: 0.85, A: 0.62, L: 0.55, P: 0.2 } as Record<string, number>)[v.AV] ??
    0;
  const AC = ({ L: 0.77, H: 0.44 } as Record<string, number>)[v.AC] ?? 0;
  const PRu = { N: 0.85, L: 0.62, H: 0.27 } as Record<string, number>;
  const PRc = { N: 0.85, L: 0.68, H: 0.5 } as Record<string, number>;
  const PR = (v.S === "C" ? PRc : PRu)[v.PR] ?? 0;
  const UI = ({ N: 0.85, R: 0.62 } as Record<string, number>)[v.UI] ?? 0;
  const C = ({ N: 0, L: 0.22, H: 0.56 } as Record<string, number>)[v.C] ?? 0;
  const I = ({ N: 0, L: 0.22, H: 0.56 } as Record<string, number>)[v.I] ?? 0;
  const A = ({ N: 0, L: 0.22, H: 0.56 } as Record<string, number>)[v.A] ?? 0;

  const iscBase = 1 - (1 - C) * (1 - I) * (1 - A);
  const isc =
    v.S === "U"
      ? 6.42 * iscBase
      : 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
  if (isc <= 0) return 0;

  const exp = 8.22 * AV * AC * PR * UI;
  const raw =
    v.S === "U" ? Math.min(isc + exp, 10) : Math.min(1.08 * (isc + exp), 10);
  return roundup(raw);
}

// =========================================================================
// CVSS 4.0 scoring — ported from the official FIRST reference implementation
// (https://github.com/FIRSTdotorg/cvss-v4-calculator). CVSS 4.0 does NOT use a
// closed-form formula like 3.1; it maps a vector onto one of 270 "MacroVectors"
// via a lookup table and then interpolates by severity distance. The data
// tables below (lookup, maxComposed, maxSeverity) are copied verbatim from the
// reference and MUST NOT be hand-edited. License: BSD-2-Clause (FIRST, Red Hat).
// =========================================================================

const CVSS40_MAX_SEVERITY = {
  eq1: { 0: 1, 1: 4, 2: 5 },
  eq2: { 0: 1, 1: 2 },
  eq3eq6: {
    0: { 0: 7, 1: 6 },
    1: { 0: 8, 1: 8 },
    2: { 1: 10 },
  },
  eq4: { 0: 6, 1: 5, 2: 4 },
  eq5: { 0: 1, 1: 1, 2: 1 },
} as const;

const CVSS40_MAX_COMPOSED: Record<
  string,
  Record<number, string[] | Record<string, string[]>>
> = {
  eq1: {
    0: ["AV:N/PR:N/UI:N/"],
    1: ["AV:A/PR:N/UI:N/", "AV:N/PR:L/UI:N/", "AV:N/PR:N/UI:P/"],
    2: ["AV:P/PR:N/UI:N/", "AV:A/PR:L/UI:P/"],
  },
  eq2: {
    0: ["AC:L/AT:N/"],
    1: ["AC:H/AT:N/", "AC:L/AT:P/"],
  },
  eq3: {
    0: {
      "0": ["VC:H/VI:H/VA:H/CR:H/IR:H/AR:H/"],
      "1": ["VC:H/VI:H/VA:L/CR:M/IR:M/AR:H/", "VC:H/VI:H/VA:H/CR:M/IR:M/AR:M/"],
    },
    1: {
      "0": ["VC:L/VI:H/VA:H/CR:H/IR:H/AR:H/", "VC:H/VI:L/VA:H/CR:H/IR:H/AR:H/"],
      "1": [
        "VC:L/VI:H/VA:L/CR:H/IR:M/AR:H/",
        "VC:L/VI:H/VA:H/CR:H/IR:M/AR:M/",
        "VC:H/VI:L/VA:H/CR:M/IR:H/AR:M/",
        "VC:H/VI:L/VA:L/CR:M/IR:H/AR:H/",
        "VC:L/VI:L/VA:H/CR:H/IR:H/AR:M/",
      ],
    },
    2: { "1": ["VC:L/VI:L/VA:L/CR:H/IR:H/AR:H/"] },
  },
  eq4: {
    0: ["SC:H/SI:S/SA:S/"],
    1: ["SC:H/SI:H/SA:H/"],
    2: ["SC:L/SI:L/SA:L/"],
  },
  eq5: {
    0: ["E:A/"],
    1: ["E:P/"],
    2: ["E:U/"],
  },
};

const CVSS40_LOOKUP: Record<string, number> = {
  "000000": 10,
  "000001": 9.9,
  "000010": 9.8,
  "000011": 9.5,
  "000020": 9.5,
  "000021": 9.2,
  "000100": 10,
  "000101": 9.6,
  "000110": 9.3,
  "000111": 8.7,
  "000120": 9.1,
  "000121": 8.1,
  "000200": 9.3,
  "000201": 9,
  "000210": 8.9,
  "000211": 8,
  "000220": 8.1,
  "000221": 6.8,
  "001000": 9.8,
  "001001": 9.5,
  "001010": 9.5,
  "001011": 9.2,
  "001020": 9,
  "001021": 8.4,
  "001100": 9.3,
  "001101": 9.2,
  "001110": 8.9,
  "001111": 8.1,
  "001120": 8.1,
  "001121": 6.5,
  "001200": 8.8,
  "001201": 8,
  "001210": 7.8,
  "001211": 7,
  "001220": 6.9,
  "001221": 4.8,
  "002001": 9.2,
  "002011": 8.2,
  "002021": 7.2,
  "002101": 7.9,
  "002111": 6.9,
  "002121": 5,
  "002201": 6.9,
  "002211": 5.5,
  "002221": 2.7,
  "010000": 9.9,
  "010001": 9.7,
  "010010": 9.5,
  "010011": 9.2,
  "010020": 9.2,
  "010021": 8.5,
  "010100": 9.5,
  "010101": 9.1,
  "010110": 9,
  "010111": 8.3,
  "010120": 8.4,
  "010121": 7.1,
  "010200": 9.2,
  "010201": 8.1,
  "010210": 8.2,
  "010211": 7.1,
  "010220": 7.2,
  "010221": 5.3,
  "011000": 9.5,
  "011001": 9.3,
  "011010": 9.2,
  "011011": 8.5,
  "011020": 8.5,
  "011021": 7.3,
  "011100": 9.2,
  "011101": 8.2,
  "011110": 8,
  "011111": 7.2,
  "011120": 7,
  "011121": 5.9,
  "011200": 8.4,
  "011201": 7,
  "011210": 7.1,
  "011211": 5.2,
  "011220": 5,
  "011221": 3,
  "012001": 8.6,
  "012011": 7.5,
  "012021": 5.2,
  "012101": 7.1,
  "012111": 5.2,
  "012121": 2.9,
  "012201": 6.3,
  "012211": 2.9,
  "012221": 1.7,
  "100000": 9.8,
  "100001": 9.5,
  "100010": 9.4,
  "100011": 8.7,
  "100020": 9.1,
  "100021": 8.1,
  "100100": 9.4,
  "100101": 8.9,
  "100110": 8.6,
  "100111": 7.4,
  "100120": 7.7,
  "100121": 6.4,
  "100200": 8.7,
  "100201": 7.5,
  "100210": 7.4,
  "100211": 6.3,
  "100220": 6.3,
  "100221": 4.9,
  "101000": 9.4,
  "101001": 8.9,
  "101010": 8.8,
  "101011": 7.7,
  "101020": 7.6,
  "101021": 6.7,
  "101100": 8.6,
  "101101": 7.6,
  "101110": 7.4,
  "101111": 5.8,
  "101120": 5.9,
  "101121": 5,
  "101200": 7.2,
  "101201": 5.7,
  "101210": 5.7,
  "101211": 5.2,
  "101220": 5.2,
  "101221": 2.5,
  "102001": 8.3,
  "102011": 7,
  "102021": 5.4,
  "102101": 6.5,
  "102111": 5.8,
  "102121": 2.6,
  "102201": 5.3,
  "102211": 2.1,
  "102221": 1.3,
  "110000": 9.5,
  "110001": 9,
  "110010": 8.8,
  "110011": 7.6,
  "110020": 7.6,
  "110021": 7,
  "110100": 9,
  "110101": 7.7,
  "110110": 7.5,
  "110111": 6.2,
  "110120": 6.1,
  "110121": 5.3,
  "110200": 7.7,
  "110201": 6.6,
  "110210": 6.8,
  "110211": 5.9,
  "110220": 5.2,
  "110221": 3,
  "111000": 8.9,
  "111001": 7.8,
  "111010": 7.6,
  "111011": 6.7,
  "111020": 6.2,
  "111021": 5.8,
  "111100": 7.4,
  "111101": 5.9,
  "111110": 5.7,
  "111111": 5.7,
  "111120": 4.7,
  "111121": 2.3,
  "111200": 6.1,
  "111201": 5.2,
  "111210": 5.7,
  "111211": 2.9,
  "111220": 2.4,
  "111221": 1.6,
  "112001": 7.1,
  "112011": 5.9,
  "112021": 3,
  "112101": 5.8,
  "112111": 2.6,
  "112121": 1.5,
  "112201": 2.3,
  "112211": 1.3,
  "112221": 0.6,
  "200000": 9.3,
  "200001": 8.7,
  "200010": 8.6,
  "200011": 7.2,
  "200020": 7.5,
  "200021": 5.8,
  "200100": 8.6,
  "200101": 7.4,
  "200110": 7.4,
  "200111": 6.1,
  "200120": 5.6,
  "200121": 3.4,
  "200200": 7,
  "200201": 5.4,
  "200210": 5.2,
  "200211": 4,
  "200220": 4,
  "200221": 2.2,
  "201000": 8.5,
  "201001": 7.5,
  "201010": 7.4,
  "201011": 5.5,
  "201020": 6.2,
  "201021": 5.1,
  "201100": 7.2,
  "201101": 5.7,
  "201110": 5.5,
  "201111": 4.1,
  "201120": 4.6,
  "201121": 1.9,
  "201200": 5.3,
  "201201": 3.6,
  "201210": 3.4,
  "201211": 1.9,
  "201220": 1.9,
  "201221": 0.8,
  "202001": 6.4,
  "202011": 5.1,
  "202021": 2,
  "202101": 4.7,
  "202111": 2.1,
  "202121": 1.1,
  "202201": 2.4,
  "202211": 0.9,
  "202221": 0.4,
  "210000": 8.8,
  "210001": 7.5,
  "210010": 7.3,
  "210011": 5.3,
  "210020": 6,
  "210021": 5,
  "210100": 7.3,
  "210101": 5.5,
  "210110": 5.9,
  "210111": 4,
  "210120": 4.1,
  "210121": 2,
  "210200": 5.4,
  "210201": 4.3,
  "210210": 4.5,
  "210211": 2.2,
  "210220": 2,
  "210221": 1.1,
  "211000": 7.5,
  "211001": 5.5,
  "211010": 5.8,
  "211011": 4.5,
  "211020": 4,
  "211021": 2.1,
  "211100": 6.1,
  "211101": 5.1,
  "211110": 4.8,
  "211111": 1.8,
  "211120": 2,
  "211121": 0.9,
  "211200": 4.6,
  "211201": 1.8,
  "211210": 1.7,
  "211211": 0.7,
  "211220": 0.8,
  "211221": 0.2,
  "212001": 5.3,
  "212011": 2.4,
  "212021": 1.4,
  "212101": 2.4,
  "212111": 1.2,
  "212121": 0.5,
  "212201": 1,
  "212211": 0.3,
  "212221": 0.1,
};

const CVSS40_AV_LEVELS: Record<string, number> = {
  N: 0,
  A: 0.1,
  L: 0.2,
  P: 0.3,
};
const CVSS40_PR_LEVELS: Record<string, number> = { N: 0, L: 0.1, H: 0.2 };
const CVSS40_UI_LEVELS: Record<string, number> = { N: 0, P: 0.1, A: 0.2 };
const CVSS40_AC_LEVELS: Record<string, number> = { L: 0, H: 0.1 };
const CVSS40_AT_LEVELS: Record<string, number> = { N: 0, P: 0.1 };
const CVSS40_VC_LEVELS: Record<string, number> = { H: 0, L: 0.1, N: 0.2 };
const CVSS40_VI_LEVELS: Record<string, number> = { H: 0, L: 0.1, N: 0.2 };
const CVSS40_VA_LEVELS: Record<string, number> = { H: 0, L: 0.1, N: 0.2 };
const CVSS40_SC_LEVELS: Record<string, number> = { H: 0.1, L: 0.2, N: 0.3 };
const CVSS40_SI_LEVELS: Record<string, number> = {
  S: 0,
  H: 0.1,
  L: 0.2,
  N: 0.3,
};
const CVSS40_SA_LEVELS: Record<string, number> = {
  S: 0,
  H: 0.1,
  L: 0.2,
  N: 0.3,
};
const CVSS40_CR_LEVELS: Record<string, number> = { H: 0, M: 0.1, L: 0.2 };
const CVSS40_IR_LEVELS: Record<string, number> = { H: 0, M: 0.1, L: 0.2 };
const CVSS40_AR_LEVELS: Record<string, number> = { H: 0, M: 0.1, L: 0.2 };

// Resolve a metric value, applying the reference defaults for absent/X
// threat & environmental metrics (E->A, CR/IR/AR->H, modified metrics override).
function cvss40Metric(v: Record<string, string>, metric: string): string {
  const selected = v[metric] ?? "X";
  if (metric === "E" && selected === "X") return "A";
  if (metric === "CR" && selected === "X") return "H";
  if (metric === "IR" && selected === "X") return "H";
  if (metric === "AR" && selected === "X") return "H";
  const modified = v["M" + metric];
  if (modified !== undefined && modified !== "X") return modified;
  return selected;
}

function cvss40MacroVector(v: Record<string, string>): string {
  const av = cvss40Metric(v, "AV");
  const pr = cvss40Metric(v, "PR");
  const ui = cvss40Metric(v, "UI");
  const ac = cvss40Metric(v, "AC");
  const at = cvss40Metric(v, "AT");
  const vc = cvss40Metric(v, "VC");
  const vi = cvss40Metric(v, "VI");
  const va = cvss40Metric(v, "VA");
  const sc = cvss40Metric(v, "SC");
  const si = cvss40Metric(v, "SI");
  const sa = cvss40Metric(v, "SA");

  // EQ1
  let eq1: string;
  if (av === "N" && pr === "N" && ui === "N") eq1 = "0";
  else if ((av === "N" || pr === "N" || ui === "N") && av !== "P") eq1 = "1";
  else eq1 = "2";

  // EQ2
  const eq2 = ac === "L" && at === "N" ? "0" : "1";

  // EQ3
  let eq3: string;
  if (vc === "H" && vi === "H") eq3 = "0";
  else if (vc === "H" || vi === "H" || va === "H") eq3 = "1";
  else eq3 = "2";

  // EQ4
  let eq4: string;
  if (cvss40Metric(v, "MSI") === "S" || cvss40Metric(v, "MSA") === "S")
    eq4 = "0";
  else if (sc === "H" || si === "H" || sa === "H") eq4 = "1";
  else eq4 = "2";

  // EQ5
  const e = cvss40Metric(v, "E");
  const eq5 = e === "A" ? "0" : e === "P" ? "1" : "2";

  // EQ6
  const cr = cvss40Metric(v, "CR");
  const ir = cvss40Metric(v, "IR");
  const ar = cvss40Metric(v, "AR");
  const eq6 =
    (cr === "H" && vc === "H") ||
    (ir === "H" && vi === "H") ||
    (ar === "H" && va === "H")
      ? "0"
      : "1";

  return eq1 + eq2 + eq3 + eq4 + eq5 + eq6;
}

// Extract a metric's value from a composed max-vector string, e.g. "AV" -> "N".
function cvss40ExtractMetric(metric: string, str: string): string {
  const extracted = str.slice(str.indexOf(metric) + metric.length + 1);
  const slash = extracted.indexOf("/");
  return slash > 0 ? extracted.substring(0, slash) : extracted;
}

export function calcCvss40(v: Record<string, string>): number {
  // Exception: no impact on any system -> score 0.
  if (
    ["VC", "VI", "VA", "SC", "SI", "SA"].every(
      (metric) => cvss40Metric(v, metric) === "N",
    )
  ) {
    return 0;
  }

  const macroVector = cvss40MacroVector(v);
  let value = CVSS40_LOOKUP[macroVector];
  if (value === undefined) return 0;

  const eq1 = parseInt(macroVector[0], 10);
  const eq2 = parseInt(macroVector[1], 10);
  const eq3 = parseInt(macroVector[2], 10);
  const eq4 = parseInt(macroVector[3], 10);
  const eq5 = parseInt(macroVector[4], 10);
  const eq6 = parseInt(macroVector[5], 10);

  // 1a. Compute the next-lower MacroVector for each EQ (NaN if none exists).
  const eq1NextLower = `${eq1 + 1}${eq2}${eq3}${eq4}${eq5}${eq6}`;
  const eq2NextLower = `${eq1}${eq2 + 1}${eq3}${eq4}${eq5}${eq6}`;
  const eq4NextLower = `${eq1}${eq2}${eq3}${eq4 + 1}${eq5}${eq6}`;
  const eq5NextLower = `${eq1}${eq2}${eq3}${eq4}${eq5 + 1}${eq6}`;

  const scoreEq1NextLower = CVSS40_LOOKUP[eq1NextLower] ?? NaN;
  const scoreEq2NextLower = CVSS40_LOOKUP[eq2NextLower] ?? NaN;
  const scoreEq4NextLower = CVSS40_LOOKUP[eq4NextLower] ?? NaN;
  const scoreEq5NextLower = CVSS40_LOOKUP[eq5NextLower] ?? NaN;

  // eq3 and eq6 are related.
  let scoreEq3Eq6NextLower: number;
  if (eq3 === 1 && eq6 === 1) {
    scoreEq3Eq6NextLower =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`] ?? NaN;
  } else if (eq3 === 0 && eq6 === 1) {
    scoreEq3Eq6NextLower =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`] ?? NaN;
  } else if (eq3 === 1 && eq6 === 0) {
    scoreEq3Eq6NextLower =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + 1}`] ?? NaN;
  } else if (eq3 === 0 && eq6 === 0) {
    const left =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + 1}`] ?? NaN;
    const right =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`] ?? NaN;
    scoreEq3Eq6NextLower = left > right ? left : right;
  } else {
    scoreEq3Eq6NextLower =
      CVSS40_LOOKUP[`${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6 + 1}`] ?? NaN;
  }

  // 1b. Severity distance of the vector from the highest-severity vector in
  //     the same MacroVector.
  const eq1Maxes = CVSS40_MAX_COMPOSED.eq1[eq1] as string[];
  const eq2Maxes = CVSS40_MAX_COMPOSED.eq2[eq2] as string[];
  const eq3Eq6Maxes = (
    CVSS40_MAX_COMPOSED.eq3[eq3] as Record<string, string[]>
  )[macroVector[5]];
  const eq4Maxes = CVSS40_MAX_COMPOSED.eq4[eq4] as string[];
  const eq5Maxes = CVSS40_MAX_COMPOSED.eq5[eq5] as string[];

  const maxVectors: string[] = [];
  for (const m1 of eq1Maxes)
    for (const m2 of eq2Maxes)
      for (const m36 of eq3Eq6Maxes)
        for (const m4 of eq4Maxes)
          for (const m5 of eq5Maxes) maxVectors.push(m1 + m2 + m36 + m4 + m5);

  // Find the first max-vector the to-be-scored vector does not exceed.
  let dAV = 0,
    dPR = 0,
    dUI = 0,
    dAC = 0,
    dAT = 0;
  let dVC = 0,
    dVI = 0,
    dVA = 0,
    dSC = 0,
    dSI = 0,
    dSA = 0;
  let dCR = 0,
    dIR = 0,
    dAR = 0;
  for (const maxVector of maxVectors) {
    dAV =
      CVSS40_AV_LEVELS[cvss40Metric(v, "AV")] -
      CVSS40_AV_LEVELS[cvss40ExtractMetric("AV", maxVector)];
    dPR =
      CVSS40_PR_LEVELS[cvss40Metric(v, "PR")] -
      CVSS40_PR_LEVELS[cvss40ExtractMetric("PR", maxVector)];
    dUI =
      CVSS40_UI_LEVELS[cvss40Metric(v, "UI")] -
      CVSS40_UI_LEVELS[cvss40ExtractMetric("UI", maxVector)];
    dAC =
      CVSS40_AC_LEVELS[cvss40Metric(v, "AC")] -
      CVSS40_AC_LEVELS[cvss40ExtractMetric("AC", maxVector)];
    dAT =
      CVSS40_AT_LEVELS[cvss40Metric(v, "AT")] -
      CVSS40_AT_LEVELS[cvss40ExtractMetric("AT", maxVector)];
    dVC =
      CVSS40_VC_LEVELS[cvss40Metric(v, "VC")] -
      CVSS40_VC_LEVELS[cvss40ExtractMetric("VC", maxVector)];
    dVI =
      CVSS40_VI_LEVELS[cvss40Metric(v, "VI")] -
      CVSS40_VI_LEVELS[cvss40ExtractMetric("VI", maxVector)];
    dVA =
      CVSS40_VA_LEVELS[cvss40Metric(v, "VA")] -
      CVSS40_VA_LEVELS[cvss40ExtractMetric("VA", maxVector)];
    dSC =
      CVSS40_SC_LEVELS[cvss40Metric(v, "SC")] -
      CVSS40_SC_LEVELS[cvss40ExtractMetric("SC", maxVector)];
    dSI =
      CVSS40_SI_LEVELS[cvss40Metric(v, "SI")] -
      CVSS40_SI_LEVELS[cvss40ExtractMetric("SI", maxVector)];
    dSA =
      CVSS40_SA_LEVELS[cvss40Metric(v, "SA")] -
      CVSS40_SA_LEVELS[cvss40ExtractMetric("SA", maxVector)];
    dCR =
      CVSS40_CR_LEVELS[cvss40Metric(v, "CR")] -
      CVSS40_CR_LEVELS[cvss40ExtractMetric("CR", maxVector)];
    dIR =
      CVSS40_IR_LEVELS[cvss40Metric(v, "IR")] -
      CVSS40_IR_LEVELS[cvss40ExtractMetric("IR", maxVector)];
    dAR =
      CVSS40_AR_LEVELS[cvss40Metric(v, "AR")] -
      CVSS40_AR_LEVELS[cvss40ExtractMetric("AR", maxVector)];

    if (
      [
        dAV,
        dPR,
        dUI,
        dAC,
        dAT,
        dVC,
        dVI,
        dVA,
        dSC,
        dSI,
        dSA,
        dCR,
        dIR,
        dAR,
      ].some((d) => d < 0)
    ) {
      continue;
    }
    break;
  }

  const currentSeverityDistanceEq1 = dAV + dPR + dUI;
  const currentSeverityDistanceEq2 = dAC + dAT;
  const currentSeverityDistanceEq3Eq6 = dVC + dVI + dVA + dCR + dIR + dAR;
  const currentSeverityDistanceEq4 = dSC + dSI + dSA;

  const step = 0.1;

  // 1a (cont). Maximal scoring difference per EQ (NaN if no lower MacroVector).
  const availableDistanceEq1 = value - scoreEq1NextLower;
  const availableDistanceEq2 = value - scoreEq2NextLower;
  const availableDistanceEq3Eq6 = value - scoreEq3Eq6NextLower;
  const availableDistanceEq4 = value - scoreEq4NextLower;
  const availableDistanceEq5 = value - scoreEq5NextLower;

  const maxSeverityEq1 = CVSS40_MAX_SEVERITY.eq1[eq1 as 0 | 1 | 2] * step;
  const maxSeverityEq2 = CVSS40_MAX_SEVERITY.eq2[eq2 as 0 | 1] * step;
  const maxSeverityEq3Eq6 =
    (CVSS40_MAX_SEVERITY.eq3eq6 as Record<number, Record<number, number>>)[eq3][
      eq6
    ] * step;
  const maxSeverityEq4 = CVSS40_MAX_SEVERITY.eq4[eq4 as 0 | 1 | 2] * step;

  // 1c/1d. Proportional distance * maximal scoring difference, per EQ.
  let normalizedEq1 = 0,
    normalizedEq2 = 0,
    normalizedEq3Eq6 = 0,
    normalizedEq4 = 0,
    normalizedEq5 = 0;
  let nExistingLower = 0;

  if (!Number.isNaN(availableDistanceEq1)) {
    nExistingLower += 1;
    normalizedEq1 =
      availableDistanceEq1 * (currentSeverityDistanceEq1 / maxSeverityEq1);
  }
  if (!Number.isNaN(availableDistanceEq2)) {
    nExistingLower += 1;
    normalizedEq2 =
      availableDistanceEq2 * (currentSeverityDistanceEq2 / maxSeverityEq2);
  }
  if (!Number.isNaN(availableDistanceEq3Eq6)) {
    nExistingLower += 1;
    normalizedEq3Eq6 =
      availableDistanceEq3Eq6 *
      (currentSeverityDistanceEq3Eq6 / maxSeverityEq3Eq6);
  }
  if (!Number.isNaN(availableDistanceEq4)) {
    nExistingLower += 1;
    normalizedEq4 =
      availableDistanceEq4 * (currentSeverityDistanceEq4 / maxSeverityEq4);
  }
  if (!Number.isNaN(availableDistanceEq5)) {
    // eq5 proportion is always 0.
    nExistingLower += 1;
    normalizedEq5 = 0;
  }

  // 2. Mean of the proportional distances.
  const meanDistance =
    nExistingLower === 0
      ? 0
      : (normalizedEq1 +
          normalizedEq2 +
          normalizedEq3Eq6 +
          normalizedEq4 +
          normalizedEq5) /
        nExistingLower;

  // 3. MacroVector score minus the mean distance, rounded to one decimal.
  value -= meanDistance;
  if (value < 0) value = 0;
  if (value > 10) value = 10;
  return Math.round(value * 10) / 10;
}

export function vectorStringToSeverity(vec: string): string | null {
  const parsed = parseCvssVector(vec);
  if (!parsed) return null;
  try {
    const score =
      parsed.version === "3.1"
        ? calcCvss31(parsed.metrics)
        : calcCvss40(parsed.metrics);
    return scoreToSeverity(score);
  } catch {
    return null;
  }
}

export function vectorStringToScore(vec: string): number | null {
  const parsed = parseCvssVector(vec);
  if (!parsed) return null;
  try {
    return parsed.version === "3.1"
      ? calcCvss31(parsed.metrics)
      : calcCvss40(parsed.metrics);
  } catch {
    return null;
  }
}

export function buildVectorString(
  version: "3.1" | "4.0",
  vals: Record<string, string>,
): string {
  const metrics = version === "3.1" ? CVSS31_METRICS : CVSS40_METRICS;
  const parts = metrics
    .map((m) => `${m.key}:${vals[m.key] ?? ""}`)
    .filter((p) => !p.endsWith(":"));
  return `CVSS:${version}/${parts.join("/")}`;
}

export function parseCvssVector(
  vectorstring: string,
): { version: "3.1" | "4.0"; metrics: Record<string, string> } | null {
  const upper = vectorstring.trim().toUpperCase();
  let version: "3.1" | "4.0" | null = null;
  if (upper.startsWith("CVSS:4.0/")) version = "4.0";
  else if (upper.startsWith("CVSS:3.1/")) version = "3.1";
  if (!version) return null;

  const metrics = Object.fromEntries(
    upper
      .split("/")
      .slice(1)
      .map((p) => p.split(":") as [string, string]),
  );
  return { version, metrics };
}
