'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function MatchesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                {/* Badges skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                  <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                </div>
                
                {/* Date skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
                
                {/* Time skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
              </div>
              
              <div className="text-right space-y-1">
                {/* Capacity skeleton */}
                <div className="flex items-center gap-1 justify-end">
                  <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
                
                {/* Cost skeleton */}
                <div className="flex items-center gap-1 justify-end">
                  <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {/* Location skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
              
              {/* Button skeleton */}
              <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
            
            {/* Progress bar skeleton */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
