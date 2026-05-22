export type AIAction = 'spellcheck' | 'polish' | 'rephrase' | 'fix' | 'suggest' | 'apply' | 'compare'

const PROMPTS: Record<AIAction, string> = {
  spellcheck: 'Fix only the spelling errors in the following text. Return only the corrected text with no explanations:',
  polish: 'Improve the grammar, clarity, and flow of the following text. Keep the original meaning and style. Return only the improved text:',
  rephrase: 'Rephrase the following text to be clearer and more concise while preserving the meaning. Return only the rephrased text:',
  fix: 'Analyze the following code and: 1. Identify the programming language 2. Find any syntax errors, logic errors, runtime issues, or common bugs 3. Return ONLY the complete corrected code with no explanations, no markdown, no code fences.',
  suggest: 'The user is writing a note. Suggest improvements or a natural continuation for the following text. Return only the suggestion:',
  apply: 'Reformat and improve the following content. Enhance structure and readability. Return only the improved content:',
  compare: 'Compare these two notes and provide a concise plain-English summary of the key differences:',
}

export function getPrompt(action: AIAction): string {
  return PROMPTS[action] ?? PROMPTS.polish
}

export function getFormatPrompt(format: string): string {
  switch (format.toLowerCase()) {
    case 'rtf':
      return 'Reformat and improve the following rich text content. Enhance structure and readability. Use **text** for bold, _text_ for italic. Return only the improved content:'
    case 'csv':
      return 'Clean and standardize the following CSV data. Fix inconsistent formatting, remove extra whitespace. Return only the cleaned CSV:'
    case 'xml':
      return 'Reformat and clean the following XML. Ensure proper indentation (2 spaces), valid tag nesting. Return only the cleaned XML:'
    default:
      return 'Improve the structure, clarity, and organization of the following notes. Return only the improved content:'
  }
}
