import { VocabularyWord } from "../src/types";

// High-yield educational dictionary for historical, scientific, political, and general academic learning
export const EDUCATIONAL_VOCAB_MAP: Record<string, Omit<VocabularyWord, "word">> = {
  // Historical & Conflict terms
  invasion: {
    phonetic: "/ɪnˈveɪ.ʒən/",
    partOfSpeech: "noun",
    meaning: "An instance of invading a country or region with an armed force.",
    hindiMeaning: "आक्रमण, हमला",
    exampleSentence: "The invasion marked the catastrophic beginning of the continental conflict.",
    synonyms: ["incursion", "assault", "onslaught", "occupation"]
  },
  outbreak: {
    phonetic: "/ˈaʊt.breɪk/",
    partOfSpeech: "noun",
    meaning: "A sudden or violent start of something unwelcome, such as war or disease.",
    hindiMeaning: "प्रकोप, अचानक शुरुआत",
    exampleSentence: "The outbreak of hostilities caught diplomatic channels unprepared.",
    synonyms: ["flare-up", "eruption", "inception", "onset"]
  },
  annexation: {
    phonetic: "/ˌæn.ekˈseɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "The formal act of acquiring territory by conquest or occupation.",
    hindiMeaning: "विलय, राज्य-हरण",
    exampleSentence: "The forced annexation of border provinces violated existing treaties.",
    synonyms: ["seizure", "incorporation", "occupation", "appropriation"]
  },
  ultimatum: {
    phonetic: "/ˌʌl.tɪˈmeɪ.təm/",
    partOfSpeech: "noun",
    meaning: "A final demand or statement of terms, the rejection of which will result in retaliation.",
    hindiMeaning: "अंतिम चेतावनी, अल्टीमेटम",
    exampleSentence: "The government issued a strict 24-hour ultimatum to withdraw forces.",
    synonyms: ["final demand", "warning", "decree", "stipulation"]
  },
  mobilization: {
    phonetic: "/ˌməʊ.bɪ.laɪˈzeɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "The action of organizing and preparing troops and resources for active service in war.",
    hindiMeaning: "सैन्य लामबंदी, तैयारी",
    exampleSentence: "Nationwide mobilization shifted industrial factories into defense production.",
    synonyms: ["deployment", "preparation", "rallying", "activation"]
  },
  sovereignty: {
    phonetic: "/ˈsɒv.rɪn.ti/",
    partOfSpeech: "noun",
    meaning: "Supreme power, self-governance, or authority of a state over its territory.",
    hindiMeaning: "संप्रभुता, स्वायत्तता",
    exampleSentence: "The treaty recognized the full sovereignty and territorial integrity of the nation.",
    synonyms: ["autonomy", "independence", "supremacy", "self-determination"]
  },
  belligerent: {
    phonetic: "/bəˈlɪdʒ.ər.ənt/",
    partOfSpeech: "adjective / noun",
    meaning: "Hostile, aggressive, or a nation engaged in recognized war.",
    hindiMeaning: "युद्धरत, आक्रामक",
    exampleSentence: "Both belligerent factions signed a temporary humanitarian armistice.",
    synonyms: ["combative", "aggressive", "warring", "militant"]
  },
  armistice: {
    phonetic: "/ˈɑː.mɪ.stɪs/",
    partOfSpeech: "noun",
    meaning: "An agreement made by opposing sides in a war to stop fighting for a certain time.",
    hindiMeaning: "युद्धविराम संधि",
    exampleSentence: "The armistice brought an immediate cessation of artillery fire along the front.",
    synonyms: ["ceasefire", "truce", "moratorium", "peace pact"]
  },
  conflagration: {
    phonetic: "/ˌkɒn.fləˈɡreɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "An extensive fire which destroys a great deal of land or property; a catastrophic conflict.",
    hindiMeaning: "भीषण आग, प्रलयंकारी युद्ध",
    exampleSentence: "The dry timber houses fueled a rapid conflagration across the historic district.",
    synonyms: ["blaze", "inferno", "holocaust", "firestorm"]
  },
  catastrophe: {
    phonetic: "/kəˈtæs.trə.fi/",
    partOfSpeech: "noun",
    meaning: "An event causing great and often sudden damage or suffering; a disaster.",
    hindiMeaning: "विपत्ति, तबाही",
    exampleSentence: "The civic disaster highlighted severe shortcomings in urban firefighting systems.",
    synonyms: ["calamity", "disaster", "debacle", "tragedy"]
  },
  devastating: {
    phonetic: "/ˈdev.ə.steɪ.tɪŋ/",
    partOfSpeech: "adjective",
    meaning: "Highly destructive or causing severe shock and grief.",
    hindiMeaning: "विनाशकारी, दिल दहला देने वाला",
    exampleSentence: "The storm had a devastating impact on coastal infrastructure.",
    synonyms: ["destructive", "ruinous", "cataclysmic", "disastrous"]
  },
  reconstruction: {
    phonetic: "/ˌriː.kənˈstrʌk.ʃən/",
    partOfSpeech: "noun",
    meaning: "The action or process of rebuilding something after damage or destruction.",
    hindiMeaning: "पुनर्निर्माण",
    exampleSentence: "Architects introduced wide stone avenues during the city reconstruction.",
    synonyms: ["rebuilding", "restoration", "redevelopment", "renovation"]
  },
  treaty: {
    phonetic: "/ˈtriː.ti/",
    partOfSpeech: "noun",
    meaning: "A formally concluded and ratified agreement between states.",
    hindiMeaning: "संधि, समझौता",
    exampleSentence: "The delegates ratified a mutual security treaty in Geneva.",
    synonyms: ["pact", "accord", "covenant", "agreement"]
  },
  reunification: {
    phonetic: "/ˌriː.juː.nɪ.fɪˈkeɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "The restoration of political unity to a place or group, especially a divided territory.",
    hindiMeaning: "पुनर्मिलन, एकीकरण",
    exampleSentence: "The fall of the barrier paved the way for German reunification.",
    synonyms: ["reintegration", "reunion", "merger", "consolidation"]
  },
  pivotal: {
    phonetic: "/ˈpɪv.ə.təl/",
    partOfSpeech: "adjective",
    meaning: "Of crucial importance in relation to the development or success of something else.",
    hindiMeaning: "महत्वपूर्ण, निर्णायक",
    exampleSentence: "The commander made a pivotal decision that reversed the campaign's trajectory.",
    synonyms: ["crucial", "decisive", "vital", "momentous"]
  },
  remnant: {
    phonetic: "/ˈrem.nənt/",
    partOfSpeech: "noun",
    meaning: "A small remaining quantity of something.",
    hindiMeaning: "अवशेष, बचा हुआ भाग",
    exampleSentence: "Weathered remnants of the ancient fortification are still visible.",
    synonyms: ["vestige", "relic", "fragment", "residue"]
  },
  breakthrough: {
    phonetic: "/ˈbreɪk.θruː/",
    partOfSpeech: "noun",
    meaning: "A sudden, dramatic, and important discovery or development.",
    hindiMeaning: "महत्वपूर्ण खोज, सफलता",
    exampleSentence: "Researchers announced a major technological breakthrough in renewable energy.",
    synonyms: ["discovery", "innovation", "advance", "leap"]
  },
  expedition: {
    phonetic: "/ˌek.spəˈdɪʃ.ən/",
    partOfSpeech: "noun",
    meaning: "A journey undertaken by a group of people with a particular purpose, especially exploration or scientific research.",
    hindiMeaning: "अभियान, खोज यात्रा",
    exampleSentence: "The polar expedition documented previously unknown underwater geology.",
    synonyms: ["voyage", "mission", "journey", "excursion"]
  },
  unprecedented: {
    phonetic: "/ʌnˈpres.ɪ.den.tɪd/",
    partOfSpeech: "adjective",
    meaning: "Never done or known before; without previous example.",
    hindiMeaning: "अभूतपूर्व, जो पहले कभी न हुआ हो",
    exampleSentence: "The summit drew an unprecedented number of world leaders.",
    synonyms: ["unmatched", "novel", "extraordinary", "unparalleled"]
  },
  significance: {
    phonetic: "/sɪɡˈnɪf.ɪ.kəns/",
    partOfSpeech: "noun",
    meaning: "The quality of being worthy of attention; importance or implied meaning.",
    hindiMeaning: "महत्व, सार्थकता",
    exampleSentence: "Historians still debate the enduring significance of the 1939 protocols.",
    synonyms: ["importance", "consequence", "gravity", "weight"]
  },
  precursor: {
    phonetic: "/priːˈkɜː.sər/",
    partOfSpeech: "noun",
    meaning: "A person or thing that comes before another of the same kind; a forerunner.",
    hindiMeaning: "अग्रदूत, पूर्वगामी",
    exampleSentence: "Early telegraph lines were the precursors of global digital networks.",
    synonyms: ["forerunner", "predecessor", "harbinger", "pioneer"]
  },
  resilience: {
    phonetic: "/rɪˈzɪl.jəns/",
    partOfSpeech: "noun",
    meaning: "The capacity to recover quickly from difficulties; toughness.",
    hindiMeaning: "लचीलापन, संकट से उबरने की क्षमता",
    exampleSentence: "The citizens demonstrated remarkable resilience during the prolonged siege.",
    synonyms: ["fortitude", "endurance", "tenacity", "toughness"]
  },
  archaeological: {
    phonetic: "/ˌɑː.ki.əˈlɒdʒ.ɪ.kəl/",
    partOfSpeech: "adjective",
    meaning: "Relating to the study of human history and prehistory through excavation of sites.",
    hindiMeaning: "पुरातत्व संबंधी",
    exampleSentence: "Recent archaeological digs uncovered tools dating back ten millennia.",
    synonyms: ["historical", "antiquarian", "excavatory"]
  },
  biodiversity: {
    phonetic: "/ˌbaɪ.əʊ.daɪˈvɜː.sɪ.ti/",
    partOfSpeech: "noun",
    meaning: "The variety of plant and animal life in the world or in a particular habitat.",
    hindiMeaning: "जैव विविधता",
    exampleSentence: "Preserving rainforest biodiversity is essential for global climate regulation.",
    synonyms: ["ecological variety", "biological diversity"]
  },
  sustainable: {
    phonetic: "/səˈsteɪ.nə.bəl/",
    partOfSpeech: "adjective",
    meaning: "Able to be maintained at a certain rate or level; conserving ecological balance.",
    hindiMeaning: "सतत, टिकाऊ",
    exampleSentence: "Urban planners prioritized sustainable transport systems to curb emissions.",
    synonyms: ["viable", "renewable", "maintainable", "enduring"]
  },
  diplomatic: {
    phonetic: "/ˌdɪp.ləˈmæt.ɪk/",
    partOfSpeech: "adjective",
    meaning: "Concerning the profession or activity of managing international relations.",
    hindiMeaning: "कूटनीतिक, राजनयिक",
    exampleSentence: "Envoys pursued intense diplomatic talks to prevent an escalation.",
    synonyms: ["consular", "ambassadorial", "tactful", "political"]
  },
  ratification: {
    phonetic: "/ˌræt.ɪ.fɪˈkeɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "The action of signing or giving formal consent to a treaty, making it officially valid.",
    hindiMeaning: "पुष्टिकरण, संपुष्टि",
    exampleSentence: "The accord awaited legislative ratification before entering into force.",
    synonyms: ["endorsement", "approval", "sanction", "confirmation"]
  },
  heritage: {
    phonetic: "/ˈher.ɪ.tɪdʒ/",
    partOfSpeech: "noun",
    meaning: "Property, traditions, or historical culture that is passed down through generations.",
    hindiMeaning: "विरासत, धरोहर",
    exampleSentence: "The monument was designated an international cultural heritage landmark.",
    synonyms: ["legacy", "inheritance", "tradition", "estate"]
  },
  transformation: {
    phonetic: "/ˌtræns.fəˈmeɪ.ʃən/",
    partOfSpeech: "noun",
    meaning: "A thorough or dramatic change in form, appearance, or character.",
    hindiMeaning: "परिवर्तन, कायापलट",
    exampleSentence: "Industrialization sparked a rapid transformation of agrarian communities.",
    synonyms: ["metamorphosis", "transmutation", "conversion", "evolution"]
  },
  paradigm: {
    phonetic: "/ˈpær.ə.daɪm/",
    partOfSpeech: "noun",
    meaning: "A typical example, pattern, or overarching conceptual model.",
    hindiMeaning: "प्रतिमान, मिसाल",
    exampleSentence: "Quantum mechanics established a revolutionary paradigm in modern physics.",
    synonyms: ["model", "prototype", "standard", "archetype"]
  }
};

