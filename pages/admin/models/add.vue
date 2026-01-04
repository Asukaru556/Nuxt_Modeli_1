<template>
  <div class="admin-page">
    <div class="header-section">
      <h1 class="page-title">Добавление модели</h1>
      <button class="back-btn" @click="$router.push('/admin/models')">← Назад</button>
    </div>

    <form @submit.prevent="onSubmit" class="custom-form">
      <div class="input-group">
        <label>Название *</label>
        <input 
          v-model="form.title" 
          type="text" 
          class="custom-input" 
          :class="{ 'bad-input': fieldErrors.title }"
          placeholder="Введите название модели" 
          @input="fieldErrors.title = ''"
        />
        <span v-if="fieldErrors.title" class="err-text">{{ fieldErrors.title }}</span>
      </div>

      <div class="input-group">
        <label>Описание</label>
        <textarea 
          v-model="form.description" 
          class="custom-input" 
          rows="3" 
          placeholder="Описание модели (необязательно)"
        ></textarea>
      </div>

      <div class="input-group">
        <label>Категория *</label>
        <select 
          v-model="form.category_id" 
          class="custom-input"
          :class="{ 'bad-input': fieldErrors.category_id }"
          @change="fieldErrors.category_id = ''"
        >
          <option :value="null">Выберите категорию...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <span v-if="fieldErrors.category_id" class="err-text">{{ fieldErrors.category_id }}</span>
      </div>

      <div class="row-inputs">
        <div class="input-group">
          <label>Цена (₽) *</label>
          <input 
            v-model.number="form.price" 
            type="number" 
            step="0.01" 
            class="custom-input" 
            :class="{ 'bad-input': fieldErrors.price }"
            @input="fieldErrors.price = ''"
          />
          <span v-if="fieldErrors.price" class="err-text">{{ fieldErrors.price }}</span>
        </div>
        <div class="input-group">
          <label>Позиция *</label>
          <input 
            v-model.number="form.position" 
            type="number" 
            class="custom-input" 
            :class="{ 'bad-input': fieldErrors.position }"
            @input="fieldErrors.position = ''"
          />
          <span v-if="fieldErrors.position" class="err-text">{{ fieldErrors.position }}</span>
        </div>
      </div>

      <div class="input-group">
        <label>Изображение (превью) *</label>
        <div v-if="imagePreview" class="preview-container">
          <img :src="imagePreview" class="img-preview" />
        </div>
        <input 
          type="file" 
          @change="handleImageUpload" 
          accept="image/*" 
          class="file-input"
          :class="{ 'bad-input': fieldErrors.image }"
        />
        <span v-if="fieldErrors.image" class="err-text">{{ fieldErrors.image }}</span>
      </div>

      <div class="input-group">
        <label>Файл модели (.glb, .obj, .fbx) *</label>
        <input 
          type="file" 
          @change="handleModelUpload" 
          accept=".glb,.obj,.fbx" 
          class="file-input"
          :class="{ 'bad-input': fieldErrors.model }"
        />
        <span v-if="fieldErrors.model" class="err-text">{{ fieldErrors.model }}</span>
      </div>

      <div class="row-inputs">
        <div class="input-group">
          <label>Ссылка на магазин</label>
          <input 
            v-model="form.direct_purchase_url" 
            type="url" 
            class="custom-input" 
            :class="{ 'bad-input': fieldErrors.direct_purchase_url }"
            placeholder="https://..."
          />
        </div>
        <div class="input-group">
          <label>Текст кнопки *</label>
          <input 
            v-model="form.button_name" 
            type="text" 
            class="custom-input" 
            :class="{ 'bad-input': fieldErrors.button_name }"
            @input="fieldErrors.button_name = ''"
          />
          <span v-if="fieldErrors.button_name" class="err-text">{{ fieldErrors.button_name }}</span>
        </div>
      </div>

      <div class="checkbox-group">
        <label class="switch">
          <input type="checkbox" v-model="form.is_active" />
          <span class="slider"></span> Активна
        </label>
        <label class="switch">
          <input type="checkbox" v-model="form.is_stock" />
          <span class="slider"></span> В наличии (Stock)
        </label>
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Создание...' : 'Создать модель' }}
        </button>

        <button type="button" class="preview-action-btn">
          {{ form.button_name || 'Ваша кнопка' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ICategory } from '~/types'
import { 
  validateRequiredMax, 
  validateNonNegative, 
  validateImageFile, 
  validateModelFile,
  validateCategory,
} from '@/utils/validator'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const selectedImageFile = ref<File | null>(null)
const selectedModelFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = ref({
  title: '',
  description: '',
  category_id: null,
  price: 0,
  position: 0,
  button_name: 'Купить',
  direct_purchase_url: '',
  is_active: true,
  is_stock: false
})

const fieldErrors = reactive({
  title: '',
  category_id: '',
  price: '',
  position: '',
  direct_purchase_url: '',
  button_name: '',
  image: '',
  model: ''
})

const { data: categories } = await useFetch<ICategory[]>('/api/categories')

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedImageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    fieldErrors.image = ''
  }
}

function handleModelUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedModelFile.value = file
    fieldErrors.model = ''
  }
}

async function onSubmit() {
  Object.keys(fieldErrors).forEach(key => (fieldErrors[key as keyof typeof fieldErrors] = ''))

  fieldErrors.title = validateRequiredMax(form.value.title, 256)
  fieldErrors.price = validateNonNegative(form.value.price, 'Цена')
  fieldErrors.category_id = validateCategory(form.value.category_id)
  fieldErrors.position = validateNonNegative(form.value.position, 'Позиция')
  fieldErrors.button_name = validateRequiredMax(form.value.button_name, 50)
  fieldErrors.image = validateImageFile(selectedImageFile.value)
  fieldErrors.model = validateModelFile(selectedModelFile.value)

  if (Object.values(fieldErrors).some(msg => msg !== '')) return

  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    const formData = new FormData()
    formData.append('image', selectedImageFile.value!)
    formData.append('model', selectedModelFile.value!)

    Object.entries(form.value).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0')
      } else {
        formData.append(key, value === null ? '' : String(value))
      }
    })

    await $fetch('/api/models', {
      method: 'POST',
      body: formData,
      headers: useRequestHeaders(['cookie']) as Record<string, string>
    })
    
    router.push('/admin/models')
  } catch (e: any) {
    errorMessage.value = e.data?.statusMessage || 'Ошибка создания'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.admin-page { padding: 2rem; max-width: 800px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: bold; }
.back-btn { background: #eee; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.custom-form { display: flex; flex-direction: column; gap: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; min-height: 85px; }
.custom-input { padding: 0.8rem; border: 1px solid #5adbecbd; border-radius: 6px; background: #f8f9fa; outline: none; transition: 0.3s; }
.custom-input:focus { border-color: #007bff; }

.bad-input { border-color: #dc3545 !important; }
.err-text { color: #dc3545; font-size: 12px; font-weight: 500; }

.row-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.preview-container { margin-bottom: 0.5rem; }
.img-preview { max-width: 200px; border-radius: 8px; border: 1px solid #ddd; }
.checkbox-group { display: flex; flex-direction: column; gap: 1rem; }
.switch { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.switch input { display: none; }
.slider { width: 40px; height: 20px; background: #ccc; border-radius: 20px; position: relative; transition: 0.4s; }
.slider:before { content: ""; position: absolute; height: 16px; width: 16px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: 0.4s; }
input:checked + .slider { background: #28a745; }
input:checked + .slider:before { transform: translateX(20px); }

.form-actions { display: flex; gap: 1rem; align-items: center; margin-top: 1rem; }
.save-btn { flex: 2; background: #007bff; color: white; border: none; padding: 1rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.save-btn:disabled { background: #ccc; cursor: not-allowed; }
.preview-action-btn { flex: 1; background: transparent; color: #007bff; border: 2px solid #007bff; padding: 1rem; border-radius: 6px; font-weight: bold; cursor: default; text-align: center; }
.error-msg { color: #dc3545; text-align: center; font-weight: bold; }
</style>