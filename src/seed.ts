import { Fact, Birthday, QuizQuestion } from './types';

export const INITIAL_FACTS: Fact[] = [
  {
    id: 'seed-berlin-wall',
    cat: 'history',
    emoji: '⏳',
    title: 'The Fall of the Berlin Wall',
    year: 1989,
    excerpt: 'On November 9, 1989, the Berlin Wall fell after 28 years of dividing East and West Germany. Thousands of people climbed and demolished the wall, marking the end of the Cold War.',
    featured: true,
    full: `The Berlin Wall stood for 28 years as the most powerful symbol of the Cold War. Built in 1961 by East Germany to prevent mass emigration to the West, it stretched 155 km around West Berlin.\n\nOn November 9, 1989, the East German government announced citizens could freely cross the border. Crowds overwhelmed the checkpoints and began tearing down the wall with hammers and their bare hands. It was broadcast live on television worldwide.\n\nThe Wall's fall was a pivotal moment that led to German reunification in October 1990 and symbolized the collapse of communist regimes across Eastern Europe. Today, small remnants of the wall stand as memorials in Berlin.`
  },
  {
    id: 'seed-moon-landing',
    cat: 'history',
    emoji: '🌙',
    title: 'Moon Landing — Apollo 11',
    year: 1969,
    excerpt: 'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon on July 20, 1969. Armstrong\'s words "one small step for man" echoed around the world.',
    featured: true,
    full: `The Apollo 11 mission, launched July 16, 1969, achieved President Kennedy's bold goal of landing humans on the Moon before the decade ended.\n\nNeil Armstrong descended the lunar module ladder at 10:56 PM EDT on July 20, 1969. His first words: "That's one small step for man, one giant leap for mankind."\n\nThe crew: Neil Armstrong (commander), Buzz Aldrin (lunar module pilot), and Michael Collins (command module pilot), who orbited the Moon while the others explored the surface.\n\nAstronauts collected 47.5 pounds of lunar material and planted the American flag. An estimated 600 million people worldwide watched live — the largest TV audience in history at the time.`
  },
  {
    id: 'seed-great-wall',
    cat: 'history',
    emoji: '🏛️',
    title: 'The Great Wall of China',
    year: -221,
    excerpt: 'Construction began around 221 BC under Emperor Qin Shi Huang. The total length of all sections built over centuries stretches more than 21,000 km.',
    featured: false,
    full: `The Great Wall of China is one of the most impressive architectural feats in human history. The earliest walls were built as early as the 7th century BC, but the most famous sections were constructed during the Ming Dynasty (1368–1644 AD).\n\nContrary to popular myth, the Great Wall is NOT visible from space with the naked eye — confirmed by astronauts including China's Yang Liwei.\n\nThe wall served multiple purposes: defense against nomadic invasions from the north, regulation of trade along the Silk Road, and immigration control. An estimated 400,000 workers died during construction and were buried within the wall itself.`
  },
  {
    id: 'seed-india-independence',
    cat: 'history',
    emoji: '🇮🇳',
    title: 'Independence of India',
    year: 1947,
    excerpt: 'India gained independence from British rule on August 15, 1947, after nearly 200 years of colonial rule. Nehru gave his famous "Tryst with Destiny" speech at midnight.',
    featured: true,
    full: `India's independence on August 15, 1947, was the culmination of decades of struggle led by Mahatma Gandhi, Jawaharlal Nehru, Subhas Chandra Bose, and millions of ordinary citizens.\n\nNehru's "Tryst with Destiny" speech, delivered to the Constituent Assembly at midnight on August 14–15, remains one of the finest speeches in the English language: "At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom."\n\nThe independence was accompanied by the Partition into India and Pakistan — one of the largest mass migrations in history, with 10–20 million people displaced and widespread communal violence.`
  },
  {
    id: 'seed-black-holes',
    cat: 'science',
    emoji: '🌑',
    title: 'Black Holes: Where Time Stands Still',
    year: 1916,
    excerpt: 'A black hole\'s gravity is so strong that not even light can escape. At the event horizon, time dilation becomes infinite — time essentially stops.',
    featured: true,
    full: `Black holes form when massive stars collapse at the end of their lives. The gravity at their center — the singularity — is so extreme that the laws of physics as we know them break down.\n\nThe event horizon is the point of no return. Anything crossing it, including light, cannot escape. This is why black holes are "black" — they emit no light of their own.\n\nThe first-ever image of a black hole was captured in 2019 by the Event Horizon Telescope: the supermassive black hole at the center of galaxy M87, 55 million light-years away, with a mass 6.5 billion times our Sun.`
  },
  {
    id: 'seed-telephone',
    cat: 'inventions',
    emoji: '📞',
    title: 'Invention of the Telephone',
    year: 1876,
    excerpt: 'Alexander Graham Bell was granted the first patent for the telephone in 1876. His first words were: "Mr. Watson, come here, I want to see you."',
    featured: false,
    full: `Alexander Graham Bell is widely credited with inventing the first practical telephone. He received his patent on March 7, 1876.\n\nHis research into harmonic telegraphy led him to the discovery that sound could be transmitted through a wire via electrical currents. The historic first call to his assistant Thomas Watson happened just days after the patent was granted.\n\nWhile others like Elisha Gray and Antonio Meucci were also working on similar technology, Bell's patent and commercial success cemented his legacy. This invention revolutionized global communications forever.`
  },
  {
    id: 'seed-dna-structure',
    cat: 'discoveries',
    emoji: '🧬',
    title: 'The Structure of DNA',
    year: 1953,
    excerpt: 'James Watson and Francis Crick discovered the double-helix structure of DNA in 1953, unlocking the secret of heredity.',
    featured: true,
    full: `In April 1953, James Watson and Francis Crick published their groundbreaking paper in 'Nature' describing the double-helix structure of DNA.\n\nThey used X-ray diffraction data produced by Rosalind Franklin and Maurice Wilkins. Franklin's "Photo 51" was crucial to the discovery, though she wasn't awarded the Nobel Prize alongside them (as she had passed away by then).\n\nThis discovery explained how genetic information is stored and copied in living organisms, laying the foundation for modern genetics, biotechnology, and medical research.`
  },
  {
    id: 'seed-printing-press',
    cat: 'inventions',
    emoji: '📖',
    title: 'The Gutenberg Printing Press',
    year: 1440,
    excerpt: 'Johannes Gutenberg invented the movable-type printing press around 1440, triggering a revolution in information distribution.',
    featured: true,
    full: `The printing press is often considered the most influential event in the second millennium. Johannes Gutenberg, a German goldsmith, combined movable type, oil-based ink, and a wooden screw press to create a mass-production system.\n\nThe "Gutenberg Bible," printed in the 1450s, was the first major book printed using this method. Before the press, books were copied by hand, making them expensive and rare.\n\nThe press allowed for the rapid spread of ideas, fueling the Renaissance, the Reformation, and the Scientific Revolution. It paved the way for modern education and literacy.`
  },
  {
    id: 'seed-alexander-great',
    cat: 'history',
    emoji: '⚔️',
    title: 'Conquests of Alexander the Great',
    year: -334,
    excerpt: 'Alexander the Great created one of the largest empires in ancient history by age 30, stretching from Greece to Egypt and northwest India.',
    featured: false,
    full: `King of Macedon by age 20, Alexander spent most of his ruling years on an unprecedented military campaign through Western Asia and Egypt.\n\nHe was undefeated in battle and is considered one of history's most successful military commanders. He was tutored by Aristotle until age 16, which influenced his appreciation for different cultures.\n\nHis conquests led to the Hellenistic period, characterized by the spread of Greek culture and language throughout the Mediterranean and Middle East. He died in Babylon in 323 BC at just 32 years old.`
  },
  {
    id: 'seed-penicillin',
    cat: 'discoveries',
    emoji: '💊',
    title: 'Discovery of Penicillin',
    year: 1928,
    excerpt: 'Alexander Fleming discovered the first antibiotic, Penicillin, after leaving a petri dish uncovered in his lab in 1928.',
    featured: false,
    full: `In September 1928, after returning from a vacation, Dr. Alexander Fleming noticed that a mold called 'Penicillium notatum' had killed the staphylococci bacteria in one of his dishes.\n\nHe noted, "That's funny," as he observed the "mold juice" inhibited bacterial growth. It took another decade for Howard Florey and Ernst Chain to refine Penicillin into a stable medicine.\n\nPenicillin's mass production during WWII saved thousands of lives from simple infections. It ushered in the age of antibiotics, changing medicine from managing symptoms to curing diseases.`
  },
  {
    id: 'seed-internet-birth',
    cat: 'inventions',
    emoji: '🌐',
    title: 'The Birth of the Internet',
    year: 1969,
    excerpt: 'The first message was sent over ARPANET on October 29, 1969, between UCLA and Stanford Research Institute.',
    featured: false,
    full: `The internet wasn't invented by one person but evolved over decades. It began as ARPANET (Advanced Research Projects Agency Network), funded by the U.S. DoD.\n\nThe first transmission was supposed to be the word "LOGIN," but the system crashed after the first two letters, so the very first message ever sent was "LO."\n\nIn the 1980s, TCP/IP protocols were standardized, and in 1989, Tim Berners-Lee invented the World Wide Web at CERN, creating the user-friendly interface we use today.`
  },
  {
    id: 'seed-gravity',
    cat: 'science',
    emoji: '🍎',
    title: 'Newton and the Law of Gravity',
    year: 1687,
    excerpt: 'Isaac Newton published "Principia Mathematica" in 1687, establishing the laws of motion and universal gravitation.',
    featured: false,
    full: `Legend has it that Newton was inspired by an apple falling from a tree. While the apple didn't hit him on the head, it did make him wonder why things always fall straight down.\n\nHis Law of Universal Gravitation states that every mass attracts every other mass in the universe with a force proportional to the product of their masses and inversely proportional to the square of the distance between them.\n\nThis work unified terrestrial and celestial mechanics — showing the same laws that make an apple fall also keep the Moon in orbit around the Earth.`
  },
  {
    id: 'seed-evolution',
    cat: 'science',
    emoji: '🦣',
    title: 'Darwin and Natural Selection',
    year: 1859,
    excerpt: 'Charles Darwin published "On the Origin of Species" in 1859, proposing the theory of evolution by natural selection.',
    featured: false,
    full: `During his voyage on the HMS Beagle in the 1830s, Darwin observed variations in turtles and finches across the Galápagos Islands. This led to his theory that species adapt over generations to their environment.\n\n"Natural Selection" is the process where individuals with favorable traits are more likely to survive and reproduce. Over time, this leads to the emergence of new species.\n\nDarwin's work was revolutionary and controversial, as it challenged the prevailing views on the origins of life. Today, it is the fundamental framework of modern biology.`
  },
  {
    id: 'seed-light-bulb',
    cat: 'inventions',
    emoji: '💡',
    title: 'Edison and the Light Bulb',
    year: 1879,
    excerpt: 'Thomas Edison created the first commercially viable incandescent light bulb in 1879, using a carbonized bamboo filament.',
    featured: false,
    full: `Edison didn't "invent" the light bulb — over 20 inventors had created similar devices before him. However, his version was the first to be practical, long-lasting, and safe for home use.\n\nHe famously said, "I have not failed. I've just found 10,000 ways that won't work." His team at Menlo Park tested thousands of materials for the filament before finding success.\n\nEdison also developed the electrical power distribution system needed to make light bulbs useful, effectively lighting up the world's cities at night.`
  }
];

