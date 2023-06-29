# https://github.com/devcontainers/features/tree/main/src/node#using-nvm-from-postcreatecommand-or-another-lifecycle-command
. ${NVM_DIR}/nvm.sh
nvm install 18.16.1
# Install debian dependencies
# They are all needed for pixijs -> canvas -> headless-gl dependencies
# https://github.com/Automattic/node-canvas/issues/1065#issuecomment-654706161
apt update && apt -y upgrade
apt install -y pkg-config libpixman-1-dev libcairo2-dev libpango1.0-dev libgif-dev python-is-python3
# Copy env configuration
cp .devcontainer/.env.devcontainer .env
# Setup env
npm install
npm run initialise-devcontainer
