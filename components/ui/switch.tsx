'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Track
        'peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'bg-zinc-700/70 backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        'data-[checked]:bg-emerald-500/90 data-[unchecked]:bg-zinc-700/70',
        'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Sleek thumb
          'pointer-events-none block h-5 w-5 rounded-full',
          'bg-white shadow-lg',
          'transition-all duration-300 ease-out',
          'data-[checked]:translate-x-5 data-[unchecked]:translate-x-0',
          'shadow-black/30'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
