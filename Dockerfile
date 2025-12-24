# Stage 1: Builder
FROM apify/actor-node:22 AS builder

# Check preinstalled packages (Optional, but good for debugging)
# RUN npm ls apify

# Copy just package files first to leverage Docker cache
COPY --chown=myuser:myuser package*.json ./
COPY --chown=myuser:myuser tsconfig.json ./

# Install ALL dependencies (including devDependencies like TypeScript)
RUN npm install --include=dev --audit=false

# Copy source code
COPY --chown=myuser:myuser . ./

# Build the TypeScript code (Creates /dist folder)
RUN npm run build

# Stage 2: Production Image
FROM apify/actor-node:22

# Copy package files
COPY --chown=myuser:myuser package*.json ./

# Install only PRODUCTION dependencies (Keeps image small)
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

# Copy built JS files from the builder stage
COPY --from=builder --chown=myuser:myuser /usr/src/app/dist ./dist

# Copy any remaining files (like README or input schemas)
COPY --chown=myuser:myuser . ./

# Run the compiled JavaScript
CMD ["node", "dist/main.js"]