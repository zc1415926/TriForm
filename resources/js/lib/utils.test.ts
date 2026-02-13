import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', true && 'visible')
    expect(result).toBe('base visible')
  })

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })

  it('merges tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('handles object syntax', () => {
    const result = cn({ active: true, disabled: false })
    expect(result).toBe('active')
  })

  it('handles array syntax', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })
})
