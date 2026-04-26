# Keep in sync with NODE_VERSION in netlify.toml build.environment
FROM node:24.13.0-bookworm

# Keep in sync with NPM_VERSION in netlify.toml build.environment
RUN npm install -g npm@11.8.0

RUN corepack enable && corepack prepare yarn@stable --activate
