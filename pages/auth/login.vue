<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-card">
      <h2>Вход</h2>
      
      <div class="field">
        <input 
          v-model="form.email" 
          type="text" 
          placeholder="Email" 
          :class="{ 'bad': errors.email }" 
        />
        <span v-if="errors.email" class="err">{{ errors.email }}</span>
      </div>

      <div class="field">
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="Пароль" 
          :class="{ 'bad': errors.password }"
        />
        <span v-if="errors.password" class="err">{{ errors.password }}</span>
      </div>

      <button :disabled="loading" type="submit">
        {{ loading ? 'Вхожу...' : 'Войти' }}
      </button>
      
      <div class="footer-link">
        <NuxtLink to="/auth/register">Еще нет аккаунта? Зарегистрируйтесь</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { isValidEmail, isValidPassword } from '@/utils/validator'

const form = reactive({ 
  email: '', 
  password: '' 
})

const errors = reactive({ 
  email: '', 
  password: '' 
})

const loading = ref(false)
const token = useCookie('auth_token')
const userEmail = useCookie('user_email')

async function handleLogin() {
  errors.email = ''
  errors.password = ''

  let hasError = false

  if (!isValidEmail(form.email)) {
    errors.email = 'Некорректный email'
    hasError = true
  }

  if (!isValidPassword(form.password)) {
    errors.password = 'Минимум 4 символа без пробелов'
    hasError = true
  }

  if (hasError) {
    console.log('Ошибки валидации:', errors) // Проверьте консоль браузера
    return
  }

  loading.value = true
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    
    token.value = data.token
    userEmail.value = data.email
    
    await navigateTo('/admin/models')
  } catch (e) {
    alert('Ошибка: ' + (e.data?.statusMessage || 'Неверный логин или пароль'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; }
.login-card { background: white; padding: 40px; border-radius: 12px; display: flex; flex-direction: column; gap: 15px; width: 350px; }

.field {
  display: flex;
  flex-direction: column;
  min-height: 65px;
}

h2 {
  margin: 0 0 10px 0;
  text-align: center;
  color: #1e293b;
}

input { 
  padding: 12px; 
  border: 1px solid #ddd; 
  border-radius: 8px; 
}

input.bad {
  border-color: #ef4444 !important;
}

.err {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

button { background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; }
.footer-link { text-align: center; margin-top: 10px; }
.footer-link a { color: #3b82f6; font-size: 14px; text-decoration: none; }
</style>