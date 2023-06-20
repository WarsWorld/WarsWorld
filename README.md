# Wars World

Wars World is an open source project made by AWBW players that want to recreate [Advance Wars By Web/AWBW](https://awbw.amarriner.com/), on a modern tech stack so we can all enjoy playing the game we love on a streamlined, blazingly fast, venue that keeps all the stuff we love plus new desperately needed features!

This repository contains the backend and frontend code and is based on this [starter template](https://github.com/trpc/examples-next-prisma-websockets-starter).

## Interested in contributing/helping?

Here are our [Contribution Guidelines](https://github.com/WarsWorld/WarsWorld/blob/main/CONTRIBUTING.md) where you can learn more about how you can help the project out!

If you want to reach out the dev team/ask some questions, feel free to DM femboy#6116 on Discord (we aren't big enough to need our own Discord server yet...)

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


## How to use accounts and login to WarsWorld as a dev

This is more advanced, still in the works, and is NOT necessary for development.

Directions for Github Account:

1 - Open Github, click your icon, and choose ```settings```

2 - Scroll down the options on the left panel and click ```Developer Settings```

3 - It will bring you to a new page, again on the left click ```OAuth Apps```

4 - Click ```New OAuth App```

5 - Fill in an Application Name, set the Homepage to ```http://localhost:3000```

6 - Set the Authorization Callback URL to ```http://localhost:3000/api/auth/callback/github```

7 - Click Register application and open the app

8 - You're given your Github Client ID, copy that and add to your ```.env```

9 - On the Github page, click ```Generate a new client secret```

10 - Copy this and paste it into ```.env``` as your Github Client Secret. All Done!


## Our Tech Stack's Features

- 🧙‍♂️ E2E type safety with [tRPC](https://trpc.io)
- 🖼️ [Tailwind CSS](https://tailwindcss.com/) for easy consistent styling
- ⚡ Full-stack React with Next.js
- ⚡ WebSockets / Subscription support
- ⚡ Database with Prisma
- 🔐 Authorization using [next-auth](https://next-auth.js.org/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
