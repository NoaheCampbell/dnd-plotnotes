# PlotNotes - Campaign Management and Flowchart Tool

PlotNotes is a web application designed to help game masters and writers manage their campaigns, characters, locations, and visualize narrative flows using an interactive flowchart editor.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: (v18.x or later recommended) - [Download Node.js](https://nodejs.org/)
*   **npm**: (Comes with Node.js) - Ensure it's up to date (`npm install -g npm@latest`).
*   **PostgreSQL**: A running PostgreSQL instance. You can install it locally or use a cloud-hosted service. - [Download PostgreSQL](https://www.postgresql.org/download/)
*   **Cloudinary Account (Optional but Recommended for Image Uploads)**: For image hosting functionality. - [Sign up for Cloudinary](https://cloudinary.com/users/register/free)

## Development Environment Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
    cd plotnotes 
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```
    This will install all necessary project dependencies based on `package-lock.json`.

3.  **Set up PostgreSQL Database:**
    *   Ensure your PostgreSQL server is running.
    *   Create a new database for this project. For example, using `psql`:
        ```sql
        CREATE DATABASE plotnotes_dev;
        ```
    *   Note down your database connection details (host, port, username, password, database name).

4.  **Configure Environment Variables:**
    *   Create a `.env` file in the root of the project. You might need to create this manually if a `.env.example` is not present.
    *   Edit the `.env` file and add your database connection string and Cloudinary URL (if using Cloudinary):

        ```env
        # PostgreSQL Database URL
        # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
        DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/plotnotes_dev?schema=public"

        # Cloudinary URL (Optional - for image uploads)
        # Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
        CLOUDINARY_URL="cloudinary://your_api_key:your_api_secret@your_cloud_name"

        # NextAuth.js (if you plan to add authentication later - placeholder)
        # NEXTAUTH_URL=http://localhost:3000
        # NEXTAUTH_SECRET= # Generate a strong secret, e.g., using: openssl rand -base64 32
        ```
    *   **Important**: Replace placeholders with your actual credentials. The `DATABASE_URL` must point to the PostgreSQL database you created.
    *   The `CLOUDINARY_URL` is required if you want image uploads for NPCs, Locations, etc., to work. Get this from your Cloudinary dashboard.

5.  **Run Database Migrations:**
    Apply the database schema using Prisma Migrate:
    ```bash
    npx prisma migrate dev
    ```
    This command will:
    *   Create the necessary tables in your database based on `prisma/schema.prisma`.
    *   Prompt you to create a migration name if new changes are detected (e.g., `initial_setup`).
    *   Generate/update the Prisma Client based on your schema.

6.  **Generate Prisma Client (if needed separately):**
    While `prisma migrate dev` usually handles this, you can explicitly run:
    ```bash
    npx prisma generate
    ```

7.  **Run the Development Server:**
    (Assuming `dev` is a script in your `package.json`, e.g., `"dev": "next dev"`)
    ```bash
    npm run dev
    ```
    The application should now be running at [http://localhost:3000](http://localhost:3000).

## Key Technologies

*   **Next.js**: React framework (App Router).
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Prisma**: Next-generation ORM for Node.js and TypeScript.
*   **PostgreSQL**: Powerful, open-source object-relational database system.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Shadcn/ui**: UI components built with Radix UI and Tailwind CSS.
*   **React Flow**: Library for building node-based editors and interactive diagrams.
*   **Cloudinary**: Cloud-based image and video management (for image uploads).
*   **Lucide React**: Icon library.
*   **Sonner**: Toast notifications for React.

## Available Scripts

(Refer to `package.json` for the full list. Common scripts executed with `npm run <script-name>` or `npx <command>` for CLIs include:)

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a production server (after `npm run build`).
*   `npm run lint`: Lints the codebase (if configured).
*   `npx prisma studio`: Opens Prisma Studio to view and manage your database.
*   `npx prisma migrate dev`: Creates and applies new database migrations.
*   `npx prisma generate`: Generates/updates the Prisma Client.

## Project Structure Overview

```
plotnotes/
├── app/                  # Next.js App Router (API routes, page components)
├── components/           # Shared React components
│   ├── custom-nodes/     # Custom nodes for React Flow
│   └── ui/               # UI components (often from Shadcn/ui)
├── lib/                  # Utility functions, Prisma client, configurations (e.g., entitiesConfig.ts)
├── prisma/               # Prisma schema, migrations
│   ├── migrations/       # Database migration files
│   └── schema.prisma     # Main Prisma schema definition
├── public/               # Static assets (images, fonts, etc.)
├── .env                  # Environment variables (IMPORTANT: add to .gitignore, should not be committed)
├── .gitignore            # Specifies intentionally untracked files that Git should ignore
├── next.config.mjs       # Next.js configuration file
├── package.json          # Project metadata, dependencies, and scripts
├── package-lock.json     # NPM lock file for precise dependency versions
├── pnpm-lock.yaml        # (Consider removing if exclusively using npm to avoid confusion)
├── README.md             # This file: project overview and setup instructions
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Contributing

(Details on how to contribute can be added here if the project becomes open to contributions in the future.)

## License

(Specify a license if applicable, e.g., MIT License. If not specified, it's typically considered proprietary.) 