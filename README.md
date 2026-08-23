# Personal Site

### Welcome to My Personal Site!

This is a personal site to showcase my projects and skills.

### 🚀 Technologies Used

This project uses the following technologies:

- **Next.js**: A React framework for server-side rendering.
- **TypeScript**: Adds static types to JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for UI development.
- **Shadcn/UI**: A modern UI component library for React.
- **Supabase**: Database and real-time data synchronization.
- **Vercel**: Deployment platform.

### 🛠️ Setup Instructions

To get started, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and change your directory to `chvaldez10`.
3. Install pnpm 11 or later with `corepack enable pnpm`, or follow the [pnpm installation guide](https://pnpm.io/installation).
4. Run `pnpm install` to install dependencies.
5. Create a `.env.local` file in the root directory and add your Supabase credentials.
6. Start the development server with `pnpm dev`.
7. Open your browser and visit `http://localhost:3000` to view your site.

### 🌐 Deployment

Deployed on Vercel: [chvaldez10.vercel.app](https://chvaldez10.vercel.app/)

Vercel's built-in package manager detection tops out at pnpm 10, so the project requires the
`ENABLE_EXPERIMENTAL_COREPACK=1` environment variable to make Vercel honor the `packageManager`
field in `package.json`.
