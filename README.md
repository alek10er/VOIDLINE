# VOIDLINE

Темная, мобильная и анимированная страница входа с подключением к Supabase.

## Что реализовано

- Вход через `supabase.auth.signInWithPassword`.
- Темный контрастный UI (белый текст на черном фоне) + мягкие анимации загрузки.
- Аккуратное уведомление после клика входа: «Все аккаунты делаются на заказ — войдите в свой аккаунт.»
- Анти-спам на клиенте: кнопка блокируется во время запроса + короткий cooldown после неуспешного входа.
- После успешного входа показывается черный full-screen экран с белым текстом «Вход успешен» и данными из БД: имя, фамилия, логин.
- SQL-скрипт для Supabase: `supabase-schema.sql` (включая тестового пользователя).

## Запуск локально

```bash
python3 -m http.server 4173
```

Откройте: `http://localhost:4173`.

## Настройка Supabase

По умолчанию в `app.js` стоят заглушки:

- `YOUR_SUPABASE_URL`
- `YOUR_SUPABASE_ANON_KEY`

Перед деплоем замените их через `window`-переменные в `index.html` перед `app.js`:

```html
<script>
  window.SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
  window.SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';
</script>
```

## SQL для Supabase

1. Откройте Supabase Dashboard → SQL Editor.
2. Вставьте содержимое `supabase-schema.sql`.
3. Выполните скрипт.

Скрипт создаёт тестового пользователя (для dev/staging):

- Email: `test@voidline.dev`
- Password: `VoidlineTest123!`

## Deploy на Render.com

### Вариант 1 (рекомендуется): Static Site

- **Build Command:** *(пусто)*
- **Start Command:** *(не нужен для Static Site)*
- **Publish Directory:** `.`

### Вариант 2: Web Service

Если нужен именно `Start Command`, создайте **Web Service** и укажите:

- **Build Command:** `echo "No build step"`
- **Start Command:** `python3 -m http.server $PORT`

После деплоя проверьте, что `SUPABASE_URL` и `SUPABASE_ANON_KEY` подставлены в `index.html`.
