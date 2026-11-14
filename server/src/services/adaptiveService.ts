import prisma from '../prismaClient'

export function skillLevelToDifficulty(skillLevel: number): string {
  if (skillLevel < 0.35) return 'easy'
  if (skillLevel < 0.65) return 'medium'
  return 'hard'
}

export function getRecommendedDifficulty(skillLevel: number): string {
  return skillLevelToDifficulty(skillLevel)
}


function pickDifficulty(skillLevel: number): string {
  const base = skillLevelToDifficulty(skillLevel)
  if (Math.random() > 0.2) return base

  const levels = ['easy', 'medium', 'hard']
  const idx = levels.indexOf(base)
  // randomly go up or down by 1
  const direction = Math.random() > 0.5 ? 1 : -1
  const newIdx = Math.max(0, Math.min(2, idx + direction))
  return levels[newIdx]
}


export async function getNextQuestion(
  userId: number,
  category: string,
  excludeIds: number[] = [],
  explicitDifficulty?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skillLevel: true },
  })
  const skillLevel = user?.skillLevel ?? 0.5

  const difficulty = explicitDifficulty || pickDifficulty(skillLevel)

  // Support multiple categories (comma-separated)
  const cats = category.includes(',') ? category.split(',').map((c: string) => c.trim()) : [category]
  const where: any = cats.length > 1 ? { category: { in: cats } } : { category }
  if (excludeIds.length > 0) {
    where.id = { notIn: excludeIds }
  }

  // Try to find question at target difficulty (random pick)
  let questions = await prisma.question.findMany({
    where: { ...where, difficulty },
    select: { id: true },
  })

  // Fallback: any difficulty in the category
  if (questions.length === 0) {
    questions = await prisma.question.findMany({
      where,
      select: { id: true },
    })
  }

  if (questions.length === 0) return null

  const randomId = questions[Math.floor(Math.random() * questions.length)].id
  const question = await prisma.question.findUnique({ where: { id: randomId } })

  return question
}

/**
 * Get a batch of questions for a quiz round.
 * Single category: 10 questions with difficulty distribution.
 * Duel (2 categories): 5 questions per category with difficulty distribution.
 *
 * Distribution depends on selected difficulty:
 *   easy:   6 easy, 3 medium, 1 hard  (single) / 3+2, 2+1, 0+1 per cat (duel)
 *   medium: 4 easy, 4 medium, 2 hard  (single) / 2+2, 2+2, 1+1 per cat (duel)
 *   hard:   2 easy, 4 medium, 4 hard  (single) / 1+1, 2+2, 2+2 per cat (duel)
 */
export async function getQuizBatch(
  category: string,
  difficulty: string
) {
  const cats = category.includes(',') ? category.split(',').map((c: string) => c.trim()) : [category]

  if (cats.length > 1) {
    // Duel: 5 questions per category
    return getDuelBatch(cats, difficulty)
  }

  // Single category: 10 questions
  const distributions: Record<string, Record<string, number>> = {
    easy:   { easy: 6, medium: 3, hard: 1 },
    medium: { easy: 4, medium: 4, hard: 2 },
    hard:   { easy: 2, medium: 4, hard: 4 },
  }
  const dist = distributions[difficulty] || distributions.medium

  const allQuestions: any[] = []

  for (const [diff, count] of Object.entries(dist)) {
    const questions = await prisma.question.findMany({
      where: { category, difficulty: diff },
    })
    const shuffled = questions.sort(() => Math.random() - 0.5)
    allQuestions.push(...shuffled.slice(0, count))
  }

  return allQuestions.sort(() => Math.random() - 0.5)
}

/**
 * Duel mode: pick 5 questions from each of 2 categories, respecting difficulty.
 */
async function getDuelBatch(cats: string[], difficulty: string) {
  const perCatDist: Record<string, Record<string, number>> = {
    easy:   { easy: 3, medium: 1, hard: 1 },
    medium: { easy: 1, medium: 3, hard: 1 },
    hard:   { easy: 1, medium: 1, hard: 3 },
  }
  const dist = perCatDist[difficulty] || perCatDist.medium

  const allQuestions: any[] = []

  for (const cat of cats) {
    const catQuestions: any[] = []
    for (const [diff, count] of Object.entries(dist)) {
      const questions = await prisma.question.findMany({
        where: { category: cat, difficulty: diff },
      })
      const shuffled = questions.sort(() => Math.random() - 0.5)
      catQuestions.push(...shuffled.slice(0, count))
    }
    // If not enough from difficulty split, fill from any difficulty
    if (catQuestions.length < 5) {
      const usedIds = catQuestions.map((q) => q.id)
      const extra = await prisma.question.findMany({
        where: { category: cat, id: { notIn: usedIds } },
      })
      const shuffled = extra.sort(() => Math.random() - 0.5)
      catQuestions.push(...shuffled.slice(0, 5 - catQuestions.length))
    }
    allQuestions.push(...catQuestions)
  }

  return allQuestions.sort(() => Math.random() - 0.5)
}

/**
 * Update the user's skill level after answering a question.
 */
export async function updateSkillLevel(
  userId: number,
  isCorrect: boolean,
  _difficulty: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skillLevel: true },
  })
  if (!user) return

  let sl = user.skillLevel
  if (isCorrect) {
    sl += 0.05 * (1 - sl)
  } else {
    sl -= 0.05 * sl
  }
  // Clamp 0..1
  sl = Math.max(0, Math.min(1, sl))

  await prisma.user.update({
    where: { id: userId },
    data: { skillLevel: sl },
  })

  return sl
}
