# Dashboard Architecture Audit

This document outlines the architecture and functionality of the dashboard feature.

## Overview

The dashboard provides users with an overview of their training analytics. It is designed to be responsive, with separate layouts for desktop and mobile devices. The dashboard displays key performance indicators (KPIs), charts visualizing workout data, and other relevant information.

## Data Flow

The dashboard's data is fetched from a Supabase backend using custom React hooks.

- **`useDashboardData` / `useDashboardData.new`**: These hooks, located in `src/dashboard`, are the primary mechanism for fetching and managing dashboard data. They handle both real data from Supabase and mock data for development and testing purposes.
- **Supabase Adapter**: The hooks likely use a data adapter located in `src/lib/supabase/dataAdapter.ts` to abstract the direct Supabase queries. This adapter is responsible for fetching workout sessions and calculating statistics.
- **Data Types**: The data structures for the dashboard are defined in `src/dashboard/types.ts`. This file includes types for metrics, chart data (donut, bar, etc.), and the main `DashboardData` object.

## Component Structure

The dashboard is built from a set of modular and reusable components.

- **Component Library**: The core dashboard components are located in `src/dashboard/components`. This directory contains a rich set of components, including:
    - **Charts**: `DonutChart`, `VolumeChart`, `PRBarChart`, and others, all built using the `recharts` library.
    - **Metric Cards**: `MetricCard` and `MobileMetricCard` for displaying key performance indicators.
    - **Specialized Cards**: Components like `MuscleMovementBalanceCard`, `ProgressiveProgressCard`, and `TrainingLoadCard` provide more specific insights into user performance.
- **Iconography**: The `lucide-react` library is used for icons throughout the dashboard.

## Page Structure & Layout

The main dashboard page is responsible for selecting the appropriate layout based on the user's device.

- **Main Entry Point**: `src/pages/dashboard.tsx` serves as the entry point for the dashboard. It uses the `useIsMobile` hook to determine whether to render the desktop or mobile version.
- **Desktop Layout**: The desktop version of the dashboard is rendered by `src/pages/EnhancedDashboard.tsx`. It uses a grid-based layout (`AnalyticsDashboardLayout`) to arrange the various components. It also incorporates animations using `framer-motion`.
- **Mobile Layout**: The mobile version is rendered by `src/pages/EnhancedMobileDashboard.tsx`. It uses a mobile-specific layout (`MobileDashboardLayout`) and features a `MobileChartCarousel` for a swipeable chart interface, providing a better user experience on smaller screens.

## Key Features

- **Responsive Design**: The dashboard provides a tailored experience for both desktop and mobile users.
- **Data Visualization**: A variety of charts are used to visualize user data, making it easy to understand and interpret.
- **Modular Components**: The use of modular components makes the codebase easy to maintain and extend.
- **Mock Data**: The inclusion of mock data generation simplifies development and testing.
- **Authentication**: The `useAuthGuard` hook is used to protect the dashboard from unauthorized access.

## Potential Improvements

- **Error Handling**: While the dashboard has basic error handling, it could be improved to provide more specific error messages and recovery options.
- **Loading States**: The loading states could be made more granular, providing feedback on which parts of the dashboard are still loading.
- **Code Duplication**: There is some code duplication between `EnhancedDashboard.tsx` and `EnhancedMobileDashboard.tsx` that could be refactored into shared components.
