# Использование официального образа Node.js
FROM node:16-alpine

# Установка рабочей директории приложения в контейнере
WORKDIR /app

# Копирование package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Установка зависимостей приложения
RUN npm ci

# Копирование всех файлов приложения в рабочую директорию
COPY . .

# Установка переменных окружения для бота
ENV PORT=3000

EXPOSE $PORT

# Команда для запуска приложения в контейнере
CMD [ "npm", "run", "prod" ]
