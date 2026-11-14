import { useMemo } from 'react'

interface CodeBlockProps {
  code: string
  language: string
}

const LANG_LABELS: Record<string, string> = {
  javascript: 'JS',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
}

function highlightLine(line: string, language: string): (JSX.Element | string)[] {
  const tokens: { text: string; cls: string }[] = []

  if (language === 'sql') {
    const sqlKeywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ON|AND|OR|NOT|IN|AS|ORDER|BY|GROUP|HAVING|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|COUNT|AVG|SUM|MAX|MIN|DESC|ASC|DISTINCT|COALESCE|INTERVAL|DATE_SUB|NOW|NULL|LIKE|BETWEEN|EXISTS|CREATE|ALTER|DROP|INDEX|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|UNIQUE|CHECK|CONSTRAINT)\b/gi

    let remaining = line
    let match: RegExpExecArray | null

    while ((match = sqlKeywords.exec(remaining)) !== null) {
      if (match.index > 0) {
        const before = remaining.slice(0, match.index)
        // Check for strings in "before"
        pushWithStrings(tokens, before)
      }
      tokens.push({ text: match[0], cls: 'text-purple-400' })
      remaining = remaining.slice(match.index + match[0].length)
      sqlKeywords.lastIndex = 0
    }
    if (remaining) pushWithStrings(tokens, remaining)

    return tokens.map((t, i) =>
      t.cls ? <span key={i} className={t.cls}>{t.text}</span> : <span key={i}>{t.text}</span>
    )
  }

  // JS/HTML/CSS highlighting
  let remaining = line

  // Comment
  const commentIdx = remaining.indexOf('//')
  let comment = ''
  if (commentIdx >= 0 && language !== 'html') {
    comment = remaining.slice(commentIdx)
    remaining = remaining.slice(0, commentIdx)
  }

  // HTML comment
  if (language === 'html') {
    const htmlCommentIdx = remaining.indexOf('<!--')
    if (htmlCommentIdx >= 0) {
      comment = remaining.slice(htmlCommentIdx)
      remaining = remaining.slice(0, htmlCommentIdx)
    }
  }

  // Process remaining
  const regex = language === 'html'
    ? /(<\/?[a-zA-Z][a-zA-Z0-9]*)|(\/?[>])|("[^"]*"|'[^']*')|([a-zA-Z-]+=)|(\b\d+\b)/g
    : language === 'css'
      ? /([a-zA-Z-]+(?=\s*:))|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(:\s*)|(#[0-9a-fA-F]{3,8}\b)|(\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b)|(\b(?:none|solid|hidden|block|flex|grid|relative|absolute|fixed|static|inherit|auto|center|nowrap|wrap|column|row|pointer|ease(?:-in|-out|-in-out)?|linear|forwards|both|normal|bold|italic|uppercase|lowercase|ellipsis)\b)/g
      : /(\b(?:const|let|var|function|return|import|export|from|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|class|extends|async|await|try|catch|throw|finally|yield|delete|in|of|default|void|null|undefined|true|false|this|super|require)\b)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(=>)|(\.\w+(?=\s*\())/g

  let m: RegExpExecArray | null
  let lastIdx = 0

  while ((m = regex.exec(remaining)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({ text: remaining.slice(lastIdx, m.index), cls: '' })
    }

    const text = m[0]
    let cls = ''

    if (language === 'html') {
      if (text.startsWith('<') || text === '>' || text === '/>') cls = 'text-blue-400'
      else if (text.startsWith('"') || text.startsWith("'")) cls = 'text-green-400'
      else if (text.endsWith('=')) cls = 'text-cyan-400'
      else if (/^\d+$/.test(text)) cls = 'text-orange-400'
    } else if (language === 'css') {
      if (m[1]) cls = 'text-cyan-400'       // property
      else if (m[2]) cls = 'text-green-400'  // string
      else if (m[4]) cls = 'text-orange-400' // hex color
      else if (m[5]) cls = 'text-orange-400' // number
      else if (m[6]) cls = 'text-purple-400' // keyword
    } else {
      // JS
      if (m[1]) cls = 'text-purple-400'      // keyword
      else if (m[2]) cls = 'text-green-400'  // string
      else if (m[3]) cls = 'text-orange-400' // number
      else if (m[4]) cls = 'text-purple-400' // arrow
      else if (m[5]) cls = 'text-blue-400'   // method
    }

    tokens.push({ text, cls })
    lastIdx = m.index + text.length
  }

  if (lastIdx < remaining.length) {
    tokens.push({ text: remaining.slice(lastIdx), cls: '' })
  }

  if (comment) {
    tokens.push({ text: comment, cls: 'text-gray-500' })
  }

  return tokens.map((t, i) =>
    t.cls ? <span key={i} className={t.cls}>{t.text}</span> : <span key={i}>{t.text}</span>
  )
}

function pushWithStrings(tokens: { text: string; cls: string }[], str: string) {
  const strRegex = /('[^']*')/g
  let m: RegExpExecArray | null
  let last = 0
  while ((m = strRegex.exec(str)) !== null) {
    if (m.index > last) tokens.push({ text: str.slice(last, m.index), cls: '' })
    tokens.push({ text: m[0], cls: 'text-green-400' })
    last = m.index + m[0].length
  }
  if (last < str.length) tokens.push({ text: str.slice(last), cls: '' })
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const lines = useMemo(() => code.split('\n').slice(0, 14), [code])
  const highlighted = useMemo(
    () => lines.map((line) => highlightLine(line, language)),
    [lines, language]
  )

  return (
    <div className="bg-neutral-950 border border-white/10 rounded-lg overflow-hidden">
      {/* Language badge */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {LANG_LABELS[language] || language}
        </span>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          {highlighted.map((tokens, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 select-none w-6 text-right mr-4 shrink-0 text-xs leading-relaxed">
                {i + 1}
              </span>
              <code>{tokens}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
