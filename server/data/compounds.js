/*
 * Compound data. To add a new compound, append an object to this array.
 * Fields:
 *   id          URL slug (lowercase, no spaces)
 *   name        Display name
 *   brand       Brand name(s)
 *   class       Short drug-class label shown on the card
 *   target      Primary molecular target(s)
 *   tagline     One-line summary for the card
 *   facts       Key/value pairs shown in the "At a glance" panel
 *   sections    [{ title, body }] — body is an array of paragraphs or a { list: [] } object
 */
module.exports = [
  {
    id: "erdafitinib",
    name: "Erdafitinib",
    brand: "Balversa",
    class: "FGFR inhibitor",
    target: "FGFR1–4",
    tagline: "An oral pan-FGFR kinase inhibitor for urothelial cancers driven by FGFR3 alterations.",
    facts: [
      ["Formula", "C25H30N6O2"],
      ["Molar mass", "446.5 g/mol"],
      ["Route", "Oral, once daily"],
      ["Developer", "Janssen (licensed from Astex)"],
      ["First FDA approval", "April 2019 (accelerated)"],
      ["Full approval", "January 2024"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Erdafitinib is a small-molecule tyrosine kinase inhibitor that blocks all four fibroblast growth factor receptors (FGFR1, FGFR2, FGFR3 and FGFR4). It was the first FGFR-targeted therapy approved by the U.S. FDA.",
          "It is used in adults with locally advanced or metastatic urothelial carcinoma (most commonly bladder cancer) whose tumours carry a susceptible FGFR3 genetic alteration, identified with an approved companion diagnostic test, and whose disease has progressed after at least one prior line of systemic therapy."
        ]
      },
      {
        title: "How it works",
        body: [
          "FGFRs are receptor tyrosine kinases. When a fibroblast growth factor binds, the receptor dimerises and phosphorylates itself, switching on downstream growth pathways such as RAS–MAPK and PI3K–AKT.",
          "In a subset of urothelial cancers, FGFR3 is mutated or fused to another gene, so the receptor is stuck in the 'on' position. Erdafitinib occupies the ATP-binding pocket of the kinase domain, preventing that phosphorylation and cutting off the growth signal the tumour depends on."
        ]
      },
      {
        title: "The phosphate connection",
        body: [
          "FGFR signalling (through FGF23) helps the kidneys excrete phosphate. Blocking FGFR therefore raises serum phosphate — so reliably that it is used as a pharmacodynamic marker.",
          "Treatment starts at 8 mg daily, and the dose is increased to 9 mg if phosphate levels after about two weeks suggest the drug isn't yet reaching full target engagement and the patient is tolerating it. This phosphate-guided up-titration is unusual among cancer drugs."
        ]
      },
      {
        title: "Key evidence",
        body: [
          { list: [
            "BLC2001 (phase 2): the single-arm study behind the 2019 accelerated approval, in patients with FGFR-altered urothelial carcinoma after chemotherapy.",
            "THOR (phase 3): compared erdafitinib against investigator-choice chemotherapy after prior immunotherapy and showed improved overall survival — the basis for full approval in 2024."
          ]}
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Hyperphosphatemia — monitored closely, may require diet changes or phosphate binders.",
            "Eye disorders, including central serous retinopathy / retinal pigment epithelial detachment — regular ophthalmologic exams are recommended.",
            "Stomatitis, dry mouth, dry eyes, nail and skin changes, hair loss, diarrhoea and fatigue.",
            "Drug interactions: metabolised mainly by CYP2C9 and CYP3A4, so strong inhibitors or inducers of these enzymes can shift exposure.",
            "Embryo-fetal toxicity — effective contraception is advised."
          ]}
        ]
      }
    ]
  },
  {
    id: "pemigatinib",
    name: "Pemigatinib",
    brand: "Pemazyre",
    class: "FGFR inhibitor",
    target: "FGFR1–3",
    tagline: "A selective FGFR1–3 inhibitor for bile-duct cancers with FGFR2 fusions.",
    facts: [
      ["Formula", "C24H27F2N5O4"],
      ["Molar mass", "487.5 g/mol"],
      ["Route", "Oral, 14 days on / 7 off"],
      ["Developer", "Incyte"],
      ["First FDA approval", "April 2020"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Pemigatinib is a reversible, ATP-competitive inhibitor of FGFR1, FGFR2 and FGFR3. It was the first targeted therapy approved for cholangiocarcinoma.",
          "It is indicated for previously treated, unresectable locally advanced or metastatic cholangiocarcinoma with an FGFR2 fusion or rearrangement, and later also for relapsed or refractory myeloid/lymphoid neoplasms with FGFR1 rearrangement."
        ]
      },
      {
        title: "How it works",
        body: [
          "Roughly 10–15% of intrahepatic cholangiocarcinomas carry an FGFR2 gene fusion that produces a constitutively active receptor. Pemigatinib blocks the kinase activity of that fusion protein, shutting down the proliferative signalling it drives."
        ]
      },
      {
        title: "Key evidence",
        body: [
          "Approval was based on FIGHT-202, a phase 2 study in which patients with FGFR2 fusions or rearrangements showed meaningful and durable objective responses."
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Hyperphosphatemia (an on-target FGFR class effect).",
            "Serous retinal detachment — eye exams before and during treatment.",
            "Alopecia, diarrhoea, nail toxicity, fatigue, dysgeusia and dry eye."
          ]}
        ]
      }
    ]
  },
  {
    id: "futibatinib",
    name: "Futibatinib",
    brand: "Lytgobi",
    class: "Covalent FGFR inhibitor",
    target: "FGFR1–4",
    tagline: "An irreversible pan-FGFR inhibitor that forms a covalent bond with its target.",
    facts: [
      ["Formula", "C22H22N8O2"],
      ["Molar mass", "418.5 g/mol"],
      ["Route", "Oral, once daily"],
      ["Developer", "Taiho Oncology"],
      ["First FDA approval", "September 2022"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Futibatinib is a pan-FGFR inhibitor approved for previously treated, unresectable intrahepatic cholangiocarcinoma harbouring FGFR2 gene fusions or other rearrangements."
        ]
      },
      {
        title: "How it works",
        body: [
          "Unlike reversible FGFR inhibitors, futibatinib covalently binds a cysteine residue in the P-loop of the FGFR kinase domain. Because the bond is permanent, it can stay effective against some resistance mutations that weaken the grip of ATP-competitive drugs — making it of interest after progression on other FGFR inhibitors."
        ]
      },
      {
        title: "Key evidence",
        body: [
          "Approval was based on FOENIX-CCA2, a phase 2 trial in FGFR2-rearranged intrahepatic cholangiocarcinoma that demonstrated durable responses."
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Hyperphosphatemia.",
            "Retinal pigment epithelial detachment and other ocular toxicities.",
            "Nail toxicity, stomatitis, dry skin, fatigue and diarrhoea."
          ]}
        ]
      }
    ]
  },
  {
    id: "avapritinib",
    name: "Avapritinib",
    brand: "Ayvakit",
    class: "KIT / PDGFRA inhibitor",
    target: "KIT D816V, PDGFRA D842V",
    tagline: "Built to hit the activation-loop mutations that older kinase inhibitors miss.",
    facts: [
      ["Formula", "C26H27FN10"],
      ["Molar mass", "498.6 g/mol"],
      ["Route", "Oral, once daily"],
      ["Developer", "Blueprint Medicines"],
      ["First FDA approval", "January 2020"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Avapritinib is a selective type I kinase inhibitor of mutant KIT and PDGFRA. It is approved for gastrointestinal stromal tumours (GIST) with a PDGFRA exon 18 mutation (including D842V), and for advanced and indolent systemic mastocytosis."
        ]
      },
      {
        title: "How it works",
        body: [
          "Mutations like PDGFRA D842V and KIT D816V lock the kinase in its active conformation. Imatinib and similar type II inhibitors only bind the inactive shape, so these tumours are resistant to them. Avapritinib binds the active conformation, inhibiting precisely the mutants that escape older drugs."
        ]
      },
      {
        title: "Key evidence",
        body: [
          { list: [
            "NAVIGATOR (phase 1): high response rates in PDGFRA D842V-mutant GIST, a population with essentially no effective prior options.",
            "EXPLORER and PATHFINDER: supported its use in advanced systemic mastocytosis; PIONEER supported indolent disease."
          ]}
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Intracranial haemorrhage — rare but serious.",
            "Cognitive effects such as memory impairment and confusion.",
            "Oedema, nausea, fatigue and anaemia."
          ]}
        ]
      }
    ]
  },
  {
    id: "selpercatinib",
    name: "Selpercatinib",
    brand: "Retevmo",
    class: "RET inhibitor",
    target: "RET",
    tagline: "A highly selective RET kinase inhibitor for RET-driven lung and thyroid cancers.",
    facts: [
      ["Formula", "C29H31N7O3"],
      ["Molar mass", "525.6 g/mol"],
      ["Route", "Oral, twice daily"],
      ["Developer", "Loxo Oncology / Eli Lilly"],
      ["First FDA approval", "May 2020"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Selpercatinib targets the RET receptor tyrosine kinase. It is used for RET fusion-positive non-small cell lung cancer, RET-mutant medullary thyroid cancer, RET fusion-positive thyroid cancer, and RET fusion-positive solid tumours more broadly."
        ]
      },
      {
        title: "How it works",
        body: [
          "Earlier multikinase inhibitors hit RET only incidentally, alongside VEGFR and others, which limited dosing because of toxicity. Selpercatinib was designed to be highly selective for RET, allowing deeper target inhibition with fewer off-target effects — and good penetration into the central nervous system."
        ]
      },
      {
        title: "Key evidence",
        body: [
          "LIBRETTO-001, a phase 1/2 basket trial, produced high and durable response rates across RET-altered tumours, including brain metastases. LIBRETTO-431 later confirmed benefit over chemotherapy-based treatment in first-line RET-fusion lung cancer."
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Liver enzyme elevations — monitored regularly.",
            "Hypertension and QT prolongation.",
            "Dry mouth, diarrhoea, oedema and hypersensitivity reactions."
          ]}
        ]
      }
    ]
  },
  {
    id: "larotrectinib",
    name: "Larotrectinib",
    brand: "Vitrakvi",
    class: "TRK inhibitor",
    target: "TRKA, TRKB, TRKC",
    tagline: "One of the first 'tumour-agnostic' drugs — chosen by gene fusion, not by organ.",
    facts: [
      ["Formula", "C21H22F2N6O2"],
      ["Molar mass", "428.4 g/mol"],
      ["Route", "Oral, twice daily (capsule or solution)"],
      ["Developer", "Loxo Oncology / Bayer"],
      ["First FDA approval", "November 2018"]
    ],
    sections: [
      {
        title: "What it is",
        body: [
          "Larotrectinib is a selective inhibitor of the tropomyosin receptor kinases TRKA, TRKB and TRKC. It is approved for adult and paediatric solid tumours with an NTRK gene fusion, regardless of where in the body the cancer started."
        ]
      },
      {
        title: "How it works",
        body: [
          "NTRK fusions are rare overall but very common in a few unusual cancers, such as infantile fibrosarcoma and secretory breast carcinoma. The fusion creates a TRK protein that signals continuously; larotrectinib blocks its kinase activity."
        ]
      },
      {
        title: "Key evidence",
        body: [
          "Approval came from pooled data across three trials (LOXO-TRK-14001, SCOUT and NAVIGATE) spanning many tumour types, with high response rates in both children and adults."
        ]
      },
      {
        title: "What to watch for",
        body: [
          { list: [
            "Dizziness, ataxia and other neurological effects (TRK receptors normally function in the nervous system).",
            "Liver enzyme elevations.",
            "Fatigue, nausea and weight gain."
          ]}
        ]
      }
    ]
  }
];
