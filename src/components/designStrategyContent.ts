export type StrategyOptionContent = {
  id: string
  label: string
  description: string
}

/**
 * Copy taken from the services wheel on https://murynmukha.com/.
 * Order matches the live list, which starts on “0→1 product design”.
 */
export const strategyOptions: StrategyOptionContent[] = [
  {
    id: 'zero-to-one',
    label: '0→1 product design',
    description:
      'From a raw idea to something we can ship. I work through concept, scope, user flows, and visual design.',
  },
  {
    id: 'design-engineering',
    label: 'Design engineering',
    description:
      'Frontend components, animations, UI polish. I ship the designs I make instead of stopping at mockups.',
  },
  {
    id: 'generative-ai',
    label: 'Generative AI',
    description:
      'Chatbots, co-pilots, dialogue flows. I design AI products and work with AI tools across my entire process.',
  },
  {
    id: 'mvp-scoping',
    label: 'MVP scoping',
    description:
      "Ship the right thing first, skip what can wait. I help founders decide what goes in v1, what's v2, and what's noise.",
  },
  {
    id: 'product-strategy',
    label: 'Product strategy',
    description:
      'What to build, for whom, in what order. I work through priorities, roadmaps, and the trade-offs behind them.',
  },
  {
    id: 'qa-ownership',
    label: 'QA ownership',
    description:
      'I break what we build, then figure out why. Checking edge cases, logic gaps, and following through bugs.',
  },
  {
    id: 'user-research',
    label: 'User research',
    description:
      'Custdev calls, session recordings, usability tests. I run them, synthesize the patterns, and turn into solutions.',
  },
  {
    id: 'direction',
    label: 'Direction',
    description:
      'Brand identity, visual language, tone of voice. I set the rules for how the product feels and talks to customers.',
  },
  {
    id: 'fundraising-support',
    label: 'Fundraising support',
    description:
      "Pitch decks, product demos, prototypes. I help founders show what the product is and where it's going.",
  },
  {
    id: 'eng-partnership',
    label: 'Eng partnership',
    description:
      "I collaborate with engineers from sprint planning to QA. They don't get a spec thrown over a wall.",
  },
  {
    id: 'business-analysis',
    label: 'Business analysis',
    description:
      'I map the flows, find where things break or slow down, and propose fixes with the data to back them up.',
  },
]
