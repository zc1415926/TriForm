import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'

describe('Button', () => {
  it('renders a button element', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Button>Default</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-500')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-2')
    expect(button).toHaveClass('border-blue-200')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-gray-100')
  })

  it('applies size classes', () => {
    render(<Button size="sm">Small</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')
  })

  it('applies icon size classes', () => {
    render(<Button size="icon">Icon</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('size-12')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards other button props', () => {
    render(<Button type="submit" name="submit-btn">Submit</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('name', 'submit-btn')
  })
})
