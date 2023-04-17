# Contributing
Before anything else, thanks for considering contributing to Wars World, its thanks to people like you that AW community can grow and continue to enjoy this beautiful game. Also, contributing doesn't mean you make a commitment to us, we have a philosophy where open source devs are free to come and go as they wish. Whether you just want to implement your move planner feature or become part of the team, we welcome you!

### Where do I go from here?

You can either look up what needs to be done in our [issues](https://github.com/WarsWorld/WarsWorld/issues) or check out our [project boards](https://github.com/WarsWorld/WarsWorld/projects) and pick up something you'd like to work on!

If you've noticed a bug or have a new feature request, [make an issue for it](https://github.com/WarsWorld/WarsWorld/issues/new)! It's
generally best if you get confirmation of your bug or approval for your feature
request this way before starting to code. 

Also if you aren't a developer, you can still contribute as an artist or even as a CodeTriage! Wars World has a space for everyone that wants to put their part in the AW community.

### Fork & create a branch

If the issue/feature you chose is something you think you can fix, then fork WarsWorld and create a branch with a descriptive name so you can start working on it! (Or if you are an inner collaborator, you can just make a new branch inside WarsWorld!)

A good branch name would be descriptive of what you are working for, for example if its an update to the mobile navbar, it could be mobile-navbar-update. 

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
## RoadMap / Vision
Currently the project intends to recreate AWBW but with 2023 technology. Meaning we want to have a live league that works smoothly, a hot from the oven UI/UX thats reponsive and streamlines games, being able to look at multiple games at the same time, having a much faster website/not having lag, etc.

However, AWBW has a lot of parts to it, so we decided that for now, our scope is delivering a live league queue. We want to avoid direct competition with AWBW for as far as we can and creating one gamemode and one queue initially is a good scope for the project to start. Later on we can add new gamemodes such as fog, custom CO/skills, etc.

We do not have plans on remaking AW or making our own game/version of it, we want to stay close to what AWBW has accomplished because this project is made by AWBW players that want to play the game on a modern avenue.

[Come see our upcoming projects!](https://github.com/WarsWorld/WarsWorld/projects)

### Contact Information
Currently we do not have a Discord server/Slack/Zulip chat (we do have a private Discord group chat!), so if you want to contact the lead of the project, you can send a DM to femboy#6116. 
