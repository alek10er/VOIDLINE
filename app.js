const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const form = document.getElementById('login-form');
const submitButton = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');
const toast = document.getElementById('toast');
const overlay = document.getElementById('success-overlay');
const profileOutput = document.getElementById('profile-output');

const clientReady =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

const supabase = clientReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

let cooldownUntil = 0;
let activeToastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(activeToastTimer);
  activeToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle('loading', isLoading);
  submitButton.querySelector('.btn-label').textContent = isLoading
    ? 'Проверка...'
    : 'Войти';
}

function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? 'var(--danger)' : 'var(--text-muted)';
}

function validateCooldown() {
  const now = Date.now();
  if (now < cooldownUntil) {
    const left = Math.ceil((cooldownUntil - now) / 1000);
    updateStatus(`Подождите ${left} сек. перед новой попыткой.`, true);
    return false;
  }
  return true;
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name,last_name,username')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error('Не удалось получить данные профиля.');
  }

  return data;
}

function showSuccess(profile) {
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  const safeData = [
    `Имя: ${profile.first_name || 'не указано'}`,
    `Фамилия: ${profile.last_name || 'не указано'}`,
    `Логин: ${profile.username || 'не указан'}`,
  ];
  profileOutput.textContent = safeData.join(' · ');
}

if (!clientReady) {
  updateStatus('Укажите SUPABASE_URL и SUPABASE_ANON_KEY в app.js или через window-переменные.', true);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!clientReady || !supabase) {
    return;
  }

  if (!validateCooldown()) {
    return;
  }

  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    updateStatus('Введите email и пароль.', true);
    return;
  }

  setLoading(true);
  updateStatus('Идет защищенная проверка данных...');

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      cooldownUntil = Date.now() + 3000;
      throw new Error('Проверьте email/пароль и повторите попытку.');
    }

    showToast('Все аккаунты делаются на заказ — войдите в свой аккаунт.');

    const profile = await fetchProfile(authData.user.id);
    showSuccess(profile);
    updateStatus('Авторизация выполнена успешно.');
  } catch (error) {
    updateStatus(error.message, true);
  } finally {
    setLoading(false);
  }
});
