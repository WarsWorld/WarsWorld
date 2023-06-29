# https://github.com/devcontainers/features/tree/main/src/node#using-nvm-from-postcreatecommand-or-another-lifecycle-command
. ${NVM_DIR}/nvm.sh
nvm install 18.16.1
# Copy env configuration
cp .devcontainer/.env.devcontainer .env
# Setup env
npm ci
npm run initialise-devcontainer
