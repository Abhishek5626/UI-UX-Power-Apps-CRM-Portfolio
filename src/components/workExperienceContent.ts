/**
 * Employment copied from the resume. The resume gives months, not days, so each
 * span runs from the first day of the start month through the last day of the
 * end month. "Present" is 1 Nov 2026, the date used for this page.
 * Uplers and Uplers - Knit overlap from May through August 2021.
 */
export type EmploymentSpan = {
  id: string
  company: string
  role: string
  start: string
  end: string
}

export const employment: readonly EmploymentSpan[] = [
  {
    id: 'uplers',
    company: 'Uplers',
    role: 'UI/UX Designer',
    start: '2021-05-01',
    end: '2022-03-31',
  },
  {
    id: 'uplers-knit',
    company: 'Uplers - Knit',
    role: 'Product Designer',
    start: '2021-05-01',
    end: '2021-08-31',
  },
  {
    id: 'tech9',
    company: 'Tech9',
    role: 'UX/UI Designer',
    start: '2022-11-01',
    end: '2023-02-28',
  },
  {
    id: 'the-real',
    company: 'The Real',
    role: 'UX/UI Designer',
    start: '2023-03-01',
    end: '2024-12-31',
  },
  {
    id: 'kpmg',
    company: 'KPMG India',
    role: 'Senior Consultant – UX/UI Designer',
    start: '2025-02-01',
    end: '2026-11-01',
  },
]

/** Stated career total. It is not the sum of the dated spans above. */
export const statedExperienceYears = '5.08'

export const timelineStart = Date.UTC(2021, 4, 1)
export const timelineEnd = Date.UTC(2026, 10, 1)
