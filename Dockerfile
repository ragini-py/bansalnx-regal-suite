# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Build arguments for Vite compilation
ARG VITE_API_URL=/api
ARG VITE_RAZORPAY_KEY_ID=rzp_test_dummy_key_id

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Production web server stage
FROM nginx:alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
