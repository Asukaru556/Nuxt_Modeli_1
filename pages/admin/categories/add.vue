<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6">Добавление категории</div>
      <button class="btn-primary" @click="$router.back()">
        ← Назад
      </button>
    </div>

    <form @submit.prevent="onSubmit" class="custom-form q-gutter-md">
      <div class="input-group">
        <label class="label-hint">Название</label>
        <input 
          v-model="form.name" 
          type="text" 
          class="custom-input"
          placeholder="Название категории" 
          required 
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-actions q-mt-md">
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button type="button" class="btn-flat q-ml-sm" @click="onReset" :disabled="isSubmitting">
          Очистить
        </button>
      </div>
      
      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ICategory } from '~/types'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = ref<Omit<ICategory, 'id'>>({
  name: ''
})

function onReset() {
  form.value.name = ''
  errorMessage.value = ''
}

async function onSubmit() {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: { name: form.value.name },
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
    
    await router.push('/admin/categories')
  } catch (error: any) {
    console.error('Save error details:', error.data)
    
    errorMessage.value = error.data?.statusMessage || 'Ошибка при сохранении'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.q-pa-md { padding: 16px; }
.q-mb-md { margin-bottom: 16px; }
.q-mt-md { margin-top: 16px; }
.q-ml-sm { margin-left: 8px; }
.row { display: flex; flex-direction: row; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.text-h6 { font-size: 1.25rem; font-weight: 500; }

.custom-form { max-width: 100%; }

.input-group { display: flex; flex-direction: column; gap: 4px; }
.label-hint { font-size: 14px; color: #666; }

.custom-input {
  width: 100%;
  padding: 12px;
  background: #eceff1;
  border: none;
  border-bottom: 1px solid #666;
  border-radius: 4px 4px 0 0;
  font-size: 16px;
}

.hint-text { font-size: 12px; color: #757575; margin-top: 4px; }

.btn-primary {
  background-color: #1976d2; 
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 14px;
}

.btn-primary:disabled { background-color: #bbdefb; }

.btn-flat {
  background: transparent;
  color: #1976d2;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  text-transform: uppercase;
}

.error-msg { color: #d32f2f; margin-top: 16px; font-size: 14px; }
</style>