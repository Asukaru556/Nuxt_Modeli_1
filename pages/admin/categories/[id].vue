<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6">Редактирование категории</div>
      <button class="btn-primary" @click="$router.push('/admin/categories')">
        ← Назад
      </button>
    </div>

    <ClientOnly>
      <div v-if="pending" class="status-msg">Загрузка данных...</div>

      <form v-else-if="form" @submit.prevent="onSubmit" class="custom-form q-gutter-md">
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
            {{ isSubmitting ? 'Сохранение...' : 'Обновить' }}
          </button>
          <button type="button" class="btn-danger q-ml-sm" @click="onDelete" :disabled="isSubmitting">
            Удалить
          </button>
          <button type="button" class="btn-flat q-ml-sm" @click="onReset" :disabled="isSubmitting">
            Очистить
          </button>
        </div>
        
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>

      <div v-else class="status-msg">Данная категория не найдена</div>

      <template #fallback>
        <div class="status-msg">Инициализация...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ICategory } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const { data: category, pending } = await useFetch<ICategory>(`/api/categories/${route.params.id}`, {
  headers: useRequestHeaders(['cookie']) as Record<string, string>
})

const form = ref<ICategory | null>(null)

watch(category, (newVal) => {
  if (newVal) form.value = JSON.parse(JSON.stringify(newVal))
}, { immediate: true })

async function onSubmit() {
  if (!form.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    await $fetch(`/api/categories/${route.params.id}`, {
      method: 'PATCH',
      body: { name: form.value.name },
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
    await router.push('/admin/categories')
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Ошибка при обновлении'
  } finally {
    isSubmitting.value = false
  }
}

async function onDelete() {
  if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    await $fetch(`/api/categories/${route.params.id}`, {
      method: 'DELETE',
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
    await router.push('/admin/categories')
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Ошибка при удалении'
  } finally {
    isSubmitting.value = false
  }
}

function onReset() {
  if (form.value) form.value.name = ''
}
</script>

<style scoped>
.q-pa-md { padding: 16px; }
.q-mb-md { margin-bottom: 16px; }
.q-mt-md { margin-top: 16px; }
.q-ml-sm { margin-left: 8px; }
.row { display: flex; justify-content: space-between; align-items: center; }
.text-h6 { font-size: 1.25rem; font-weight: 500; }

.input-group { display: flex; flex-direction: column; gap: 4px; }
.custom-input {
  width: 100%;
  padding: 12px;
  background: #eceff1;
  border: none;
  border-bottom: 1px solid #666;
  border-radius: 4px 4px 0 0;
  font-size: 16px;
}
.label-hint { font-size: 14px; color: #666; }

.btn-primary {
  background-color: #1976d2;
  color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;
}
.btn-danger {
  background-color: #d32f2f;
  color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;
}
.btn-flat {
  background: transparent;
  color: #1976d2; border: none; padding: 8px 16px; cursor: pointer;
}
.error-msg { color: #d32f2f; margin-top: 16px; font-weight: 500; }
.status-msg { text-align: center; padding: 2rem; color: #666; }
</style>