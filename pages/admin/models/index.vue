<template>
  <div class="admin-page">
    <div class="header-section">
      <h1 class="page-title">Модели</h1>
      <button class="add-btn" @click="$router.push('/admin/models/add')">
        <span class="icon">+</span>
        Добавить модель
      </button>
    </div>

    <div class="filter-section q-mb-md">
      <select v-model="selectedCategoryId" class="custom-select">
        <option :value="null">Все категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="list-wrapper">
      <ClientOnly>
        <div v-if="pending" class="status-msg">Загрузка данных...</div>
        
        <div v-else-if="localModels && localModels.length > 0">
          <draggable 
            v-model="localModels" 
            item-key="id" 
            handle=".drag-handle"
            @end="onDragEnd"
          >
            <template #item="{ element: model, index }">
              <div 
                class="cat-item" 
                @click="$router.push(`/admin/models/${model.id}`)"
              >
                <div class="drag-handle">⠿</div>
                <div class="index">#{{ index + 1 }}</div>

                <div class="thumb-wrapper">
                  <img v-if="model.image_path" :src="model.image_path" class="thumb" />
                  <div v-else class="no-thumb">No img</div>
                </div>

                <div class="title-group">
                  <div class="title">{{ model.title }}</div>
                  <div class="subtitle">{{ model.price ? model.price.toLocaleString() + ' ₽' : 'Цена не указана' }}</div>
                </div>

                <div class="status-badge" :class="{ 'active': model.is_active }">
                  {{ model.is_active ? 'Активна' : 'Скрыта' }}
                </div>

                <div class="actions">
                  <button class="delete-btn" @click.stop="confirmDelete(model.id)">
                    &times;
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div v-else class="status-msg">Моделей пока нет.</div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { IModel, ICategory } from '~/types'

definePageMeta({ layout: 'admin' })

const selectedCategoryId = ref<number | null>(null)
const localModels = ref<IModel[]>([])
const errorMessage = ref('')

const { data: categories } = await useFetch<ICategory[]>('/api/categories')

const { data: allModels, pending, refresh } = await useFetch<IModel[]>('/api/models', {
  headers: useRequestHeaders(['cookie']) as Record<string, string>
})

const filteredModels = computed(() => {
  if (!allModels.value) return []
  let result = [...allModels.value]
  if (selectedCategoryId.value !== null) {
    result = result.filter(m => m.category_id === selectedCategoryId.value)
  }
  return result.sort((a, b) => (a.position || 0) - (b.position || 0))
})

watch(filteredModels, (val) => {
  localModels.value = JSON.parse(JSON.stringify(val))
}, { immediate: true })

async function onDragEnd() {
  localModels.value.forEach((m, idx) => m.position = idx + 1)
  try {
    await $fetch('/api/models/reorder', {
      method: 'PATCH',
      body: { positions: localModels.value.map(m => ({ id: m.id, position: m.position })) },
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
  } catch (e) {
    console.error('Reorder error')
  }
}

async function confirmDelete(id: number) {
  if (confirm('Удалить модель?')) {
    await $fetch(`/api/models/${id}`, { 
      method: 'DELETE',
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
    await refresh()
  }
}
</script>

<style scoped>
.admin-page { padding: 2rem; max-width: 900px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: bold; margin: 0; }

.add-btn {
  background-color: #007bff; color: white; border: none;
  padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-weight: 500;
}
.add-btn:hover { background-color: #0056b3; }

.cat-item {
  display: flex; align-items: center; padding: 1rem;
  border-bottom: 1px solid #5adbecbd; cursor: pointer; transition: 0.2s;
  gap: 15px;
}
.cat-item:hover { background-color: #b1d0ec96; }

.drag-handle { color: #ccc; cursor: grab; font-size: 1.2rem; }
.index { color: #888; width: 30px; }

.thumb-wrapper { width: 60px; height: 45px; background: #eee; border-radius: 4px; overflow: hidden; }
.thumb { width: 100%; height: 100%; object-fit: cover; }
.no-thumb { font-size: 10px; color: #999; text-align: center; line-height: 45px; }

.title-group { flex: 1; }
.title { font-weight: 500; display: block; }
.subtitle { font-size: 0.85rem; color: #666; }

.status-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: #eee; color: #777; }
.status-badge.active { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }

.delete-btn {
  background: #333; color: white; border: none;
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; line-height: 1;
}
.delete-btn:hover { background: #000; }

.custom-select {
  padding: 0.5rem; border-radius: 6px; border: 1px solid #ddd; width: 100%; max-width: 300px;
  margin-bottom: 1rem; outline: none;
}
.status-msg { text-align: center; padding: 3rem; color: #666; }
</style>