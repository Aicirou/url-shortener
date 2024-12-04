# Stage 1: Build
FROM alpine:3.20.0 AS development

# Install Node.js and npm
RUN apk add --update nodejs="20.18.1" npm="10.8.2"

# Setup working directory and environment
WORKDIR /home/alter_user/url-shortener
COPY package*.json tsconfig*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source and build
COPY ./src ./src
RUN npm run build

# Stage 2: Production
FROM alpine:3.20.0 AS production

# Environment configuration
ENV NODE_ENV=production
WORKDIR /home/alter_user/url-shortener

# Add production user
RUN addgroup -g 1005 -S alter_user \
    && adduser -u 1005 -h /home/alter_user -s /bin/sh -G alter_user -S alter_user

# Copy built files from development stage
COPY --from=development /home/alter_user/url-shortener/dist ./dist
COPY --from=development /home/alter_user/url-shortener/node_modules ./node_modules

# Switch to non-root user
USER alter_user

# Run the application
CMD ["node", "dist/main.js"]
