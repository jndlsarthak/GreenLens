# EcoLearn

EcoLearn is an AI-powered environmental impact assistant that helps users understand the ecological footprint of their purchases. Scan products to see their carbon impact, earn points, complete challenges, and collect badges.

## Features

- **Product Scanning**: Use your camera to scan barcodes and get instant environmental data.
- **Impact Analysis**: Visual carbon footprint meters and eco-scores (A-F).
- **Gamification**: Earn points, level up, and unlock achievements.
- **Challenges**: Participate in sustainability challenges to build better habits.
- **Dashboard**: Track your environmental savings and activity over time.
- **Dark Mode**: Sleek, modern interface with theme support.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
    - `ui/`: ShadCN base components.
    - `shared/`: Application-specific components (CameraView, ProductCard, etc.).
- `lib/`: Utility functions.
- `store/`: Zustand state stores.
- `public/`: Static assets.

## License

This project is licensed under the MIT License.
