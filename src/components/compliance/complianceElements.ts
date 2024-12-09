// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const bsiComplianceControls = {
  con8: [
    {
      control: "CON.8.A1 - Definition von Rollen und Zuständigkeiten",
      description:
        "Für den Software-Entwicklungsprozess SOLLTE eine gesamtzuständige Person benannt werden. Außerdem SOLLTEN die Rollen und Zuständigkeiten für alle Aktivitäten im Rahmen der Software-Entwicklung festgelegt werden. Die Rollen SOLLTEN dabei fachlich die nachfolgenden Themen abdecken: Requirements-Engineering (Anforderungsmanagement) und Änderungsmanagement, Software-Entwurf und -Architektur, Informationssicherheit in der Software-Entwicklung, Software-Implementierung in dem für das Entwicklungsvorhaben relevanten Bereichen, sowie Software-Tests. Für jedes Entwicklungsvorhaben SOLLTE eine zuständige Person für die Informationssicherheit benannt werden.",
      maxEvidence: 1,
      currentEvidence: 1,
      howDevguardHelps:
        "Just by using DevGuard, you are defining roles and responsibilities for the software development process. There is a dedicated person - the owner of each asset - who is responsible for information security",
    },
    {
      control: "CON.8.A2 - Auswahl eines Vorgehensmodells",
      description:
        "Ein geeignetes Vorgehensmodell zur Software-Entwicklung MUSS festgelegt werden. Anhand des gewählten Vorgehensmodells MUSS ein Ablaufplan für die Software-Entwicklung erstellt werden. Die Sicherheitsanforderungen der Auftraggebenden an die Vorgehensweise MÜSSEN im Vorgehensmodell integriert werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A3 - Auswahl einer Entwicklungsumgebung",
      description:
        "Eine Liste der erforderlichen und optionalen Auswahlkriterien für eine Entwicklungsumgebung MUSS von Fachverantwortlichen für die Software-Entwicklung erstellt werden. Die Entwicklungsumgebung MUSS anhand der vorgegebenen Kriterien ausgewählt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A5 - Sicheres Systemdesign",
      description:
        "Folgende Grundregeln des sicheren Systemdesigns MÜSSEN in der zu entwickelnden Software berücksichtigt werden: Grundsätzlich MÜSSEN alle Eingabedaten vor der Weiterverarbeitung geprüft und validiert werden. Bei Client-Server-Anwendungen MÜSSEN die Daten grundsätzlich auf dem Server validiert werden. Die Standardeinstellungen der Software MÜSSEN derart voreingestellt sein, dass ein sicherer Betrieb der Software ermöglicht wird. Bei Fehlern oder Ausfällen von Komponenten des Systems DÜRFEN NICHT schützenswerte Informationen preisgegeben werden. Die Software MUSS mit möglichst geringen Privilegien ausgeführt werden können. Schützenswerte Daten MÜSSEN entsprechend der Vorgaben des Kryptokonzepts verschlüsselt übertragen und gespeichert werden. Zur Benutzenden-Authentisierung und Authentifizierung MÜSSEN vertrauenswürdige Mechanismen verwendet werden, die den Sicherheitsanforderungen an die Anwendung entsprechen.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A6 - Verwendung von externen Bibliotheken aus vertrauenswürdigen Quellen",
      description:
        "Wird im Rahmen des Entwicklungs- und Implementierungsprozesses auf externe Bibliotheken zurückgegriffen, MÜSSEN diese aus vertrauenswürdigen Quellen bezogen werden. Bevor externe Bibliotheken verwendet werden, MUSS deren Integrität sichergestellt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A7 - Durchführung von entwicklungsbegleitenden Software-Tests",
      description:
        "Schon bevor die Software im Freigabeprozess getestet und freigegeben wird, MÜSSEN entwicklungsbegleitende Software-Tests durchgeführt und der Quellcode auf Fehler gesichtet werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A8 - Bereitstellung von Patches, Updates und Änderungen",
      description:
        "Es MUSS sichergestellt sein, dass sicherheitskritische Patches und Updates für die entwickelte Software zeitnah durch die Entwickelnden bereitgestellt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A10 - Versionsverwaltung des Quellcodes",
      description:
        "Der Quellcode des Entwicklungsprojekts MUSS über eine geeignete Versionsverwaltung verwaltet werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A11 - Erstellung einer Richtlinie für die Software-Entwicklung",
      description:
        "Es SOLLTE eine Richtlinie für die Software-Entwicklung erstellt und aktuell gehalten werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A12 - Ausführliche Dokumentation",
      description:
        "Es SOLLTEN ausreichende Projekt-, Funktions- und Schnittstellendokumentationen erstellt und aktuell gehalten werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A14 - Schulung des Entwicklungsteams zur Informationssicherheit",
      description:
        "Die Entwickelnden und die übrigen Mitglieder des Entwicklungsteams SOLLTEN zu generellen Informationssicherheitsaspekten und zu den jeweils speziell für sie relevanten Aspekten geschult sein.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A16 - Geeignete Steuerung der Software-Entwicklung",
      description:
        "Bei einer Software-Entwicklung SOLLTE ein geeignetes Steuerungs- bzw. Projektmanagementmodell auf Basis des ausgewählten Vorgehensmodells verwendet werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "CON.8.A17 - Auswahl vertrauenswürdiger Entwicklungswerkzeuge",
      description:
        "Zur Entwicklung der Software SOLLTEN nur Werkzeuge mit nachgewiesenen Sicherheitseigenschaften verwendet werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A18 - Regelmäßige Sicherheitsaudits für die Entwicklungsumgebung",
      description:
        "Es SOLLTEN regelmäßige Sicherheitsaudits der Software-Entwicklungsumgebung und der Software-Testumgebung durchgeführt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "CON.8.A19 - Regelmäßige Integritätsprüfung der Entwicklungsumgebung",
      description:
        "Die Integrität der Entwicklungsumgebung SOLLTE regelmäßig mit kryptographischen Mechanismen entsprechend dem Stand der Technik geprüft werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
  ],

  app6: [
    {
      control: "APP.6.A1 - Planung des Software-Einsatzes",
      description:
        "Bevor eine Institution eine (neue) Software einführt, MUSS sie entscheiden, wofür die Software genutzt und welche Informationen damit verarbeitet werden sollen, wie die Benutzenden bei der Anforderungserhebung beteiligt und bei der Einführung unterstützt werden sollen, wie die Software an weitere Anwendungen und IT-Systeme über welche Schnittstellen angebunden wird, auf welchen IT-Systemen die Software ausgeführt werden soll und welche Ressourcen zur Ausführung der Software erforderlich sind, sowie ob sich die Institution in Abhängigkeit zu einem Hersteller oder einer Herstellerin begibt, wenn sie diese Software einsetzt. Hierbei MÜSSEN bereits Sicherheitsaspekte berücksichtigt werden. Zusätzlich MUSS die Institution die Zuständigkeiten für fachliche Betreuung, Freigabe und betriebliche Administration schon im Vorfeld klären und festlegen. Die Zuständigkeiten MÜSSEN dokumentiert und bei Bedarf aktualisiert werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A2 - Erstellung eines Anforderungskatalogs für Software",
      description:
        "Auf Basis der Ergebnisse der Planung MÜSSEN die Anforderungen an die Software in einem Anforderungskatalog erhoben werden. Der Anforderungskatalog MUSS dabei die grundlegenden funktionalen Anforderungen umfassen. Darüber hinaus MÜSSEN die nichtfunktionalen Anforderungen und hier insbesondere die Sicherheitsanforderungen in den Anforderungskatalog integriert werden. Hierbei MÜSSEN sowohl die Anforderungen von den Fachverantwortlichen als auch vom IT-Betrieb berücksichtigt werden. Insbesondere MÜSSEN auch die rechtlichen Anforderungen, die sich aus dem Kontext der zu verarbeitenden Daten ergeben, berücksichtigt werden. Der fertige Anforderungskatalog SOLLTE mit allen betroffenen Fachabteilungen abgestimmt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A3 - Sichere Beschaffung von Software",
      description:
        "Wenn Software beschafft wird, MUSS auf Basis des Anforderungskatalogs eine geeignete Software ausgewählt werden. Die ausgewählte Software MUSS aus vertrauenswürdigen Quellen beschafft werden. Die vertrauenswürdige Quelle SOLLTE eine Möglichkeit bereitstellen, die Software auf Integrität zu überprüfen. Darüber hinaus SOLLTE die Software mit einem geeigneten Wartungsvertrag oder einer vergleichbaren Zusage des herstellenden oder anbietenden Unternehmens beschafft werden. Diese Verträge oder Zusagen SOLLTEN insbesondere garantieren, dass auftretende Sicherheitslücken und Schwachstellen der Software während des gesamten Nutzungszeitraums zeitnah behoben werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "APP.6.A4 - Regelung für die Installation und Konfiguration von Software",
      description:
        "Die Installation und Konfiguration der Software MUSS durch den IT-Betrieb so geregelt werden, dass die Software nur mit dem geringsten notwendigen Funktionsumfang installiert und ausgeführt wird, die Software mit den geringsten möglichen Berechtigungen ausgeführt wird, die datensparsamsten Einstellungen (in Bezug auf die Verarbeitung von personenbezogenen Daten) konfiguriert werden sowie alle relevanten Sicherheitsupdates und -patches installiert sind, bevor die Software produktiv eingesetzt wird.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A5 - Sichere Installation von Software",
      description:
        "Software MUSS entsprechend der Regelung für die Installation auf den IT-Systemen installiert werden. Dabei MÜSSEN ausschließlich unveränderte Versionen der freigegebenen Software verwendet werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "APP.6.A6 - Berücksichtigung empfohlener Sicherheitsanforderungen",
      description:
        "Die Institution SOLLTE die nachfolgenden Sicherheitsanforderungen im Anforderungskatalog für die Software berücksichtigen: Die Software SOLLTE generelle Sicherheitsfunktionen wie Protokollierung und Authentifizierung umfassen, die im Anwendungskontext erforderlich sind.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A7 - Auswahl und Bewertung potentieller Software",
      description:
        "Anhand des Anforderungskatalogs SOLLTEN die am Markt erhältlichen Produkte gesichtet werden. Sie SOLLTEN mithilfe einer Bewertungsskala miteinander verglichen werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A8 - Regelung zur Verfügbarkeit der Installationsdateien",
      description:
        "Der IT-Betrieb SOLLTE die Verfügbarkeit der Installationsdateien sicherstellen, um die Installation reproduzieren zu können. Hierzu SOLLTE der IT-Betrieb die Installationsdateien geeignet sichern oder die Verfügbarkeit der Installationsdateien durch die Bezugsquelle (z. B. App-Store) sicherstellen.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A9 - Inventarisierung von Software",
      description:
        "Software SOLLTE inventarisiert werden. In einem Bestandsverzeichnis SOLLTE dokumentiert werden, auf welchen Systemen die Software unter welcher Lizenz eingesetzt wird.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control:
        "APP.6.A10 - Erstellung einer Sicherheitsrichtlinie für den Einsatz der Software",
      description:
        "Die Institution SOLLTE die Regelungen, die festlegen, wie die Software eingesetzt und betrieben wird, in einer Sicherheitsrichtlinie zusammenfassen.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A11 - Verwendung von Plug-ins und Erweiterungen",
      description:
        "Es SOLLTEN nur unbedingt notwendige Plug-ins und Erweiterungen installiert werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A12 - Geregelte Außerbetriebnahme von Software",
      description:
        "Wenn Software außer Betrieb genommen wird, SOLLTE der IT-Betrieb mit den Fachverantwortlichen regeln, wie dies im Detail durchzuführen ist.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A13 - Deinstallation von Software",
      description:
        "Wird Software deinstalliert, SOLLTEN alle angelegten und nicht mehr benötigten Dateien entfernt werden.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "APP.6.A14 - Nutzung zertifizierter Software",
      description:
        "Bei der Beschaffung von Software SOLLTE festgelegt werden, ob Zusicherungen des herstellenden oder anbietenden Unternehmens über implementierte Sicherheitsfunktionen als ausreichend vertrauenswürdig anerkannt werden können.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
  ],
};

export const isoComplianceControls = {
  technologicalControls: [
    {
      control: "User end point devices",
      description:
        "Information stored on, processed by or accessible via user end point devices shall be protected.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Privileged access rights",
      description:
        "The allocation and use of privileged access rights shall be restricted and managed.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Information access restriction",
      description:
        "Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Access to source code",
      description:
        "Read and write access to source code, development tools and software libraries shall be appropriately managed.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Secure authentication",
      description:
        "Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Capacity management",
      description:
        "The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Protection against malware",
      description:
        "Protection against malware shall be implemented and supported by appropriate user awareness.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Management of technical vulnerabilities",
      description:
        "Information about technical vulnerabilities of information systems in use shall be obtained, the organization’s exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Configuration management",
      description:
        "Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Information deletion",
      description:
        "Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Data masking",
      description:
        "Data masking shall be used in accordance with the organization’s topic-specific policy on access control and other related topic-specific policies, and business requirements, taking applicable legislation into consideration.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Data leakage prevention",
      description:
        "Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Information backup",
      description:
        "Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Redundancy of information processing facilities",
      description:
        "Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Logging",
      description:
        "Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Monitoring activities",
      description:
        "Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Clock synchronization",
      description:
        "The clocks of information processing systems used by the organization shall be synchronized to approved time sources.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Use of privileged utility programs",
      description:
        "The use of utility programs that can be capable of overriding system and application controls shall be restricted and tightly controlled.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Installation of software on operational systems",
      description:
        "Procedures and measures shall be implemented to securely manage software installation on operational systems.",
      currentEvidence: 0,
      maxEvidence: 0,
    },
    {
      control: "Networks security",
      description:
        "Networks and network devices shall be secured, managed and controlled to protect information in systems and applications.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Security of network services",
      description:
        "Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Segregation of networks",
      description:
        "Groups of information services, users and information systems shall be segregated in the organization’s networks.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Web filtering",
      description:
        "Access to external websites shall be managed to reduce exposure to malicious content.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Use of cryptography",
      description:
        "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Secure development life cycle",
      description:
        "Rules for the secure development of software and systems shall be established and applied.",
      maxEvidence: 4,
      currentEvidence: 0,
    },
    {
      control: "Application security requirements",
      description:
        "Information security requirements shall be identified, specified and approved when developing or acquiring applications.",
      maxEvidence: 1,
      currentEvidence: 1,
    },
    {
      control: "Secure system architecture and engineering principles",
      description:
        "Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Secure coding",
      description:
        "Secure coding principles shall be applied to software development.",
      maxEvidence: 2,
      currentEvidence: 0,
    },
    {
      control: "Security testing in development and acceptance",
      description:
        "Security testing processes shall be defined and implemented in the development life cycle.",
      maxEvidence: 10,
      currentEvidence: 0,
    },
    {
      control: "Outsourced development",
      description:
        "The organization shall direct, monitor and review the activities related to outsourced system development.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Separation of development, test and production environments",
      description:
        "Development, testing and production environments shall be separated and secured.",
      maxEvidence: 1,
      currentEvidence: 0,
    },
    {
      control: "Change management",
      description:
        "Changes to information processing facilities and information systems shall be subject to change management procedures.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Test information",
      description:
        "Test information shall be appropriately selected, protected and managed.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
    {
      control: "Protection of information systems during audit testing",
      description:
        "Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.",
      maxEvidence: 0,
      currentEvidence: 0,
    },
  ],
};
