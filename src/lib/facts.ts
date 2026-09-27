export type FactCategory = "Campus" | "Zahlen" | "Institutionen" | "Campusleben";

export type Fact = {
  category: FactCategory;
  question: string;
  answer: string;
};

const BY_CATEGORY: Record<FactCategory, Omit<Fact, "category">[]> = {
  Campus: [
    {
      question: "Was ist der Bildungscampus in Heilbronn?",
      answer:
        "Ein Ort des lebenslangen Lernens. Er bietet ein breites Spektrum an Bildungs- und Wissenschaftseinrichtungen mit Angeboten vom klassischen Hochschulstudium über duale Studiengänge und berufliche Weiterbildung bis hin zu Gründer- und Forschungsprogrammen. Im Fokus steht der Mensch und sein bestmöglicher Bildungsweg innerhalb des Ökosystems.",
    },
    {
      question: "Welche Stiftung steht hinter dem Bildungscampus in Heilbronn?",
      answer:
        "Die Dieter Schwarz Stiftung. Sie engagiert sich seit 1999 in Heilbronn und der Region mit dem klaren Fokus, Bildungsangebote für Menschen in verschiedenen Lebensphasen zu fördern. Ein beeindruckendes Ergebnis ist der Bildungscampus.",
    },
    {
      question: "In welchem Jahr fiel der Spatenstich für den ersten Bauabschnitt des Bildungscampus?",
      answer:
        "2010 erfolgte der Spatenstich auf dem heutigen Bildungscampus Ost — einem ehemaligen Industriegelände mitten in Heilbronn.",
    },
    {
      question: "Welchen Titel erhielt die „Käthchenstadt“ Heilbronn im Zuge der Entwicklungen rund um den Bildungscampus?",
      answer: "Den Titel Universitätsstadt — Anfang 2020 wurde er verliehen.",
    },
    {
      question: "Unter welcher Vision werden die Nachhaltigkeitsziele am Bildungscampus vereint?",
      answer: "#VisionSustainability2035. Unter dieser Vision stellen wir den Campus zukunftsfähig auf.",
    },
  ],
  Zahlen: [
    {
      question: "Wie viele Studierende beleben den Campus heute?",
      answer: "Etwa 8.000 Studierende aus verschiedenen Institutionen und Fachrichtungen.",
    },
    {
      question: "Wie viele Institutionen sind am Campus vertreten?",
      answer: "18 Einrichtungen aus Bildung und Wissenschaft, für alle Stationen des lebenslangen Lernens.",
    },
    {
      question: "Wie viele Klinkersteine stecken allein in den Fassaden der Gebäude 9, 14 und 17?",
      answer: "314.000 Klinkersteine. Sie sind Teil des charakteristischen Erscheinungsbildes des Bildungscampus.",
    },
  ],
  Institutionen: [
    {
      question: "Welche Universität hat einen Standort am Bildungscampus?",
      answer:
        "Die Technische Universität München (TUM) Heilbronn — fokussiert ist das Spektrum an Forschung und Lehre auf die zentralen Transformationsthemen des digitalen Zeitalters.",
    },
    {
      question: "Welche duale Hochschule ist am Campus vertreten?",
      answer:
        "Die Duale Hochschule Baden-Württemberg (DHBW) Heilbronn für Bachelor-Studiengänge sowie die Duale Hochschule Baden-Württemberg Center for Advanced Studies (DHBW CAS) mit dualen Masterstudiengängen.",
    },
    {
      question: "Wofür steht die aim am Bildungscampus?",
      answer:
        "Die aim – Akademie für Innovative Bildung und Management – entwickelt Weiterbildungsangebote für Kinder, Jugendliche und pädagogische Fachkräfte zur Stärkung der Bildungsgerechtigkeit.",
    },
    {
      question: "Womit beschäftigen sich die Campus Founders?",
      answer:
        "Sie sind die Startup-Schmiede am Campus. Sie befähigen Talente und Gründer zur Selbständigkeit und begleiten Startups.",
    },
    {
      question: "Welche Einrichtung legt den Schwerpunkt auf Programmierung am Campus?",
      answer:
        "Die 42 Heilbronn. Sie ist eine kostenlose, private Programmierschule und setzt auf projektbasiertes Peer Learning (keine Bücher, Klassen und Lehrende).",
    },
    {
      question: "Welche Hochschulen sind am Campus präsent?",
      answer:
        "Die Hochschule Heilbronn mit ihrem Schwerpunkt auf angewandte Wissenschaften in den Bereichen Technik, Wirtschaft und Informatik sowie die technisch-naturwissenschaftliche Hochschule ETH Zürich. Ihr Schwerpunkt liegt auf der digitalen Transformation.",
    },
    {
      question: "Welche Forschungsinstitutionen sind am Bildungscampus angesiedelt?",
      answer:
        "Das Max-Planck-Institut für medizinische Forschung mit dem Schwerpunkt künstliche Intelligenz in der Biomedizin. Das Ferdinand-Steinbeis-Institut forscht interdisziplinär an Transformation und Digitalisierung von Wirtschaft und Gesellschaft. Das Fraunhofer Heilbronn Forschungs- und Innovationszentrum HNFIZ bündelt Kompetenzen zu werteorientierter Wertschöpfung und kognitiven Systemen.",
    },
  ],
  Campusleben: [
    {
      question: "Wo liegt die Mensa und wer betreibt sie?",
      answer:
        "Auf dem Bildungscampus Mitte, unter zwei begrünten Hügeln. Betrieben wird sie vom Studierendenwerk Heidelberg.",
    },
    {
      question: "Welche gastronomischen Angebote gibt es auf dem Bildungscampus?",
      answer:
        "Die Mensa sowie das Café, betrieben vom Studierendenwerk Heidelberg. Der Campus Garden sowie Heaven’s Kitchen Heilbronn vervollständigen das Angebot.",
    },
    {
      question: "Wofür braucht man die CampusCard?",
      answer:
        "Sie ist Identifikationskarte, Zutrittsschlüssel und Bezahlmittel in einem. Mehr unter bildungscampus.hn/campuscard",
    },
    {
      question: "Was ist die shop.box am Campus?",
      answer:
        "Ein Shop inside the Box. Hier kannst du dich via App 24/7 und an 365 Tagen im Jahr mit kleinen Mahlzeiten, Getränken und Dingen des täglichen Bedarfs eindecken.",
    },
  ],
};

const ORDER: FactCategory[] = ["Campus", "Zahlen", "Institutionen", "Campusleben"];

/** Round-robin über Kategorien, damit sich Themen abwechseln. */
export function interleaveFacts(): Fact[] {
  const queues = ORDER.map((category) =>
    BY_CATEGORY[category].map((item) => ({ category, ...item })),
  );
  const out: Fact[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        out.push(next);
        progress = true;
      }
    }
  }
  return out;
}

export const FACTS = interleaveFacts();
