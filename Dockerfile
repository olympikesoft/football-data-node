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

# Expose the port that the app will listen on
EXPOSE 8081

# Install MySQL client and server
RUN apk update && \
    apk upgrade && \
    apk add --no-cache mysql mysql-client && \
    mkdir /run/mysqld && \
    chown mysql:mysql /run/mysqld

# Start MySQL service and create database and table
RUN mysqld --user=mysql --skip-ssl && \
    mysqld --user=mysql --skip-networking & \
    sleep 5s && \
    mysql -u root -e "CREATE USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';" && \
    mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER}'@'%' WITH GRANT OPTION;" && \
    mysql -u root -e "FLUSH PRIVILEGES;" && \
    mysql -u${MYSQL_USER} -e "CREATE DATABASE footballdata;" && \
    mysql -u${MYSQL_USER} footballdata < /docker-entrypoint-initdb.d/footballdata.sql && \
    mysqladmin shutdown && \
    sed -i 's/^skip-networking/#skip-networking/' /etc/my.cnf.d/mariadb-server.cnf

CMD ["sh", "-c", "mysqld --user=mysql & sleep 5s && node ./bin/www"]
