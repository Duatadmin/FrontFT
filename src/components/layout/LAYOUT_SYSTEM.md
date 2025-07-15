# Unified Layout System Guide

## Core Principles

1. **Use `h-lvh` for all root layout containers** - This ensures proper height on mobile devices, especially in PWA mode
2. **Safe area handling** - Use `safe-top`, `safe-bottom`, `safe-left`, `safe-right` classes for content that needs padding from device edges
3. **Consistent overflow handling** - Parent containers use `overflow-hidden`, scrollable content uses `overflow-y-auto`
4. **Bottom navigation spacing** - Mobile layouts should add `pb-32` to account for the fixed bottom navigation

## Layout Components

### BaseLayout
The foundation for all layouts. Use this as a starting point for custom layouts.

```tsx
import { BaseLayout } from '@/components/layout/BaseLayout';

// Scrollable content page
<BaseLayout scrollable={true}>
  {/* Your content */}
</BaseLayout>

// Full screen page (no scroll)
<BaseLayout scrollable={false} noPadding={true}>
  {/* Your full screen content */}
</BaseLayout>
```

### MobileDashboardLayout
For mobile pages with bottom navigation.

```tsx
import MobileDashboardLayout from '@/components/layout/MobileDashboardLayout';

<MobileDashboardLayout>
  {/* Your page content */}
</MobileDashboardLayout>
```

### MainLayout
For desktop pages with sidebar navigation.

```tsx
import MainLayout from '@/components/layout/MainLayout';

<MainLayout>
  {/* Your page content */}
</MainLayout>
```

### AnalyticsDashboardLayout
For analytics/dashboard pages on desktop.

```tsx
import AnalyticsDashboardLayout from '@/components/layout/AnalyticsDashboardLayout';

<AnalyticsDashboardLayout>
  {/* Your dashboard content */}
</AnalyticsDashboardLayout>
```

## Height Classes

- `h-lvh` - Use for root containers (logical viewport height)
- `h-full` - Use for child containers that should fill parent
- `flex-1` - Use in flex containers to fill available space

## Safe Area Classes

Defined in index.css:
- `safe-top` - Adds top padding including safe area
- `safe-bottom` - Adds bottom padding including safe area  
- `safe-left` - Adds left padding for safe area
- `safe-right` - Adds right padding for safe area
- `bottom-safe-4` - Positions element 1rem + safe area from bottom

## Common Patterns

### Full Screen Welcome/Onboarding
```tsx
<div className="h-lvh flex flex-col overflow-hidden">
  <div className="flex-1 flex items-center justify-center">
    {/* Centered content */}
  </div>
</div>
```

### Scrollable Content Page
```tsx
<div className="h-lvh flex flex-col">
  <header className="shrink-0">{/* Fixed header */}</header>
  <main className="flex-1 overflow-y-auto safe-top pb-32">
    <div className="max-w-7xl mx-auto px-4">
      {/* Scrollable content */}
    </div>
  </main>
  <BottomNavBar />
</div>
```

### Split Layout (Desktop)
```tsx
<div className="flex h-lvh overflow-hidden">
  <aside className="w-64 shrink-0">{/* Sidebar */}</aside>
  <main className="flex-1 overflow-y-auto p-6">
    {/* Main content */}
  </main>
</div>
```

## Background Handling

DashboardBackground should be used at the app root level (in main.tsx) and not repeated in individual layouts. It provides the consistent dark background for the entire app.

## Migration Checklist

When updating a component to use the unified layout system:

1. Replace `h-screen` with `h-lvh`
2. Remove `min-h-screen` from child containers
3. Add appropriate safe area classes
4. Ensure proper overflow handling (`overflow-hidden` on parent, `overflow-y-auto` on scrollable child)
5. Add `pb-32` for mobile layouts with bottom navigation
6. Remove conflicting height declarations (e.g., `min-h-screen` on DashboardBackground children)