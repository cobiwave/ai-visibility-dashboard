import 'server-only';

import type { Answer, Citation } from '@/features/answers/types';
import type { Prompt } from '@/features/prompts/types';
import type { Brand, DailyMetric } from '@/features/visibility/types';
import {
  ENGINE_IDS,
  TOPICS,
  type EngineId,
  type Sentiment,
  type Topic,
} from '@/shared/config/domain';
import type { Locale } from '@/shared/config/locale';
import { float, int, mulberry32, pick, type Rng } from '@/shared/lib/seed';

export interface Dataset {
  brand: Brand;
  prompts: Prompt[];
  answers: Answer[];
  metrics: DailyMetric[];
}

export const DATASET_SEED = 20261117;

// A fixed "now" for the generator. Using the real clock would make the data
// change between runs and break determinism.
const ANCHOR = Date.UTC(2026, 10, 16, 9, 0, 0);
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const METRIC_DAYS = 30;

const COMPETITORS = [
  { name: 'Altiplano Roasters', domain: 'altiplanoroasters.com' },
  { name: 'Café del Puerto', domain: 'cafedelpuerto.com.ar' },
  { name: 'Tostadero Sur', domain: 'tostaderosur.com.ar' },
  { name: 'Andes Bean Co.', domain: 'andesbean.co' },
] as const;

const BRAND: Brand = {
  id: 'northwind',
  name: 'Northwind Coffee',
  domain: 'northwindcoffee.com.ar',
  competitors: COMPETITORS.map((competitor) => competitor.name),
};

const PLACES = ['Argentina', 'Buenos Aires', 'Córdoba', 'Rosario'] as const;

type Template = Record<Locale, string>;

// 5 topics × 6 templates × 4 places = 120 prompts.
const TEMPLATES: Record<Topic, Template[]> = {
  subscription: [
    { en: 'best coffee subscription in {place}', es: 'mejor suscripción de café en {place}' },
    { en: 'monthly coffee club in {place}', es: 'club de café mensual en {place}' },
    {
      en: 'coffee subscription with free shipping in {place}',
      es: 'suscripción de café con envío gratis en {place}',
    },
    {
      en: 'which coffee subscription is worth it in {place}',
      es: 'qué suscripción de café vale la pena en {place}',
    },
    {
      en: 'coffee subscription as a gift in {place}',
      es: 'suscripción de café para regalar en {place}',
    },
    {
      en: 'cancel-anytime coffee subscription in {place}',
      es: 'suscripción de café sin permanencia en {place}',
    },
  ],
  specialty: [
    { en: 'specialty coffee online in {place}', es: 'café de especialidad online en {place}' },
    {
      en: 'where to buy single-origin coffee in {place}',
      es: 'dónde comprar café de origen en {place}',
    },
    {
      en: 'best specialty coffee roasters in {place}',
      es: 'mejores tostadores de café de especialidad en {place}',
    },
    {
      en: 'freshly roasted coffee beans in {place}',
      es: 'café en grano recién tostado en {place}',
    },
    {
      en: 'light roast coffee recommendations in {place}',
      es: 'recomendaciones de café tostado claro en {place}',
    },
    {
      en: 'Colombian coffee beans delivered in {place}',
      es: 'café colombiano en grano con envío en {place}',
    },
  ],
  price: [
    { en: 'cheap specialty coffee in {place}', es: 'café de especialidad barato en {place}' },
    {
      en: 'coffee subscription price comparison in {place}',
      es: 'comparación de precios de suscripciones de café en {place}',
    },
    {
      en: 'best value coffee beans in {place}',
      es: 'café en grano con mejor relación precio-calidad en {place}',
    },
    {
      en: 'how much a kilo of specialty coffee costs in {place}',
      es: 'cuánto cuesta un kilo de café de especialidad en {place}',
    },
    {
      en: 'coffee discounts and promo codes in {place}',
      es: 'descuentos y cupones de café en {place}',
    },
    {
      en: 'is a coffee subscription cheaper than the supermarket in {place}',
      es: 'conviene una suscripción de café o el súper en {place}',
    },
  ],
  delivery: [
    { en: 'same-day coffee delivery in {place}', es: 'café con entrega en el día en {place}' },
    {
      en: 'fastest coffee bean delivery in {place}',
      es: 'envío de café en grano más rápido en {place}',
    },
    { en: 'coffee roaster that delivers in {place}', es: 'tostadería que hace envíos en {place}' },
    { en: 'order ground coffee online in {place}', es: 'pedir café molido online en {place}' },
    { en: 'coffee delivery for offices in {place}', es: 'café para oficinas con envío en {place}' },
    {
      en: 'weekend coffee delivery in {place}',
      es: 'envío de café los fines de semana en {place}',
    },
  ],
  brand: [
    { en: 'Northwind Coffee reviews in {place}', es: 'opiniones de Northwind Coffee en {place}' },
    {
      en: 'Northwind Coffee vs other roasters in {place}',
      es: 'Northwind Coffee vs otras tostadurías en {place}',
    },
    {
      en: 'is Northwind Coffee worth it in {place}',
      es: 'vale la pena Northwind Coffee en {place}',
    },
    {
      en: 'Northwind Coffee subscription review in {place}',
      es: 'reseña de la suscripción de Northwind Coffee en {place}',
    },
    {
      en: 'where to buy Northwind Coffee in {place}',
      es: 'dónde comprar Northwind Coffee en {place}',
    },
    {
      en: 'Northwind Coffee alternatives in {place}',
      es: 'alternativas a Northwind Coffee en {place}',
    },
  ],
};

