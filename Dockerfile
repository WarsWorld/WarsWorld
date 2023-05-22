FROM node:18.15
COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
COPY . /app/
