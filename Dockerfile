FROM node:lts-alpine

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the SQL file to the container
COPY footballdata.sql /docker-entrypoint-initdb.d/

# Set environment variables for the app
ENV NODE_ENV production
ENV MYSQL_DATABASE footballdata
ENV MYSQL_USER  futtestolyio
ENV MYSQL_PASSWORD futtestolyiosoccer2020A@
ENV MYSQL_HOST localhost

# Expose the port that the app will listen on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
