![coverBig](https://github.com/WarsWorld/WarsWorld/assets/96269542/12c971ba-8d27-4a17-9de1-cd60db3c7e82)

# Wars World

Wars World is an open source project made by AWBW players that want to recreate [Advance Wars By Web/AWBW](https://awbw.amarriner.com/), on a modern tech stack so we can all enjoy playing the game we love on a streamlined, blazingly fast, venue that keeps all the stuff we love plus new desperately needed features!

This repository contains the backend and frontend code and is based on this [starter template](https://github.com/trpc/examples-next-prisma-websockets-starter).

## Interested in contributing/helping?

Here are our [Contribution Guidelines](https://github.com/WarsWorld/WarsWorld/blob/main/CONTRIBUTING.md) where you can learn more about how you can help the project out!

If you want to reach out the dev team/ask some questions, feel free to [join our Discord server!](https://discord.gg/9cgTs5ZGT2)

[![image](https://github.com/WarsWorld/WarsWorld/assets/96269542/50d1ef67-24b1-480e-94eb-1b3a176f78b9)](https://discord.gg/9cgTs5ZGT2)

## Setting up your local environment

To make sure our project is able to run locally, follow these 6 easy steps!

1 - Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and run it (the Docker daemon is needed to run your local database, so all need is to have the app running in the background. Nothing else!).

2 - Make sure you have [node installed](https://nodejs.org/en/download) and the version is recent. version ^18.15.0 is recommended

3 - Clone the repository in your own working environment or IDE.

4 - Copy the "env.example" to ".env" and setup a random password/string in the PGPASSWORD and NEXTAUTH_SECRET fields.

5 - Install the dependencies from package.json and run app using the following code:

```
npm install
npm run initialise // only run this once!
npm run dev
```

Now go to localhost:3000 and you should be set! If you are having issues, feel free to contact someone in the team!

` Soon there will be a more newb/extensive setup your local environment guide here!`

## Our Tech Stack's Features

- 🧙‍♂️ E2E type safety with [tRPC](https://trpc.io)
- 🖼️ [Tailwind CSS](https://tailwindcss.com/) for easy consistent styling
- ⚡ Full-stack React with Next.js
- ⚡ WebSockets / Subscription support
- ⚡ Database with Prisma
- 🔐 Authorization using [next-auth](https://next-auth.js.org/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
