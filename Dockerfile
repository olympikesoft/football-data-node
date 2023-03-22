FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app source code to the container
COPY . .

# Copy the SQL file to the container
COPY footballdata.sql /docker-entrypoint-initdb.d/

# Set environment variables for the app and MySQL
ENV NODE_ENV production
ENV MYSQL_DATABASE footballdata
ENV MYSQL_USER  futtebolgogo
ENV MYSQL_PASSWORD futtebolgogoFelix@
ENV MYSQL_PORT 3306
ENV MYSQL_HOST mysql
ENV secret supersecretkeysss
ENV DISCORD_CLIENT_ID 1076096752660258836
ENV DISCORD_CLIENT_SECRET 0VDEMNwogfgf-lhl6m2A552C9A7QtAGM
ENV PORT 8081

# Expose the port that the app will listen on
EXPOSE 8081

# Update and upgrade the package manager, then install MySQL and its client without cache
RUN apk update && \
    apk upgrade && \
    apk add --no-cache mysql mysql-client && \
    mkdir /run/mysqld && \
    chown mysql:mysql /run/mysqld

# Start MySQL service and create database and table
RUN mysqld --user=mysql --skip-networking --skip-grant-tables --skip-host-cache --skip-name-resolve & \
    sleep 5s && \
    mysql -u${MYSQL_USER} -e "CREATE DATABASE footballdata;" && \
    mysql -u${MYSQL_USER} footballdata < /docker-entrypoint-initdb.d/footballdata.sql && \
    mysql -u root -e "CREATE USER 'futtebolgogo'@'%' IDENTIFIED BY 'futtebolgogoFelix@';" && \
    mysql -u root -e "GRANT ALL PRIVILEGES ON footballdata.* TO 'futtebolgogo'@'%';" && \
    mysql -u root footballdata < /docker-entrypoint-initdb.d/footballdata.sql && \
    mysqladmin shutdown

# Set the command to start the app
CMD ["sh", "-c", "${MYSQL_HOST}:${MYSQL_PORT} -t 60 -- mysqld --user=mysql --skip-networking --skip-grant-tables --skip-host-cache --skip-name-resolve & sleep 5s && node ./bin/www"]
