![coverBig](https://github.com/WarsWorld/WarsWorld/assets/96269542/12c971ba-8d27-4a17-9de1-cd60db3c7e82)

# Wars World

Wars World is an open source project made by AWBW players that want to recreate [Advance Wars By Web/AWBW](https://awbw.amarriner.com/), on a modern tech stack so we can all enjoy playing the game we love on a streamlined, blazingly fast, venue that keeps all the stuff we love plus new desperately needed features!

This repository contains the backend and frontend code and is based on this [starter template](https://github.com/trpc/examples-next-prisma-websockets-starter).

## Interested in contributing/helping?

Here are our [Contribution Guidelines](https://github.com/WarsWorld/WarsWorld/blob/main/CONTRIBUTING.md) where you can learn more about how you can help the project out!

If you want to reach out the dev team/ask some questions, feel free to [join our Discord server!](https://discord.gg/9cgTs5ZGT2)


# Setting up your local environment

To make sure our project is able to run locally, follow these 6 easy steps!

1 - Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and run it (the Docker daemon is needed to run your local database, so all need is to have the app running in the background. Nothing else!).

2 - Make sure you have [node installed](https://nodejs.org/en/download) and the version is recent. version ^18.15.0 is recommended

3 - Clone the repository in your own working environment or IDE.

4 - Copy the "env.example" to ".env" and setup a random password/string in the PGPASSWORD and NEXTAUTH_SECRET fields.

5 - Install the dependencies from package.json and run app using the following code:

```
npm install
npm run initialise // only run this once! Everytime it runs, it re-seeds the database.
npm run dev
```

If you see ```Error: P1001: Can't reach database server at `localhost`:`5932` ```, just re-run ```npm run initialise```

Now go to localhost:3000 and you should be set! If you are having issues, feel free to contact someone in the team!

# My local setup isn't working!
If you are having troubleshotting issues, here are some clear steps to help you get back on track.

1 - Make sure Docker Desktop is running on the background.

2 - Run the ```npm i``` to install any missing dependencies.

3 - Run ```npm run db:destroy``` to clear the docker container (and therefore the database as well).

4 - Run ```npm initialise``` to re-create the docker container and seed the database. You might see the error 
```Error: P1001: Can't reach database server at `localhost`:`5932` ```
Ignore it, just re-run npm initialise.

5 - Make sure node, npm, git, and docker desktop are all installed properly. Also make sure you copy the "env.example" file to ".env" and setup a random password/string in the PGPASSWORD and NEXTAUTH_SECRET fields.



# Where is the database? How can we see it?

To see the contents of the db all you need to is run ```prisma studio``` or ```npm run prisma:studio```, this should immediatly send you to localhost:5555 and show you the database!

![image](https://github.com/WarsWorld/WarsWorld/assets/96269542/e6cd369a-026a-4f65-b2fa-c8fb7752ab1a)
## Our Tech Stack's Features

- 🧙‍♂️ E2E type safety with [tRPC](https://trpc.io)
- 🖼️ [Tailwind CSS](https://tailwindcss.com/) for easy consistent styling
- ⚡ Full-stack React with Next.js
- ⚡ WebSockets / Subscription support
- ⚡ Database with Prisma
- 🔐 Authorization using [next-auth](https://next-auth.js.org/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier
