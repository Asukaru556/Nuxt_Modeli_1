<template>
  <div class="login-container">
    <form @submit.prevent="handleRegister" class="login-card">
      <h2>Регистрация</h2>
      
      <div class="field">
        <input 
          v-model="form.email" 
          type="email" 
          placeholder="Email" 
          :class="{ 'bad': errors.email }"
          @input="errors.email = ''"
        />
        <span v-if="errors.email" class="err">{{ errors.email }}</span>
      </div>
      
      <div class="field">
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Пароль" 
          :class="{ 'bad': errors.password }"
          @input="errors.password = ''"
        />
        <span v-if="errors.password" class="err">{{ errors.password }}</span>
      </div>
      
      <div class="field">
        <input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="Повторите пароль" 
          :class="{ 'bad': errors.confirmPassword }"
          @input="errors.confirmPassword = ''"
        />
        <span v-if="errors.confirmPassword" class="err">{{ errors.confirmPassword }}</span>
      </div>

      <button :disabled="loading" type="submit">
        {{ loading ? 'Создание...' : 'Зарегистрироваться' }}
      </button>

      <div class="footer-link">
        <NuxtLink to="/auth/login">Уже есть аккаунт? Войти</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { isValidEmail, isValidPassword } from '@/utils/validator'

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const router = useRouter()

async function handleRegister() {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  let hasError = false

  if (!isValidEmail(form.email)) {
    errors.email = 'Некорректный формат email'
    hasError = true
  }

  if (!isValidPassword(form.password)) {
    errors.password = 'Минимум 4 символа без пробелов'
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
    hasError = true
  }

  if (hasError) return

  loading.value = true
  try {
    // 1. Только регистрируем пользователя
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })

    // 2. СРАЗУ перенаправляем на логин с параметром
    // Мы НЕ вызываем здесь логин и НЕ сохраняем куки
    await navigateTo('/auth/login?registered=true')
    
  } catch (e) {
    if (e.data?.statusMessage?.includes('email')) {
      errors.email = 'Этот email уже используется'
    } else {
      alert(e.data?.statusMessage || 'Ошибка при регистрации')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 350px;
}

h2 {
  margin: 0 0 10px 0;
  text-align: center;
  color: #1e293b;
}

.field {
  display: flex;
  flex-direction: column;
  min-height: 65px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline-color: #3b82f6;
  transition: border-color 0.2s;
}

input.bad {
  border-color: #ef4444;
}

.err {
  color: #ef4444;
  font-size: 12px;
  margin: 4px 0 0 5px;
}

button { 
  background: #3b82f6; 
  color: white; 
  border: none; 
  padding: 12px; 
  border-radius: 8px; 
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.footer-link {
  text-align: center;
  margin-top: 10px;
}

.footer-link a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.footer-link a:hover {
  text-decoration: underline;
}
</style>