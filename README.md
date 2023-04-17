# Wars World

Wars World is an open source project made by AWBW players that want to recreate [Advance Wars By Web/AWBW](https://awbw.amarriner.com/), on a modern tech stack so we can all enjoy playing the game we love on a streamlined, blazingly fast, venue that keeps all the stuff we love plus new desperately needed features!

This repository contains the backend and frontend code and is based on this [starter template](https://github.com/trpc/examples-next-prisma-websockets-starter).

## Interested in contributing/helping?
Here are our [Contribution Guidelines](https://github.com/WarsWorld/WarsWorld/blob/main/CONTRIBUTING.md) where you can learn more about how you can help the project out!

If you want to reach out the dev team/ask some questions, feel free to DM femboy#6116 on Discord (we aren't big enough to need our own Discord server yet...)
## Setting up your local environment
Running our project locally just takes 5 easy steps!

1 - Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and run it/the docker daemon (needed to run your local db, you just need to have the app running in the background, nothing else!)

2 - Make sure you have [pnpm installed](https://pnpm.io/) (its like npm but faster).

3 - Clone the repository in your own IDE.

4 - Copy the "env.example" to ".env" and setup a random password/string in the PGPASSWORD and NEXTAUTH_SECRET fields.

5 - Install dependencies and run app (run code below)
```
pnpm i  //This is basically an npm i/install
pnpm dx //This is our npm start
```
Now go to localhost:3000 and you should be set! If you are having issues, feel free to contact someone in the team!

``` Soon there will be a more newb/extensive setup your local environment guide here!```

## Troubleshooting

### Building but not able to access the site?
Ensure you are using an up to date node version. ^18.15.0 is recommended.


## Our Tech Stack's Features

- 🧙‍♂️ E2E type safety with [tRPC](https://trpc.io)
- 🖼️ SCSS for customized styling
- ⚡ Full-stack React with Next.js
- ⚡ WebSockets / Subscription support
- ⚡ Database with Prisma
- 🔐 Authorization using [next-auth](https://next-auth.js.org/)
- ⚙️ VSCode extensions
- 🎨 ESLint + Prettier


### Files of note

<table>
  <thead>
    <tr>
      <th>Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
      <td><code>./public</code></td>
      <td>Where we store our public files (images, favicon, etc)</td>
    </tr>
<tr>
      <td><code>./src/pages</code></td>
      <td>Frontend/tsx pages (index, about, match)</td>
    </tr>
<tr>
      <td><code>./src/styles</code></td>
      <td>SCSS styling files</td>
    </tr>
<tr>
      <td><code>./src/components</code></td>
      <td>React components</td>
    </tr>
    <tr>
      <td><a href="./prisma/schema.prisma"><code>./prisma/schema.prisma</code></a></td>
      <td>Prisma schema</td>
    </tr>
    <tr>
      <td><a href="./src/api/trpc/[trpc].tsx"><code>./src/api/trpc/[trpc].tsx</code></a></td>
      <td>tRPC response handler</td>
    </tr>
    <tr>
      <td><a href="./src/server/routers"><code>./src/server/routers</code></a></td>
      <td>Your app's different tRPC-routers</td>
    </tr>
  </tbody>
</table>

