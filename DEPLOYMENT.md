# 🚀 Инструкция по развертыванию Stvol Garden

## Вариант 1: Быстрое развертывание (Рекомендуется)

### Backend на Railway

1. **Зарегистрируйтесь на [Railway.app](https://railway.app)**
2. **Подключите GitHub репозиторий**
3. **Создайте новый проект из GitHub**
4. **Настройте переменные окружения:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://... (Railway предоставит)
   JWT_SECRET=your-super-secret-key
   ```

### Frontend на Vercel

1. **Зарегистрируйтесь на [Vercel.com](https://vercel.com)**
2. **Подключите GitHub репозиторий**
3. **Импортируйте проект**
4. **Настройте переменные окружения:**
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
5. **Установите Root Directory: `frontend`**

## Вариант 2: Развертывание с Docker

### Используя Railway

1. **Создайте Dockerfile в корне проекта**
2. **Подключите к Railway**
3. **Railway автоматически соберет и развернет**

### Используя Render

1. **Зарегистрируйтесь на [Render.com](https://render.com)**
2. **Создайте новый Web Service**
3. **Подключите GitHub репозиторий**
4. **Настройте:**
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
   - Environment: Node

## Вариант 3: VPS развертывание

### Подготовка сервера

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установить PM2
sudo npm install -g pm2

# Установить Nginx
sudo apt install nginx -y
```

### Развертывание

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/stvol-garden.git
cd stvol-garden

# Установить зависимости
cd backend && npm install
cd ../frontend && npm install

# Собрать приложения
cd ../backend && npm run build
cd ../frontend && npm run build

# Запустить backend
cd ../backend && pm2 start dist/main.js --name stvol-backend

# Настроить Nginx
sudo nano /etc/nginx/sites-available/stvol-garden
```

### Конфигурация Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/stvol-garden/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Переменные окружения

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

## Проверка развертывания

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. **Frontend доступность:**
   - Откройте https://your-frontend-domain.com
   - Проверьте консоль браузера на ошибки

3. **API тестирование:**
   ```bash
   curl https://your-backend-domain.com/api/balance
   curl https://your-backend-domain.com/api/wheel/config
   ```

## Мониторинг

### PM2 (для VPS)
```bash
pm2 status
pm2 logs stvol-backend
pm2 monit
```

### Railway
- Используйте встроенный мониторинг Railway
- Проверяйте логи в Dashboard

### Vercel
- Используйте Vercel Analytics
- Проверяйте функции в Dashboard

## Обновление

### Автоматическое (GitHub + Railway/Vercel)
- Просто сделайте push в main ветку
- Платформы автоматически пересоберут и развернут

### Ручное (VPS)
```bash
cd /path/to/stvol-garden
git pull origin main
cd backend && npm run build
pm2 restart stvol-backend
cd ../frontend && npm run build
sudo systemctl reload nginx
```

## Безопасность

1. **Используйте HTTPS** (Let's Encrypt для VPS)
2. **Настройте CORS** правильно
3. **Используйте сильные секреты**
4. **Регулярно обновляйте зависимости**
5. **Настройте мониторинг**

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Проверьте переменные окружения
3. Убедитесь, что все сервисы запущены
4. Проверьте сетевые настройки