const MENTION_RATE: Record<EngineId, number> = {
  chatgpt: 0.72,
  perplexity: 0.58,
  gemini: 0.5,
  claude: 0.64,
  'ai-overviews': 0.44,
};

const BASE_VISIBILITY: Record<EngineId, number> = {
  chatgpt: 74,
  perplexity: 56,
  gemini: 48,
  claude: 63,
  'ai-overviews': 41,
};

const TRAITS = [
  'fresh weekly roasts',
  'a flexible subscription',
  'single-origin beans from Colombia and Brazil',
  'fast nationwide shipping',
  'competitive per-kilo prices',
  'detailed tasting notes on every bag',
] as const;

const FILLER = [
  'Prices vary by roast and grind, so compare the cost per kilo before committing.',
  'Most roasters ship nationwide, with faster delivery in the larger cities.',
  'Check the roast date on the bag: fresher beans make a noticeable difference in the cup.',
  'Subscriptions usually let you pause or skip a month without extra fees.',
  'If you brew with a moka pot or espresso machine, ask for a finer grind.',
  'Reviews on forums tend to focus on consistency more than on packaging.',
] as const;

const CITATION_DOMAINS = ['reddit.com', 'youtube.com', 'wikipedia.org'] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function fill(template: Template, place: string): Template {
  return {
    en: template.en.replace('{place}', place),
    es: template.es.replace('{place}', place),
  };
}

function buildPrompts(rng: Rng): Prompt[] {
  const prompts: Prompt[] = [];
  const templatesPerTopic = 6;

  // Rotate topics row by row so any page of the table mixes topics.
  for (let templateIndex = 0; templateIndex < templatesPerTopic; templateIndex++) {
    for (const place of PLACES) {
      for (const topic of TOPICS) {
        const template = TEMPLATES[topic][templateIndex];

        if (template === undefined) {
          throw new Error(`Missing template ${String(templateIndex)} for topic ${topic}`);
        }

        const number = prompts.length + 1;
        prompts.push({
          id: `p_${String(number).padStart(3, '0')}`,
          text: fill(template, place),
          topic,
          tracked: rng() < 0.15,
          createdAt: new Date(ANCHOR - int(rng, 30, 120) * DAY_MS).toISOString(),
        });
      }
    }
  }

  return prompts;
}

function pickSentiment(rng: Rng): Sentiment {
  const roll = rng();
  if (roll < 0.6) return 'positive';
  if (roll < 0.9) return 'neutral';
  return 'negative';
}

