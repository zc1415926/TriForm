import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders a span element', () => {
    render(<Badge>Badge Text</Badge>)
    
    expect(screen.getByText('Badge Text')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>)
    
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-primary')
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary')
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    
    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>)
    
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('has correct base classes', () => {
    render(<Badge>Base</Badge>)
    
    const badge = screen.getByText('Base')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-md')
  })
})
