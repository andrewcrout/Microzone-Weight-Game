FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/sprint-manager-spa/package*.json ./
RUN npm install

COPY frontend/sprint-manager-spa/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY frontend/sprint-manager-spa/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sprint-manager-spa/browser /usr/share/nginx/html
EXPOSE 80
