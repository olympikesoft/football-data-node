FROM node:lts-alpine

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

COPY ./bin/www ./bin/www

# Install the app dependencies
RUN npm install

# Copy the SQL file to the container
COPY footballdata.sql /docker-entrypoint-initdb.d/

COPY . .

# Set environment variables for the app
ENV NODE_ENV production
ENV MYSQL_DATABASE footballdata
ENV MYSQL_USER  futtestolyio
ENV MYSQL_PASSWORD futtestolyiosoccer2020A@
ENV MYSQL_PORT 3306
ENV MYSQL_HOST mysql
ENV secret supersecretkey
ENV DISCORD_CLIENT_ID 1076096752660258836
ENV DISCORD_CLIENT_SECRET 0VDEMNwogfgf-lhl6m2A552C9A7QtAGM
ENV PORT 8081

# Expose the port that the app will listen on
EXPOSE 8081

# Start MySQL service and create database and table
RUN apk update && \
    apk upgrade && \
    apk add --no-cache mysql mysql-client && \
    mkdir /run/mysqld && \
    chown mysql:mysql /run/mysqld && \
    /etc/init.d/mariadb setup && \
    /etc/init.d/mariadb start && \
    mysql -uroot -e "CREATE DATABASE footballdata;" && \
    mysql -uroot futtestolyio < /docker-entrypoint-initdb.d/footballdata.sql && \
    /etc/init.d/mariadb stop

# Start the app
CMD [ "node", "./bin/www" ]
