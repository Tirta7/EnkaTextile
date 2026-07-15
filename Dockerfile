FROM node:22-alpine

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json for all packages
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/tmcpos/package.json ./artifacts/tmcpos/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/db/package.json ./lib/db/

# Install dependencies
RUN pnpm install

# Copy rest of the source code
COPY . .

# Build all workspace packages except mockup-sandbox which is not needed for prod
RUN pnpm -r --filter=!@workspace/mockup-sandbox run build

# Expose backend port
EXPOSE 8080

# Set working directory to root for pnpm to find workspaces, but run api-server explicitly
WORKDIR /app

# Start the server directly after pushing schema changes to the database
CMD ["sh", "-c", "pnpm -F @workspace/db run push && cd /app/artifacts/api-server && node ./dist/index.mjs"]
