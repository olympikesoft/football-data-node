FROM node:lts-alpine

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

COPY ./bin/www ./bin/www

COPY . .

# Set environment variables for the app
ENV NODE_ENV production
ENV MYSQL_DATABASE footballdata
ENV MYSQL_USER  sgroot
ENV MYSQL_PASSWORD kTEnc6v-MyY81OFb@
ENV MYSQL_PORT 3306
ENV MYSQL_HOST SG-bird-handle-7872-7413-mysql-master.servers.mongodirector.com
ENV secret supersecretkey
ENV DISCORD_CLIENT_ID 1076096752660258836
ENV DISCORD_CLIENT_SECRET 0VDEMNwogfgf-lhl6m2A552C9A7QtAGM
ENV PORT 8081

EXPOSE 8081

CMD ["node", "./bin/www"]
