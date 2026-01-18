FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
