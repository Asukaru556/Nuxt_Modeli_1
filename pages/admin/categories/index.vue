<template>
  <div class="admin-page">
    <div class="header-section">
      <h1 class="page-title">Категории</h1>
      <button class="add-btn" @click="$router.push('/admin/categories/add')">
        <span class="icon">+</span>
        Создать новую категорию
      </button>
    </div>

    <div class="list-wrapper">
      <div v-if="pending" class="status-msg">Загрузка данных...</div>
      
      <div v-else-if="categories && categories.length > 0">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          class="cat-item"
          @click="$router.push(`/admin/categories/${category.id}`)"
        >
          <div class="index">#{{ index + 1 }}</div>
          <div class="title">{{ category.name }}</div>
          <div class="actions">
            <button class="delete-btn" @click.stop="onDelete(category.id)">
              &times;
            </button>
          </div>
        </div>
      </div>

      <div v-else class="status-msg">Категорий пока нет.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICategory } from '~/types'

const { data: categories, refresh, pending } = await useFetch<ICategory[]>('/api/categories')

async function onDelete(id: number) {
  if (confirm('Удалить категорию?')) {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await refresh()
  }
}

definePageMeta({ layout: 'admin' })
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
}
.cat-item:hover { background-color: #b1d0ec96; }

.index { color: #888; width: 40px; }
.title { flex: 1; font-weight: 500; }

.delete-btn {
  background: #333; color: white; border: none;
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; line-height: 1;
}
.delete-btn:hover { background: #000; }
.status-msg { text-align: center; padding: 3rem; color: #666; }
</style>