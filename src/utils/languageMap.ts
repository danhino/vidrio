import { Extension } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { sql } from '@codemirror/lang-sql'
import { html } from '@codemirror/lang-html'
import { markdown } from '@codemirror/lang-markdown'
import { rust } from '@codemirror/lang-rust'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { powerShell } from '@codemirror/legacy-modes/mode/powershell'

export type Format =
  | 'plain'
  | 'markdown'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'csharp'
  | 'c'
  | 'cpp'
  | 'sql'
  | 'html'
  | 'powershell'
  | 'bash'
  | 'json'
  | 'rust'
  | 'css'
  | 'xml'
  | 'rtf'
  | 'csv'

export const FORMAT_LABELS: Record<Format, string> = {
  plain: 'Plain text',
  markdown: 'Markdown',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  csharp: 'C#',
  c: 'C',
  cpp: 'C++',
  sql: 'SQL',
  html: 'HTML/CSS',
  powershell: 'PowerShell',
  bash: 'Bash',
  json: 'JSON',
  rust: 'Rust',
  css: 'CSS',
  xml: 'XML',
  rtf: 'RTF',
  csv: 'CSV',
}

export function getLanguageExtension(format: string): Extension | null {
  const f = format.trim().toLowerCase() as Format
  switch (f) {
    case 'python': return python()
    case 'javascript': return javascript()
    case 'typescript': return javascript({ typescript: true })
    case 'java': return java()
    case 'csharp': return StreamLanguage.define(csharp)
    case 'c':
    case 'cpp': return cpp()
    case 'sql': return sql()
    case 'html': return html()
    case 'markdown': return markdown()
    case 'rust': return rust()
    case 'css': return css()
    case 'json': return json()
    case 'xml': return xml()
    case 'powershell': return StreamLanguage.define(powerShell)
    case 'bash': return StreamLanguage.define(shell)
    default: return null
  }
}
