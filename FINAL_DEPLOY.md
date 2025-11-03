# 🚀 Финальный деплой (РАБОЧИЙ)

## ✅ Что уже готово:
- Frontend на Vercel: https://stvol-one.vercel.app
- Supabase БД настроена
- Telegram бот данные есть

## 🎯 Осталось: Backend на Railway (5 минут)

### Шаг 1: Создайте GitHub репозиторий

Нужен для Railway. Выполните:

```bash
# Если еще не создали репозиторий на GitHub:
# 1. Откройте https://github.com/new
# 2. Создайте репозиторий "stvol-garden"
# 3. Затем выполните:

git remote add origin https://github.com/ВАШ_USERNAME/stvol-garden.git
git add -A
git commit -m "Ready for deploy"
git push -u origin main
```

### Шаг 2: Деплой на Railway

1. Откройте https://railway.app/new
2. **"Deploy from GitHub repo"**
3. Выберите `stvol-garden`
4. **Settings** → **Root Directory**: `backend`
5. **Variables** → добавьте:

```
DATABASE_URL=postgres://postgres.kotzcryzohzsnmrttzme:wsXMzwT5aJz58lJX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
TELEGRAM_BOT_TOKEN=8317015754:AAFE85wHeXzj1BkjsHwikXFHNxnxsgVPKVY
BOT_USERNAME=Stvol_gardenBOT
ADMIN_IDS=1802550971
JWT_SECRET=QaSwUZb4C+shZhlOJzQmUCfgrEI9Zy+jm3JkaoyiLTY=
WEBAPP_URL=https://stvol-one.vercel.app
NODE_ENV=production
```

6. **Settings** → **Networking** → **Generate Domain**
7. Скопируйте URL (например: stvol-backend.up.railway.app)

### Шаг 3: Обновите Frontend

```bash
echo 'https://ваш-railway-url.up.railway.app' | npx vercel env add VITE_API_URL production
cd frontend && npx vercel --prod --yes
```

### Шаг 4: Настройте Telegram Bot

@BotFather → /newapp:
- Бот: @Stvol_gardenBOT
- URL: https://stvol-one.vercel.app

✅ ГОТОВО! Работает!

