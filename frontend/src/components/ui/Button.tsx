import React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'link'
  asChild?: boolean
}

const base = 'inline-flex items-center justify-center font-medium rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
const variants: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  outline: 'border border-gray-300 hover:bg-gray-100 text-gray-900 focus:ring-gray-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-transparent px-0'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', asChild, ...props }, ref) => {
    const Comp: any = asChild ? 'span' : 'button'
    return (
      <Comp
        ref={ref}
        className={`${base} ${variants[variant]} ${className} px-3 py-2`}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
