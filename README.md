# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a8226467-632d-4719-b2d5-4a59779474ca

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a8226467-632d-4719-b2d5-4a59779474ca) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy on Vercel

1. **Install Vercel CLI** (optional):
   ```sh
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - **⚠️ IMPORTANT**: Configure environment variables in Project Settings:
     - `VITE_API_URL`: Your backend API URL (e.g., `http://35.192.46.221:8000/prever`)
     - This variable is **REQUIRED** - the app will not work without it
   - Deploy!

3. **Deploy via CLI**:
   ```sh
   vercel
   ```

### Environment Variables

**⚠️ REQUIRED**: The `VITE_API_URL` environment variable is mandatory.

**For local development**, create a `.env` file in the root directory:

```env
VITE_API_URL=http://35.192.46.221:8000/prever
```

**For Vercel deployment**, add `VITE_API_URL` in the project settings under Environment Variables. The app will fail to build/run if this variable is not set.

### Build

```sh
npm run build
```

The build output will be in the `dist` directory.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