function brandSentence(rng: Rng, sentiment: Sentiment): string {
  const trait = pick(rng, TRAITS);

  switch (sentiment) {
    case 'positive':
      return `${BRAND.name} stands out for ${trait} and consistently strong reviews.`;
    case 'neutral':
      return `${BRAND.name} is another option, offering ${trait}.`;
    case 'negative':
      return `${BRAND.name} offers ${trait}, although some customers mention slow delivery times.`;
  }
}

function buildExcerpt(
  rng: Rng,
  promptText: string,
  brandLine: { sentence: string; position: number } | null,
): string {
  const competitorCount = int(rng, 2, COMPETITORS.length);
  const lines = COMPETITORS.slice(0, competitorCount).map(
    (competitor) => `${competitor.name} is known for ${pick(rng, TRAITS)}.`,
  );

  if (brandLine) {
    lines.splice(brandLine.position - 1, 0, brandLine.sentence);
  }

  const sentences = [`For "${promptText}", here are some options worth considering.`, ...lines];
  const fillers = [...FILLER];

  // Pad with filler until the excerpt is roughly 600 characters.
  while (sentences.join(' ').length < 560 && fillers.length > 0) {
    const [filler] = fillers.splice(int(rng, 0, fillers.length - 1), 1);
    if (filler !== undefined) sentences.push(filler);
  }

  return sentences.join(' ');
}

function buildCitations(rng: Rng, promptId: string, mentioned: boolean): Citation[] {
  const pool: string[] = [
    ...CITATION_DOMAINS,
    ...COMPETITORS.map((competitor) => competitor.domain),
  ];
  const domains = new Set<string>();
  const count = int(rng, 1, 4);

  if (mentioned && rng() < 0.5) {
    domains.add(BRAND.domain);
  }

  while (domains.size < count) {
    domains.add(pick(rng, pool));
  }

  return [...domains].map((domain) => ({
    url: `https://${domain}/guides/${promptId}`,
    domain,
    isOwnDomain: domain === BRAND.domain,
  }));
}

function buildAnswers(rng: Rng, prompts: Prompt[]): Answer[] {
  return prompts.flatMap((prompt) =>
    ENGINE_IDS.map((engine): Answer => {
      const topicBoost = prompt.topic === 'brand' ? 0.2 : 0;
      const mentioned = rng() < Math.min(0.95, MENTION_RATE[engine] + topicBoost);
      const sentiment = mentioned ? pickSentiment(rng) : null;
      const position = mentioned ? int(rng, 1, 4) : null;
      const brandLine =
        sentiment !== null && position !== null
          ? { sentence: brandSentence(rng, sentiment), position }
          : null;

      return {
        promptId: prompt.id,
        engine,
        mentioned,
        position,
        sentiment,
        excerpt: buildExcerpt(rng, prompt.text.en, brandLine),
        citations: buildCitations(rng, prompt.id, mentioned),
        capturedAt: new Date(ANCHOR - int(rng, 0, 72) * HOUR_MS).toISOString(),
      };
    }),
  );
}

function buildMetrics(rng: Rng): DailyMetric[] {
  return ENGINE_IDS.flatMap((engine) =>
    Array.from({ length: METRIC_DAYS }, (_, dayIndex): DailyMetric => {
      const daysAgo = METRIC_DAYS - 1 - dayIndex;
      const trend = dayIndex * 0.2;
      const visibilityScore = Math.round(
        clamp(BASE_VISIBILITY[engine] + trend + float(rng, -4, 4), 0, 100),
      );

      return {
        date: new Date(ANCHOR - daysAgo * DAY_MS).toISOString().slice(0, 10),
        engine,
        visibilityScore,
        shareOfVoice: round(
          clamp((visibilityScore / 100) * 0.45 + float(rng, -0.03, 0.03), 0, 1),
          3,
        ),
        avgPosition: round(clamp(4.2 - visibilityScore / 30 + float(rng, -0.3, 0.3), 1, 5), 1),
      };
    }),
  );
}

/** Pure: the same seed always returns deep-equal data. */
export function generateDataset(seed: number): Dataset {
  const rng = mulberry32(seed);
  const prompts = buildPrompts(rng);

  return {
    brand: BRAND,
    prompts,
    answers: buildAnswers(rng, prompts),
    metrics: buildMetrics(rng),
  };
}
