FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BACKEND=http://localhost:2000
ARG NEXT_PUBLIC_API_URL=http://localhost:2000/api
ARG API_INTERNAL_URL=http://backend:2000/api
ENV NEXT_PUBLIC_API_BACKEND=$NEXT_PUBLIC_API_BACKEND
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production
FROM node:22-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_BACKEND=http://localhost:2000
ARG NEXT_PUBLIC_API_URL=http://localhost:2000/api
ARG API_INTERNAL_URL=http://backend:2000/api
ENV NEXT_PUBLIC_API_BACKEND=$NEXT_PUBLIC_API_BACKEND
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]