// Common simple stop words to filter out
const STOP_WORDS = new Set([
  "about", "above", "after", "again", "against", "all", "almost", "also", "and", "any", "are",
  "because", "been", "before", "being", "between", "both", "but", "by", "came", "can", "cannot",
  "could", "did", "does", "doing", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "her", "here", "hers", "herself", "him", "himself", "his",
  "how", "into", "its", "itself", "just", "more", "most", "must", "not", "off", "once", "only",
  "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "too", "under", "until", "very", "was", "were",
  "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you",
  "your", "yours", "yourself", "yourselves", "people", "said", "first", "second", "many",
  "made", "year", "years", "time", "times", "world", "state", "city", "north", "south", "east", "west"
]);

/**
 * Free public Dictionary API fetch with a strict timeout
 */
async function fetchPublicDictionaryWord(word: string): Promise<Partial<VocabularyWord> | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || `/${word}/`;
    const meaningGroup = entry.meanings?.[0];
    const partOfSpeech = meaningGroup?.partOfSpeech || "noun";
    const defObj = meaningGroup?.definitions?.[0];
    const meaning = defObj?.definition || "";
    const example = defObj?.example || "";
    const synonyms = meaningGroup?.synonyms?.slice(0, 4) || defObj?.synonyms?.slice(0, 4) || [];

    if (!meaning) return null;

    return {
      word: entry.word || word,
      phonetic,
      partOfSpeech,
      meaning,
      exampleSentence: example,
      synonyms: synonyms.length > 0 ? synonyms : undefined
    };
  } catch {
    return null;
  }
}

