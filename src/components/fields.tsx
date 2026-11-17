import { useEffect, useId, useState, type ReactNode } from 'react'

export function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string
  hint?: string
  wide?: boolean
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className={wide ? 'field field-wide' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <small className="hint">{hint}</small>}
    </div>
  )
}

export function TextInput({
  label,
  value,
  onChange,
  wide,
  hint,
  placeholder,
  type = 'text',
  multiline,
  inputMode,
  autoComplete = 'off',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  wide?: boolean
  hint?: string
  placeholder?: string
  type?: string
  multiline?: boolean
  inputMode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal'
  autoComplete?: string
}) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      {(id) =>
        multiline ? (
          <textarea id={id} value={value} placeholder={placeholder} rows={3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      }
    </Field>
  )
}

/** Number input that lets people type freely ("1,200.5", "12.") and commits a parsed number. */
export function NumberInput({
  value,
  onChange,
  id,
  ariaLabel,
  className,
}: {
  value: number
  onChange: (n: number) => void
  id?: string
  ariaLabel?: string
  className?: string
}) {
  const [text, setText] = useState(value ? String(value) : '')
  useEffect(() => {
    const parsed = Number(text.replace(/,/g, ''))
    if ((Number.isFinite(parsed) ? parsed : 0) !== value) setText(value ? String(value) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <input
      id={id}
      className={className}
      aria-label={ariaLabel}
      inputMode="decimal"
      value={text}
      placeholder="0"
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const v = e.target.value.replace(/[^\d.,]/g, '')
        setText(v)
        const n = Number(v.replace(/,/g, ''))
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}

export function Section({
  title,
  step,
  children,
  defaultOpen = true,
  aside,
}: {
  title: string
  step: number
  children: ReactNode
  defaultOpen?: boolean
  aside?: ReactNode
}) {
  return (
    <details className="section" open={defaultOpen}>
      <summary>
        <span className="step">{step}</span>
        <span className="section-title">{title}</span>
        {aside && <span className="section-aside">{aside}</span>}
        <svg className="chev" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="section-body">{children}</div>
    </details>
  )
}
