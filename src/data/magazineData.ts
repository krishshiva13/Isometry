import { MagazineIssue } from '../types';

export const MAGAZINE_ISSUES: MagazineIssue[] = [
  {
    id: 'mag-2026-09-w1',
    month: 'September 2026',
    monthKey: '2026-09',
    weekNumber: 1,
    issueNumber: 36,
    releaseDate: 'September 1, 2026',
    title: 'The Silicon Renaissance: India’s Next Frontier in Deep Tech & Space',
    tagline: 'From indigenous semiconductors to lunar soil mining — how 2026 is reshaping world science.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    category: 'Space & Inventions',
    badge: 'Latest Weekly Release',
    featuredStory: {
      title: 'Beyond the Microchip: The Unseen Race for 2-Nanometer Sovereignty',
      excerpt: 'As India signs historic trilateral semiconductor accords and tests Pushpak RLV-TD, we examine the physics, geopolitics, and historic milestones that brought us here.',
      fullContent: `
### The 2-Nanometer Revolution & The Race for Silicon Independence

In the summer of 2026, the world witnessed an unprecedented geopolitical and scientific milestone. With the signing of the landmark trilateral semiconductor accord between India, Japan, and the Netherlands, the global supply chain for cutting-edge microchips underwent its most dramatic shift since the Silicon Valley boom of the 1970s.

#### 1. Why Nanometers Matter: The Extreme Ultraviolet (EUV) Miracle
To understand the significance of modern semiconductor fabrication, one must delve into the physics of Extreme Ultraviolet (EUV) lithography. Pioneered by Dutch optics giant ASML, EUV machines use lasers that zap molten tin droplets 50,000 times per second to create plasma emitting 13.5-nanometer light. 

This light is guided by the flattest mirrors ever constructed by human hands—mirrors so smooth that if they were the size of Germany, the largest bump would be less than a tenth of a millimeter tall.

\`\`\`
[Laser Beam] ──> [Molten Tin Droplet] ──> [13.5nm Plasma Light] ──> [Atomic Resolution Mirrors] ──> [Silicon Wafer]
\`\`\`

#### 2. The Indian Fab Ecosystem: Dholera & Tamil Nadu
With the establishment of commercial fabrication units in Dholera (Gujarat) and advanced packaging centers in Tamil Nadu and Telangana, India is transitioning from a software-design powerhouse into a full-stack hardware sovereign state.

For aspirants preparing for **UPSC GS-3 (Science & Tech)** and **SSC/TNPSC GK**, key aspects include:
- **The PLI Scheme (Production Linked Incentive)**: Financial incentives up to 50% for commercial foundries.
- **Critical Minerals Security**: Sourcing gallium, germanium, and lithium from newly mapped reserves in Jammu & Kashmir and Chhattisgarh.
- **Clean Room Standards**: Class 1 cleanrooms requiring fewer than 10 particles per cubic meter of air.

#### 3. Pushpak RLV-TD: Reusable Spacecraft Milestones
Concurrently, ISRO's successful third consecutive autonomous landing trial of the **Pushpak (RLV-TD)** at the Chitradurga Aeronautical Test Range marks India's entry into the elite club of nations capable of orbital booster recovery. 

By recovering and reusing the first and second stages, payload launch costs are projected to drop from $5,000/kg to under $1,200/kg by 2028.
      `,
      author: 'Dr. Aravind Ramanathan (Senior Tech & Aerospace Editor)',
      readTime: '8 min read',
      tags: ['Semiconductors', 'ISRO Pushpak', 'EUV Lithography', 'UPSC GS-3']
    },
    curatedFacts: [
      {
        category: 'Inventions',
        emoji: '💡',
        title: 'The Accidental Microwave',
        summary: 'In 1945, Percy Spencer noticed a magnetron melted a chocolate bar in his pocket, launching microwave ovens.'
      },
      {
        category: 'History',
        emoji: '📜',
        title: 'The Fazl Ali Commission of 1953',
        summary: 'Led directly to the States Reorganisation Act of 1956, redefining state borders across India on linguistic lines.'
      },
      {
        category: 'Science',
        emoji: '🧬',
        title: 'Penicillin’s 17-Year Purification Gap',
        summary: 'Alexander Fleming discovered penicillin in 1928, but Howard Florey and Ernst Chain did not purify it for clinical use until 1941.'
      },
      {
        category: 'Space',
        emoji: '🪐',
        title: 'Voyager 1’s Interstellar Memory Fix',
        summary: 'NASA engineers in 2024 fixed a corrupted memory chip located 24 billion kilometers away using vintage assembly code written in 1977.'
      }
    ],
    examCapsule: [
      {
        topic: 'Semiconductor Mission & PLI',
        keyTakeaway: 'Nodal body: India Semiconductor Mission (ISM) under MeitY. Target: 28nm to 7nm nodes.',
        examTarget: 'UPSC GS-3 / SSC CGL'
      },
      {
        topic: 'Pushpak RLV-TD Specifications',
        keyTakeaway: 'Winged body design tested at Chitradurga ATR Karnataka. Autonomous landing gear guidance via NavIC.',
        examTarget: 'Railway RRB / TNPSC'
      },
      {
        topic: 'Repo Rate Revision',
        keyTakeaway: 'RBI MPC increased Repo Rate to 6.75% in response to August headline CPI inflation at 7.2%.',
        examTarget: 'Banking IBPS / SBI PO'
      }
    ],
    brainTeaser: {
      question: 'Which element is primarily used as the target in EUV lithography machines to generate 13.5 nm laser-produced plasma?',
      options: ['Tungsten', 'Molten Tin (Sn)', 'Gallium Arsenide', 'Enriched Silicon'],
      answer: 1,
      explanation: 'ASML EUV machines strike droplets of molten Tin (Sn) with a high-power CO2 laser twice to vaporize it into a high-temperature plasma emitting 13.5 nm EUV light.'
    },
    pdfPages: 16,
    pdfSize: '3.4 MB'
  },
  {
    id: 'mag-2026-09-w2',
    month: 'September 2026',
    monthKey: '2026-09',
    weekNumber: 2,
    issueNumber: 37,
    releaseDate: 'September 8, 2026',
    title: 'The Great Silk Road: How Ancient Trade Routes Shaped Modern Geopolitics',
    tagline: 'Caravans, silk diplomacy, the Black Death, and the roots of contemporary Eurasian transit corridors.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
    category: 'World & Indian History',
    badge: 'Weekly Edition',
    featuredStory: {
      title: 'The Arteries of Empire: 6,000 Kilometers of Desert, Silk, and Spices',
      excerpt: 'How the Han Dynasty, Kushan Empire, and Roman trade networks fostered global trade 2,000 years before modern globalization.',
      fullContent: `
### The Arteries of Empire: 6,000 Kilometers That Wired the Ancient World

For over a millennium and a half, the phrase "Silk Road" represented not a single paved highway, but a vast, interconnected network of mountain passes, desert trails, and riverways stretching from Chang'an (modern-day Xi'an, China) all the way to Rome and Alexandria.

#### 1. The Kushan Bridge: India's Golden Age of Trade
Under emperors like Kanishka (1st-2nd Century CE), the Kushan Empire controlled key chokepoints along the northern silk routes and the sea routes connecting Bharuch (Barygaza) with the Red Sea ports of Roman Egypt. 

Coins minted by Kanishka bearing Greek, Persian, and Indian deities reveal how economic trade catalyzed cultural syncretism, fostering Gandhara art and spreading Mahayana Buddhism to East Asia.

#### 2. Trade Commodities Beyond Silk
While Chinese silk was prized in Rome (famously criticized by Pliny the Elder for draining Roman gold reserves), the reverse flow brought:
- Roman glassware, gold solidi, and olive oil to Asia.
- Indian black pepper (known as *Yavanapriya* in Sanskrit), fine muslin, and medicinal herbs.
- Central Asian warhorses (the famed "Heavenly Horses" of Fergana).

#### 3. Exam Focus: Ancient & Medieval Trade Networks
For **UPSC History Optional, GS-1, and State PSCs**:
- Understand the role of monsoon navigation discovered by Eudoxus and Hippalus.
- Periplus of the Erythraean Sea: The premier maritime guidebook from the 1st Century CE detailing Indian ports like Muziris and Korkai.
      `,
      author: 'Prof. Meenakshi Sundaram (Dept of Ancient Indian History)',
      readTime: '7 min read',
      tags: ['Silk Road', 'Kushan Empire', 'Muziris', 'UPSC GS-1']
    },
    curatedFacts: [
      {
        category: 'History',
        emoji: '🏛️',
        title: 'Roman Concrete Self-Healing Secret',
        summary: 'Ancient Roman concrete included quicklime clasts that react with seawater to precipitate calcite, self-healing cracks over millennia.'
      },
      {
        category: 'Discoveries',
        emoji: '🔭',
        title: 'The Periplus of the Erythraean Sea',
        summary: 'A 1st-century Greek handbook that accurately listed dozens of ancient Indian sea ports from Gujarat down to the Coromandel coast.'
      },
      {
        category: 'Science',
        emoji: '🧪',
        title: 'The Black Death Transit',
        summary: 'Yersinia pestis spread across Eurasia along the Mongol-protected trade routes in 1346–1353, killing nearly half of Europe’s population.'
      },
      {
        category: 'Inventions',
        emoji: '🧭',
        title: 'The Lodestone Compass',
        summary: 'First invented in China during the Han Dynasty for divination, the magnetic compass was adapted for maritime navigation in the Song Dynasty.'
      }
    ],
    examCapsule: [
      {
        topic: 'Periplus of the Erythraean Sea & Muziris',
        keyTakeaway: 'Key ancient port located near Kodungallur, Kerala. Trade of black pepper and beryl with the Roman Empire.',
        examTarget: 'UPSC GS-1 / TNPSC Group 1'
      },
      {
        topic: 'Kushan Dynasty & Gandhara Art',
        keyTakeaway: 'Greco-Buddhist style, grey sandstone/stucco, anthropomorphic Buddha figures, patronage under Kanishka I.',
        examTarget: 'SSC CGL / State PSC'
      }
    ],
    brainTeaser: {
      question: 'Which Sanskrit term was historically used in ancient Indian literature to describe black pepper, signifying its immense popularity among Roman traders?',
      options: ['Yavanapriya', 'Suvarnadvipa', 'Rajatarangini', 'Karpasa'],
      answer: 0,
      explanation: 'Black pepper was called "Yavanapriya" (beloved of the Yavanas/Greeks and Romans) because of the astronomical demand for Malabar pepper across the Roman Empire.'
    },
    pdfPages: 14,
    pdfSize: '3.1 MB'
  },
  {
    id: 'mag-2026-09-w3',
    month: 'September 2026',
    monthKey: '2026-09',
    weekNumber: 3,
    issueNumber: 38,
    releaseDate: 'September 15, 2026',
    title: 'The Quantum Leap: Supercomputing, Qubits, and India’s National Quantum Mission',
    tagline: 'Superconducting circuits, quantum teleportation, and securing financial encryption against future quantum attacks.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
    category: 'Science & Computing',
    badge: 'Weekly Edition',
    featuredStory: {
      title: 'Beyond Binary: How Quantum Superposition Will Upend Cryptography',
      excerpt: 'From Shor’s algorithm to Post-Quantum Cryptography (PQC), understanding the fundamental mechanics powering next-generation computational physics.',
      fullContent: `
### Beyond Binary: The Quantum Computing Revolution Explained

Traditional computers process data in discrete binary bits: states of 0 or 1. Quantum computers, however, exploit two bizarre properties of subatomic physics—**superposition** and **entanglement**—to perform calculations at speeds unimaginable with conventional silicon processors.

#### 1. The Core Physics: Qubits & Superposition
A quantum bit (qubit) can exist in a linear combination of states |0⟩ and |1⟩ simultaneously:

\`\`\`
|ψ⟩ = α|0⟩ + β|1⟩   where |α|² + |β|² = 1
\`\`\`

With just 50 entangled qubits, a quantum computer can represent 2⁵⁰ (over one quadrillion) states simultaneously, allowing algorithms like Grover's (database search) and Shor's (prime factorization) to execute in polynomial time.

#### 2. India's National Quantum Mission (NQM)
Approved with an outlay of over ₹6,000 Crore, the National Quantum Mission focuses on four major verticals:
1. **Quantum Computing**: Developing 50 to 1000 physical qubit quantum processors based on superconducting and photonic platforms.
2. **Quantum Communication**: Secure quantum key distribution (QKD) over satellite and fiber networks across 2,000 km.
3. **Quantum Sensing & Metrology**: Ultra-sensitive atomic clocks and magnetometers for geological mapping.
4. **Quantum Materials**: Novel topological insulators for dissipationless electronics.
      `,
      author: 'Dr. Shalini Venkat (Quantum Physics Research Fellow)',
      readTime: '9 min read',
      tags: ['Quantum Computing', 'NQM India', 'Superposition', 'UPSC GS-3']
    },
    curatedFacts: [
      {
        category: 'Science',
        emoji: '⚛️',
        title: 'Absolute Zero Cooling',
        summary: 'Superconducting quantum computers operate at 15 millikelvin (-273.135°C), colder than outer space.'
      },
      {
        category: 'Inventions',
        emoji: '💾',
        title: 'The First Transistor in 1947',
        summary: 'John Bardeen, Walter Brattain, and William Shockley created the point-contact transistor at Bell Labs.'
      },
      {
        category: 'Discoveries',
        emoji: '🌌',
        title: 'Quantum Entanglement Nobel 2022',
        summary: 'Alain Aspect, John Clauser, and Anton Zeilinger proved Einstein wrong about "spooky action at a distance".'
      },
      {
        category: 'History',
        emoji: '📜',
        title: 'C.V. Raman’s Discovery in 1928',
        summary: 'The Raman Effect—inelastic scattering of photons by molecules—won the Nobel Prize in Physics in 1930.'
      }
    ],
    examCapsule: [
      {
        topic: 'National Quantum Mission (NQM)',
        keyTakeaway: 'Implementing agency: DST. Target duration: 2023–2031. Four thematic hubs (T-Hubs).',
        examTarget: 'UPSC GS-3 / SSC CGL Tier 2'
      },
      {
        topic: 'Raman Effect & National Science Day',
        keyTakeaway: 'February 28 celebrated as National Science Day in India commemorating the discovery in 1928.',
        examTarget: 'Railway / Banking / TNPSC'
      }
    ],
    brainTeaser: {
      question: 'National Science Day in India is celebrated on February 28 every year to mark which historic discovery?',
      options: ['Discovery of the Raman Effect (1928)', 'First Indian Satellite Aryabhata Launch (1975)', 'Bose-Einstein Condensate formulation', 'Pokhran-I Nuclear Test (1974)'],
      answer: 0,
      explanation: 'National Science Day is celebrated annually on February 28 to honor Sir C.V. Raman’s discovery of the Raman Effect on February 28, 1928.'
    },
    pdfPages: 15,
    pdfSize: '3.3 MB'
  },
  {
    id: 'mag-2026-09-w4',
    month: 'September 2026',
    monthKey: '2026-09',
    weekNumber: 4,
    issueNumber: 39,
    releaseDate: 'September 22, 2026',
    title: 'The Great Geological Clock: India’s Journey from Gondwana to the Himalayas',
    tagline: 'Plate tectonics, the Deccan Traps volcanism, dinosaur extinctions, and the rise of the highest peaks on Earth.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    category: 'Geography & Geology',
    badge: 'Weekly Edition',
    featuredStory: {
      title: 'When Continents Collide: The 100-Million-Year Voyage of the Indian Plate',
      excerpt: 'How a rogue fragment of Gondwanaland drifted across the Tethys Ocean at record speed to ram into Eurasia, birthing the monsoons and the Himalayas.',
      fullContent: `
### When Continents Collide: The 100-Million-Year Epic of the Indian Tectonic Plate

Approximately 140 million years ago during the Early Cretaceous, the supercontinent of Gondwana fractured into South America, Africa, Antarctica, Australia, and the Indian subcontinent.

What followed is widely regarded by geophysicists as the fastest continental sprint in planetary history.

#### 1. The Superfast Drift Across the Tethys Ocean
While most tectonic plates move at a modest pace of 2 to 4 centimeters per year (roughly the speed at which human fingernails grow), the Indian Plate accelerated across the ancient Tethys Sea at an astonishing **18 to 20 centimeters per year**.

Scientists hypothesize this acceleration was driven by:
- Plume-push forces from the Réunion mantle hotspot.
- Double-subduction zones pulling the oceanic crust downwards on both sides.

#### 2. The Deccan Traps & The K-Pg Extinction
As the Indian plate passed over the Réunion hotspot around 66 million years ago, immense fissure eruptions poured out over 1 million cubic kilometers of basaltic lava across modern-day Maharashtra, Madhya Pradesh, and Gujarat, forming the tiered **Deccan Traps**. 

This volcanic outgassing released trillions of tons of sulfur and carbon dioxide, coinciding with the Chicxulub asteroid impact that brought an end to the non-avian dinosaurs.

#### 3. The Himalayan Uplift & The South Asian Monsoon
Around 50 million years ago, the Indian Plate rammed into the Eurasian Plate. Because both landmasses consisted of buoyant continental crust, neither could subduct easily. Instead, the sea floor of the Tethys was buckled upward, creating the Himalayas and Tibetan Plateau.

This immense physical barrier:
- Blocks cold Siberian air from penetrating the Indian plains during winter.
- Forces moisture-laden Indian Ocean winds to ascend, creating the South Asian monsoon rainfall system.
      `,
      author: 'Dr. Harshavardhan Joshi (Geographical Survey & Earth Sciences)',
      readTime: '8 min read',
      tags: ['Plate Tectonics', 'Deccan Traps', 'Himalayas', 'UPSC Geography']
    },
    curatedFacts: [
      {
        category: 'Discoveries',
        emoji: '🦕',
        title: 'Rajasaurus Narmadensis',
        summary: 'A predatory abelisaurid dinosaur discovered in 2003 along the Narmada River in Gujarat, dating to 67 million years ago.'
      },
      {
        category: 'Science',
        emoji: '🌋',
        title: 'Barren Island Volcano',
        summary: 'India’s only active volcano located in the Andaman Sea, with eruptions recorded in 1787 and as recently as 2017.'
      },
      {
        category: 'History',
        emoji: '⛰️',
        title: 'Radhanath Sikdar’s Calculation',
        summary: 'In 1852, Indian mathematician Radhanath Sikdar calculated Peak XV (Mount Everest) was the highest mountain in the world.'
      },
      {
        category: 'Inventions',
        emoji: '🧭',
        title: 'Seismograph Origins in 132 CE',
        summary: 'Zhang Heng invented the first earthquake detector in China using pendulums that released bronze balls into dragon mouths.'
      }
    ],
    examCapsule: [
      {
        topic: 'Himalayan Tectonics & Main Boundary Thrust (MBT)',
        keyTakeaway: 'Three longitudinal zones: Greater Himalayas (Himadri), Lesser Himalayas (Himachal), Outer Himalayas (Shiwaliks).',
        examTarget: 'UPSC GS-1 / TNPSC Geography'
      },
      {
        topic: 'Deccan Traps Soil Type',
        keyTakeaway: 'Weathering of basaltic lava produces Regur (Black Cotton Soil), rich in calcium, magnesium, and potash.',
        examTarget: 'SSC CGL / Railway RRB'
      }
    ],
    brainTeaser: {
      question: 'Which Indian mathematician and Great Trigonometrical Survey computer is credited with calculating Mount Everest as the highest mountain in the world in 1852?',
      options: ['Srinivasa Ramanujan', 'Radhanath Sikdar', 'Meghnad Saha', 'Prasanta Chandra Mahalanobis'],
      answer: 1,
      explanation: 'Radhanath Sikdar, a brilliant mathematician from Bengal, was the Chief Computer of the Great Trigonometrical Survey who calculated the trigonometric height of Peak XV (Mount Everest).'
    },
    pdfPages: 16,
    pdfSize: '3.5 MB'
  },
  {
    id: 'mag-2026-08-w1',
    month: 'August 2026',
    monthKey: '2026-08',
    weekNumber: 1,
    issueNumber: 32,
    releaseDate: 'August 4, 2026',
    title: 'The Chronicles of Independence: 1857 to 1947 in Revolutionary Documents',
    tagline: 'Secret telegrams, underground presses, and the constitutional architecture of independent India.',
    coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=1200',
    category: 'Indian Freedom Movement',
    badge: 'Special Freedom Edition',
    featuredStory: {
      title: 'From Sepoy Mutiny to Constituent Assembly: The 90-Year Struggle',
      excerpt: 'A comprehensive visual and archival walk through the milestones, organizations, and legal declarations that paved the way to August 15, 1947.',
      fullContent: `
### From Sepoy Mutiny to Constituent Assembly: The 90-Year Struggle

The trajectory of the Indian national movement represents one of the most intellectually diverse and geographically widespread liberation struggles in modern world history.

#### 1. The 1857 Watershed & The End of Company Rule
The revolt of 1857, sparked at Meerut and Barrackpore (Mangal Pandey), marked the end of the English East India Company's rule. With the **Government of India Act 1858 (Queen's Proclamation)**, the administration was transferred directly to the British Crown, creating the office of the Secretary of State for India and the Viceroy.

#### 2. The Moderate vs. Extremist Phase (1885–1915)
- **Moderates (Dadabhai Naoroji, Gopal Krishna Gokhale)**: Leveraged constitutional agitation, petitions, and economic critiques (Naoroji's "Poverty and Un-British Rule in India" detailing the Drain of Wealth).
- **Extremists (Lal-Bal-Pal, Aurobindo Ghosh)**: Advocated Swaraj as a birthright, mass boycotts of foreign goods, and national education after the 1905 Partition of Bengal.

#### 3. The Gandhian Era & Mass Mobilization (1915–1947)
- **Non-Cooperation Movement (1920–1922)**: Surrender of British titles, boycott of courts and schools, suspended after the Chauri Chaura incident.
- **Civil Disobedience Movement (1930)**: Salt Satyagraha from Sabarmati to Dandi (March 12 – April 6, 1930).
- **Quit India Movement (1942)**: The historic "Do or Die" call launched at the Gowalia Tank Maidan, Bombay.
      `,
      author: 'Dr. K. S. Narayanan (National Archives of India)',
      readTime: '10 min read',
      tags: ['Freedom Movement', '1857 Revolt', 'Drain of Wealth', 'UPSC Modern History']
    },
    curatedFacts: [
      {
        category: 'History',
        emoji: '🇮🇳',
        title: 'Pingali Venkayya’s Tricolour',
        summary: 'Designed the basic design of the Indian National Flag, presented to Mahatma Gandhi at the Vijayawada AICC session in 1921.'
      },
      {
        category: 'Inventions',
        emoji: '📜',
        title: 'Calligraphy of the Constitution',
        summary: 'Prem Behari Narain Raizada handwritten the original Constitution of India in flowing italic style without charging any fee.'
      },
      {
        category: 'Discoveries',
        emoji: '🏛️',
        title: 'Ashoka Lion Capital at Sarnath',
        summary: 'Adopted as the National Emblem of India on January 26, 1950, with the motto "Satyameva Jayate" from the Mundaka Upanishad.'
      },
      {
        category: 'Science',
        emoji: '🔬',
        title: 'J.C. Bose’s Crescograph in 1901',
        summary: 'Jagadish Chandra Bose invented the crescograph to measure microscopic movements in plants, proving they respond to stimuli.'
      }
    ],
    examCapsule: [
      {
        topic: 'Chronology of Freedom Milestones',
        keyTakeaway: 'Champaran (1917) -> Kheda & Ahmedabad (1918) -> Rowlatt Act & Jallianwala (1919) -> Non-Cooperation (1920).',
        examTarget: 'UPSC Prelims / SSC / TNPSC'
      },
      {
        topic: 'Constitutional Committees',
        keyTakeaway: 'Drafting Committee Chairman: Dr. B.R. Ambedkar. Constitutional Advisor: Sir B.N. Rau.',
        examTarget: 'All Competitive Exams'
      }
    ],
    brainTeaser: {
      question: 'Who was appointed as the Constitutional Advisor to the Constituent Assembly of India during the drafting of the Constitution?',
      options: ['Dr. B.R. Ambedkar', 'Sir B.N. Rau', 'K.M. Munshi', 'Alladi Krishnaswamy Iyer'],
      answer: 1,
      explanation: 'Sir Benegal Narsing Rau (B.N. Rau) was appointed as the Constitutional Advisor to the Constituent Assembly and prepared the initial draft of the Constitution.'
    },
    pdfPages: 18,
    pdfSize: '3.8 MB'
  }
];

export const MONTHLY_VOLUMES = [
  {
    month: 'September 2026',
    monthKey: '2026-09',
    volumeNumber: 9,
    year: 2026,
    totalIssues: 4,
    description: 'Special science breakthroughs, ancient Silk Road trade routes, quantum mechanics, and Himalayan geological history.',
    pdfFullComp: 'September-2026-Full-Compendium.pdf',
    pdfSize: '14.2 MB'
  },
  {
    month: 'August 2026',
    monthKey: '2026-08',
    volumeNumber: 8,
    year: 2026,
    totalIssues: 4,
    description: 'Independence special edition, archival constitution history, space exploration, and monsoon geography.',
    pdfFullComp: 'August-2026-Full-Compendium.pdf',
    pdfSize: '13.8 MB'
  },
  {
    month: 'July 2026',
    monthKey: '2026-07',
    volumeNumber: 7,
    year: 2026,
    totalIssues: 4,
    description: 'Deep ocean exploration, telescope discoveries, industrial revolution milestones, and ancient mathematics.',
    pdfFullComp: 'July-2026-Full-Compendium.pdf',
    pdfSize: '12.9 MB'
  }
];