/**
 * Extract candidate vocabulary words from article text
 */
export async function extractVocabularyFallback(
  rawText: string,
  title?: string,
  targetCount: number = 4
): Promise<VocabularyWord[]> {
  const combined = `${title || ""} ${rawText}`
    // Strip markdown formatting & directives
    .replace(/:::.*?:::/gs, " ")
    .replace(/\[\/?(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, " ")
    .replace(/\[.*?\]\(.*?\)/g, " ")
    .replace(/[#*`_~]/g, " ");

  // Tokenize words
  const rawTokens = combined.match(/[a-zA-Z]{5,}/g) || [];
  const freqMap = new Map<string, number>();

  for (const token of rawTokens) {
    const lower = token.toLowerCase();
    if (!STOP_WORDS.has(lower) && lower.length >= 6) {
      freqMap.set(lower, (freqMap.get(lower) || 0) + 1);
    }
  }

  // Priority 1: Match with high-yield curated educational vocabulary
  const matchedWords: VocabularyWord[] = [];
  const usedKeys = new Set<string>();

  for (const [candidate] of freqMap.entries()) {
    if (EDUCATIONAL_VOCAB_MAP[candidate] && !usedKeys.has(candidate)) {
      usedKeys.add(candidate);
      const data = EDUCATIONAL_VOCAB_MAP[candidate];
      const capitalized = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      matchedWords.push({
        word: capitalized,
        ...data
      });
      if (matchedWords.length >= targetCount) {
        return matchedWords;
      }
    }
  }

  // Priority 2: For other candidate academic words, query public dictionary
  const remainingCandidates = Array.from(freqMap.keys())
    .filter((w) => !usedKeys.has(w) && w.length >= 7)
    .slice(0, 8);

  for (const cand of remainingCandidates) {
    if (matchedWords.length >= targetCount) break;

    const dictResult = await fetchPublicDictionaryWord(cand);
    if (dictResult && dictResult.meaning) {
      usedKeys.add(cand);
      const capitalized = cand.charAt(0).toUpperCase() + cand.slice(1);
      matchedWords.push({
        word: capitalized,
        phonetic: dictResult.phonetic || `/${cand}/`,
        partOfSpeech: dictResult.partOfSpeech || "noun",
        meaning: dictResult.meaning,
        hindiMeaning: `महत्वपूर्ण शब्द (${capitalized})`,
        exampleSentence: dictResult.exampleSentence || `The term ${cand} is of key importance in understanding this subject.`,
        synonyms: dictResult.synonyms || []
      });
    }
  }

  // Fallback: If still under target count, supplement with foundational academic words relevant to articles
  if (matchedWords.length < 2) {
    const defaults = ["pivotal", "significance", "transformation", "resilience", "unprecedented"];
    for (const d of defaults) {
      if (!usedKeys.has(d) && EDUCATIONAL_VOCAB_MAP[d]) {
        usedKeys.add(d);
        const capitalized = d.charAt(0).toUpperCase() + d.slice(1);
        matchedWords.push({
          word: capitalized,
          ...EDUCATIONAL_VOCAB_MAP[d]
        });
        if (matchedWords.length >= targetCount) break;
      }
    }
  }

  return matchedWords;
}

/**
 * Lookup a single vocabulary word fallback
 */
export async function lookupWordFallback(word: string, contextSentence?: string): Promise<VocabularyWord> {
  const clean = word.trim().toLowerCase();
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);

  if (EDUCATIONAL_VOCAB_MAP[clean]) {
    const data = EDUCATIONAL_VOCAB_MAP[clean];
    return {
      word: capitalized,
      ...data,
      exampleSentence: contextSentence || data.exampleSentence
    };
  }

  // Fetch from dictionary
  const publicData = await fetchPublicDictionaryWord(clean);
  if (publicData && publicData.meaning) {
    return {
      word: capitalized,
      phonetic: publicData.phonetic || `/${clean}/`,
      partOfSpeech: publicData.partOfSpeech || "noun",
      meaning: publicData.meaning,
      hindiMeaning: `अध्ययन शब्द (${capitalized})`,
      exampleSentence: contextSentence || publicData.exampleSentence || `Notice how the word "${clean}" is applied in the context.`,
      synonyms: publicData.synonyms || []
    };
  }

  // Generic fallback if network lookup fails
  return {
    word: capitalized,
    phonetic: `/${clean}/`,
    partOfSpeech: "noun",
    meaning: `A significant term used in the study of this topic: ${clean}.`,
    hindiMeaning: "अध्ययन शब्द",
    exampleSentence: contextSentence || `The word "${clean}" plays a key role in the text.`,
    synonyms: []
  };
}
