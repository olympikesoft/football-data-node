FROM node:lts-alpine

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the SQL file to the container
COPY footballdata.sql /docker-entrypoint-initdb.d/

COPY ./bin/www ./bin/www

COPY . .

# Set environment variables for the app
ENV NODE_ENV production
ENV MYSQL_DATABASE footballdata
ENV MYSQL_USER  futtebolgogo
ENV MYSQL_PASSWORD futtebolgogoFelix@
ENV MYSQL_PORT 3306
ENV MYSQL_HOST localhost
ENV secret supersecretkey
ENV DISCORD_CLIENT_ID 1076096752660258836
ENV DISCORD_CLIENT_SECRET 0VDEMNwogfgf-lhl6m2A552C9A7QtAGM
ENV PORT 8081

EXPOSE 8081

CMD ["node ./bin/www"]
