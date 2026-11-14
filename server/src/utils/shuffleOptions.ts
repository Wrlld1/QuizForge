/**
 * Shuffle answer options and return the new correct answer index.
 * Uses Fisher-Yates shuffle.
 */
export function shuffleOptions(options: string[], correctIndex: number): { options: string[]; answer: number } {
  // Build index array [0, 1, 2, 3]
  const indices = options.map((_, i) => i)

  // Fisher-Yates shuffle on indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const shuffledOptions = indices.map((i) => options[i])
  const newCorrectIndex = indices.indexOf(correctIndex)

  return { options: shuffledOptions, answer: newCorrectIndex }
}
