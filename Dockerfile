# Stage 1: Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application using the environment file (like .env.staging)
RUN npm run build

RUN apt-get update && apt-get install -y openssh-server

RUN useradd -rm -d /home/neuon -s /bin/bash -g root -G sudo -u 1000 neuon
RUN echo 'neuon:jason2024' | chpasswd
RUN apt-get -y install sudo
RUN apt-get -y install nano
RUN adduser neuon sudo
RUN mkdir /var/run/sshd
EXPOSE 22

# RUN apt-get install -y dos2unix
# COPY entrypoint.sh /usr/local/bin/entrypoint.sh
# RUN dos2unix /usr/local/bin/entrypoint.sh
# RUN chmod +x /usr/local/bin/entrypoint.sh
# ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]


# Stage 2: Production Stage (Nginx to serve the built application)
# FROM nginx:latest
# WORKDIR /usr/share/nginx/html

# # Remove default Nginx static files
# RUN rm -rf ./*

# # Copy the build files from the dist directory
# COPY --from=builder /app/dist/ .
# Expose port 5173

EXPOSE 5173  
# entrypoint.sh
# Start the SSH daemon
CMD [ "/usr/sbin/sshd", "&", "npm", "run", "dev"]

# Start Nginx in the foreground
# CMD ["nginx", "-g", "daemon off;"]