const scenarios = [
  // ==================================================
  // TEAM 1
  // ==================================================
  {
    team: 1,
    code: "4821",
    title: "Brand im Keller",
    description: "Im Keller eines Wohnhauses ist Rauchentwicklung festgestellt worden.",
    fileType: "image",
    file: "/images/Kellerbrand.jpg",
    tasks: [
      "Lagemeldung per Funk an Einsatzleitung",
      "Wasserversorgung sicherstellen",
      "Personensuche im Keller",
      "Löschangriff vorbereiten",
    ],
    solutionTasks: [
      "Richtige Lageeinschätzung vorgenommen",
      "Wasserversorgung vollständig aufgebaut",
      "Alle Personen im Keller gefunden",
      "Brandbekämpfung eingeleitet",
    ],
    subScenarios: [
      {
        code: "7364",
        title: "Person gefunden",
        description: "Eine verletzte Person wird im Keller aufgefunden.",
        tasks: ["Erste Hilfe leisten", "Rettung vorbereiten"],
        solutionTasks: ["Person korrekt versorgt", "Transport eingeleitet"],
      },
      {
        code: "9182",
        title: "Atemschutznotfall",
        description: "Ein Truppmitglied meldet Atemschutzprobleme.",
        tasks: ["Notfallmeldung absetzen", "Rettungstrupp einsetzen"],
        solutionTasks: ["Notfall korrekt gemeldet", "Trupp sicher gerettet"],
      },
      {
        code: "2457",
        title: "Brand breitet sich aus",
        description: "Die Flammen schlagen auf das Erdgeschoss über.",
        tasks: ["Zweite Leitung vornehmen", "Brandabschnitt sichern"],
        solutionTasks: ["Brand erfolgreich eingedämmt"],
      },
      {
        code: "6019",
        title: "Gasflaschen im Keller",
        description: "Beim Suchen entdeckt ihr mehrere Gasflaschen.",
        tasks: ["Gasflaschen sichern", "Gefahrenbereich absperren"],
        solutionTasks: ["Gasflaschen in Sicherheit gebracht"],
      },
      {
        code: "8573",
        title: "Einsatz beendet",
        description: "Der Einsatzleiter erklärt die Übung für beendet.",
        tasks: ["Material zurückbauen", "Meldung an Einsatzleitung"],
        solutionTasks: ["Rückbau vollständig durchgeführt"],
      },
    ],
  },

  // ==================================================
  // TEAM 2
  // ==================================================
  {
    team: 2,
    code: "3948",
    title: "Gefahrstoffaustritt",
    description: "In einem Labor kam es zu einem Chemieunfall.",
    fileType: "pdf",
    file: "/pdfs/chemieunfall.pdf",
    tasks: [
      "Absperrung des Bereichs",
      "Sicherheitsabstand einhalten",
      "Meldung an Einsatzleitung",
      "Dekontamination vorbereiten",
    ],
    solutionTasks: [
      "Absperrung im Radius von 50m korrekt eingerichtet",
      "Keine Einsatzkräfte im Gefahrenbereich",
      "Einsatzleitung sofort informiert",
      "Dekonplatz vorbereitet",
    ],
    subScenarios: [
      { code: "1206", title: "Leck erkannt", description: "Das Leck ist sichtbar.", tasks: ["Gefahrenbereich sichern"], solutionTasks: ["Absperrung erfolgreich"] },
      { code: "5732", title: "Verletzte Person", description: "Eine Person liegt im Labor.", tasks: ["Person bergen"], solutionTasks: ["Person erfolgreich gerettet"] },
      { code: "8491", title: "Reaktion verstärkt sich", description: "Chemische Reaktion eskaliert.", tasks: ["Einsatzleiter informieren"], solutionTasks: ["Einsatzleiter informiert"] },
      { code: "2675", title: "Dekonplatz überlastet", description: "Zu viele Verletzte gleichzeitig.", tasks: ["Zusatzkräfte anfordern"], solutionTasks: ["Zusatzkräfte eingetroffen"] },
      { code: "9350", title: "Übung Ende", description: "Gefahrstoff erfolgreich eingedämmt.", tasks: ["Abschlussmeldung"], solutionTasks: ["Einsatzende bestätigt"] },
    ],
  },

  // ==================================================
  // TEAM 3
  // ==================================================
  {
    team: 3,
    code: "7412",
    title: "Wohnungsbrand",
    description: "In einer Wohnung im 2. OG ist ein Feuer ausgebrochen.",
    fileType: "image",
    file: "/images/wohnungsbrand.jpg",
    tasks: [
      "Lagemeldung per Funk",
      "Menschenrettung einleiten",
      "Angriffstrupp unter PA vorgehen lassen",
    ],
    solutionTasks: [
      "Personen rechtzeitig gefunden",
      "Brandherd lokalisiert",
      "Wasserversorgung aufgebaut",
    ],
    subScenarios: [
      { code: "3068", title: "Kind vermisst", description: "Ein Kind wird vermisst.", tasks: ["Suchtrupp losschicken"], solutionTasks: ["Kind gefunden"] },
      { code: "5591", title: "Verrauchtes Treppenhaus", description: "Treppenhaus komplett verraucht.", tasks: ["Belüftung einrichten"], solutionTasks: ["Treppenhaus rauchfrei"] },
      { code: "8240", title: "Dachstuhl brennt", description: "Feuer greift auf Dach über.", tasks: ["DLK einsetzen"], solutionTasks: ["Dachstuhlbrand gelöscht"] },
      { code: "1927", title: "Gasleitung beschädigt", description: "Gasleitung im Keller undicht.", tasks: ["Bereich absperren"], solutionTasks: ["Gas abgesperrt"] },
      { code: "6883", title: "Übung Ende", description: "Einsatz beendet.", tasks: ["Geräte zurückbauen"], solutionTasks: ["Abschlussmeldung an EL"] },
    ],
  },

  // ==================================================
  // TEAM 4
  // ==================================================
  {
    team: 4,
    code: "8539",
    title: "Verkehrsunfall",
    description: "Zwei PKW kollidieren frontal, mehrere Verletzte.",
    fileType: "image",
    file: "/images/verkehrsunfall.jpg",
    tasks: ["Einsatzstelle absichern", "Erste Hilfe leisten", "Rettungsgeräte vorbereiten"],
    solutionTasks: ["Absicherung korrekt", "Patienten versorgt", "Geräte in Stellung"],
    subScenarios: [
      { code: "4172", title: "Fahrzeug brennt", description: "Ein PKW beginnt zu brennen.", tasks: ["Löschangriff vorbereiten"], solutionTasks: ["Brand gelöscht"] },
      { code: "6905", title: "Person eingeklemmt", description: "Eine Person im Fahrzeug eingeklemmt.", tasks: ["Hydraulisches Gerät einsetzen"], solutionTasks: ["Person befreit"] },
      { code: "2048", title: "Kraftstoff läuft aus", description: "Treibstoff tritt aus.", tasks: ["Umwelt sichern"], solutionTasks: ["Leck gestoppt"] },
      { code: "9751", title: "Unfallgegner flüchtig", description: "Ein Beteiligter verlässt die Szene.", tasks: ["Polizei informieren"], solutionTasks: ["Polizei verständigt"] },
      { code: "3620", title: "Übung Ende", description: "Einsatz beendet.", tasks: ["Abschlussmeldung"], solutionTasks: ["Übungsende bestätigt"] },
    ],
  },

  // ==================================================
  // TEAM 5
  // ==================================================
  {
    team: 5,
    code: "2684",
    title: "Flächenbrand",
    description: "Ein Feld steht in Flammen, Ausbreitung droht.",
    fileType: "image",
    file: "/images/flaechenbrand.jpg",
    tasks: ["Lagemeldung absetzen", "Wasserversorgung sicherstellen", "Löschangriff einleiten"],
    solutionTasks: ["Feuer eingegrenzt", "Nachlöscharbeiten begonnen"],
    subScenarios: [
      { code: "5319", title: "Wind dreht", description: "Flammen breiten sich in neue Richtung aus.", tasks: ["Abschnittsleiter informieren"], solutionTasks: ["Einsatz angepasst"] },
      { code: "8075", title: "Bauernhof gefährdet", description: "Flammen nähern sich Gebäuden.", tasks: ["Gebäudeschutz aufbauen"], solutionTasks: ["Gebäude gesichert"] },
      { code: "4196", title: "Erschöpfte Kräfte", description: "Trupps melden Erschöpfung.", tasks: ["Ablösung organisieren"], solutionTasks: ["Neue Kräfte eingetroffen"] },
      { code: "6428", title: "Wasser knapp", description: "Hydranten liefern zu wenig Wasser.", tasks: ["Tanklöschfahrzeuge nachfordern"], solutionTasks: ["Versorgung gesichert"] },
      { code: "9502", title: "Übung Ende", description: "Einsatzleiter beendet Übung.", tasks: ["Geräte reinigen"], solutionTasks: ["Rückbau abgeschlossen"] },
    ],
  },

  // ==================================================
  // TEAM 6
  // ==================================================
  {
    team: 6,
    code: "7103",
    title: "Industrieunfall",
    description: "In einer Werkhalle kommt es zu einer Explosion.",
    fileType: "image",
    file: "/images/industrieunfall.jpg",
    tasks: ["Lagemeldung absetzen", "Gefahrenbereich absperren", "Verletzte versorgen"],
    solutionTasks: ["Gefahrenbereich gesichert", "Rettung eingeleitet"],
    subScenarios: [
      { code: "2859", title: "Sekundärexplosion", description: "Zweite Explosion folgt.", tasks: ["Trupps zurückziehen"], solutionTasks: ["Alle in Sicherheit"] },
      { code: "9367", title: "Chemikalien laufen aus", description: "Flüssigkeiten treten aus.", tasks: ["Dekon vorbereiten"], solutionTasks: ["Dekonplatz eingerichtet"] },
      { code: "5084", title: "Stromschlag-Gefahr", description: "Leitungen beschädigt.", tasks: ["Strom abstellen"], solutionTasks: ["Anlage spannungsfrei"] },
      { code: "1742", title: "Gebäudeinsturz droht", description: "Tragende Teile beschädigt.", tasks: ["Gebäude evakuieren"], solutionTasks: ["Alle evakuiert"] },
      { code: "8630", title: "Übung Ende", description: "Einsatzleiter beendet Übung.", tasks: ["Abschlussbericht erstellen"], solutionTasks: ["Übung offiziell beendet"] },
    ],
  },
];

export default scenarios;
