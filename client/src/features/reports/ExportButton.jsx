// ExportButton — Export report as text/copy to clipboard

import { useState } from 'react'
import Button from '../../components/ui/Button'

export default function ExportButton({ text, label = 'Copy Report' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? '✅ Copied!' : `📋 ${label}`}
    </Button>
  )
}