export const INITIAL_BIRTHDAYS: Birthday[] = [
  { id: 'b-einstein', name: 'Albert Einstein', year: 1879, field: 'Physics', date: 'Mar 14', color: '#2d3a8c', init: 'AE' },
  { id: 'b-curie', name: 'Marie Curie', year: 1867, field: 'Chemistry', date: 'Nov 7', color: '#0a7c6e', init: 'MC' },
  { id: 'b-kalam', name: 'APJ Abdul Kalam', year: 1931, field: "India's Missile Man", date: 'Oct 15', color: '#c8960c', init: 'AK' },
  { id: 'b-da-vinci', name: 'Leonardo da Vinci', year: 1452, field: 'Art & Science', date: 'Apr 15', color: '#8c5a2d', init: 'LV' },
  { id: 'b-tesla', name: 'Nikola Tesla', year: 1856, field: 'Electrical Eng.', date: 'Jul 10', color: '#2d3a8c', init: 'NT' },
  { id: 'b-lovelace', name: 'Ada Lovelace', year: 1815, field: 'Computing', date: 'Dec 10', color: '#7c2d8c', init: 'AL' }
];

export const INITIAL_QUIZ: QuizQuestion[] = [
  { id: 'q-berlin', q: 'In what year did the Berlin Wall fall?', opts: ['1987', '1989', '1991', '1993'], correct: 1, cat: 'History' },
  { id: 'q-www', q: 'Who invented the World Wide Web?', opts: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Vint Cerf'], correct: 2, cat: 'Inventions' }
];
