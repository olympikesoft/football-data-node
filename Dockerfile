FROM node:lts-alpine

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Set environment variables for the app
ENV NODE_ENV dev
ENV DB_HOST SG-bird-handle-7872-7413-mysql-master.servers.mongodirector.com
ENV DB_USER sgroot
ENV DB_PASSWORD kTEnc6v-MyY81OFb
ENV DB_NAME footballdata
ENV PORT 8081
ENV secret supersecretkey
ENV DISCORD_CLIENT_ID 1076096752660258836
ENV DISCORD_CLIENT_SECRET 0VDEMNwogfgf-lhl6m2A552C9A7QtAGM
ENV SENDGRID_API_KEY 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

EXPOSE 8081

CMD ["node", "./bin/www"]
