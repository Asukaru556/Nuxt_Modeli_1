<template>
  <div class="container">
    <header class="section header-status">
      <div v-if="token" class="auth-info">
        <span>✅ Вы авторизованы: <b>{{ userEmail }}</b></span>
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>
      <div v-else class="auth-info guest">
        <span>👤 Режим гостя: <b>Токен отсутствует</b></span>
        <p class="hint">Запросы PATCH/POST/DELETE вернут 401 ошибку (Middleware).</p>
      </div>
    </header>

    <div v-if="!token" class="section auth-section">
      <h3>Авторизация</h3>
      <form @submit.prevent="handleAuth" class="flex-row">
        <input v-model="form.email" type="email" placeholder="Email" />
        <input v-model="form.password" type="password" placeholder="Пароль" />
        <button type="submit" class="primary-btn mini">Войти</button>
      </form>
    </div>

    <div class="dashboard">
      <section class="section">
        <h3>Категории</h3>
        <div class="flex-row">
          <input v-model="newCatName" :placeholder="editingCatId ? 'Новое название...' : 'Название категории'" />
          <button v-if="!editingCatId" @click="saveCategory" class="add-btn">✚</button>
          <div v-else class="edit-actions">
            <button @click="saveCategory" class="save-btn">💾 Сохранить PATCH</button>
            <button @click="cancelCatEdit" class="cancel-btn">✕</button>
          </div>
        </div>
        <div class="chip-container">
          <span v-for="cat in categories" :key="cat.id" class="chip clickable" :class="{ 'editing-now': editingCatId === cat.id }" @click="startEditCategory(cat)">
            {{ cat.name }}
            <button @click.stop="deleteCategory(cat.id)">×</button>
          </span>
        </div>
      </section>

      <section class="section upload-box">
        <h3>{{ editingModelId ? `Редактировать ID: ${editingModelId} (PATCH)` : 'Добавить новую модель (POST)' }}</h3>
        <form @submit.prevent="saveModel" class="grid-form">
          <div class="form-group">
            <input v-model="modelForm.title" placeholder="Название модели*" required />
            <textarea v-model="modelForm.description" placeholder="Описание"></textarea>
          </div>
          <div class="form-row">
            <input v-model="modelForm.price" type="number" step="0.01" placeholder="Цена" />
            <select v-model="modelForm.category_id">
              <option :value="null">Без категории</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <input v-model="modelForm.button_name" placeholder="Текст кнопки" />
            <input v-model="modelForm.direct_purchase_url" placeholder="URL покупки" />
          </div>
          <div class="checkbox-group">
            <label class="switch"><input type="checkbox" v-model="modelForm.is_active" /><span class="slider"></span> Активна</label>
            <label class="switch"><input type="checkbox" v-model="modelForm.is_stock" /><span class="slider"></span> В наличии</label>
          </div>
          <div class="file-section">
            <p class="hint" v-if="editingModelId">Файлы можно не выбирать, если не хотите их менять</p>
            <input type="file" @change="e => files.image = e.target.files[0]" accept="image/*" />
            <input type="file" @change="e => files.model = e.target.files[0]" accept=".glb" />
          </div>
          <div class="flex-row">
            <button type="submit" class="primary-btn" :disabled="uploading">
              {{ uploading ? 'Загрузка...' : (editingModelId ? 'Обновить (PATCH)' : 'Создать (POST)') }}
            </button>
            <button v-if="editingModelId" type="button" @click="cancelModelEdit" class="cancel-btn">Отмена</button>
          </div>
        </form>
      </section>

      <section class="section">
        <h3>Список моделей (Клик для GET + PATCH)</h3>
        <div class="model-grid">
          <div v-for="model in models" :key="model.id" class="model-card clickable" :class="{ 'editing-card': editingModelId === model.id }" @click="fetchModelForEdit(model.id)">
            <img :src="model.image_path || '/no-image.png'" />
            <div class="model-info">
              <h4>{{ model.title }}</h4>
              <p>{{ model.price }} ₽</p>
              <button @click.stop="deleteModel(model.id)" class="del-btn-simple">Удалить</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const token = useCookie('auth_token');
const userEmail = useCookie('user_email');
const loading = ref(false);
const uploading = ref(false);

const categories = ref([]);
const models = ref([]);
const newCatName = ref('');
const editingCatId = ref(null);
const editingModelId = ref(null);

const form = reactive({ email: '', password: '' });
const modelForm = reactive({
  title: '', 
  description: '', 
  price: 0, 
  category_id: null,
  is_active: true, 
  is_stock: false,
  button_name: '',           // добавлено для теста
  direct_purchase_url: ''    // добавлено для теста
});
const files = reactive({ image: null, model: null });

async function refreshData() {
  const [cats, mods] = await Promise.all([$fetch('/api/categories'), $fetch('/api/models')]);
  categories.value = cats;
  models.value = mods;
}

// --- КАТЕГОРИИ ---
async function startEditCategory(cat) {
  try {
    const data = await $fetch(`/api/categories/${cat.id}`);
    console.log('GET Category Success:', data);
    newCatName.value = data.name;
    editingCatId.value = data.id;
  } catch (e) { alert('Ошибка GET запроса категории'); }
}

async function saveCategory() {
  const method = editingCatId.value ? 'PATCH' : 'POST';
  const url = editingCatId.value ? `/api/categories/${editingCatId.value}` : '/api/categories';
  try {
    await $fetch(url, {
      method,
      body: { name: newCatName.value },
      headers: { Authorization: token.value ? `Bearer ${token.value}` : undefined }
    });
    newCatName.value = ''; editingCatId.value = null; refreshData();
  } catch (e) { alert(`Middleware Error: ${e.status}`); }
}

// --- МОДЕЛИ ---
// Тест GET /api/models/:id
async function fetchModelForEdit(id) {
  try {
    const data = await $fetch(`/api/models/${id}`);
    console.log('GET Model Detail Success:', data);
    
    editingModelId.value = data.id;
    modelForm.title = data.title;
    modelForm.description = data.description || '';
    modelForm.price = data.price || 0;
    modelForm.category_id = data.category_id;
    modelForm.is_active = !!data.is_active;
    modelForm.is_stock = !!data.is_stock;
    modelForm.button_name = data.button_name || '';
    modelForm.direct_purchase_url = data.direct_purchase_url || '';
    
    // Скролл к форме для удобства
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { alert('Ошибка при получении модели по ID'); }
}

// Тест PATCH /api/models/:id или POST /api/models
async function saveModel() {
  uploading.value = true;
  const fd = new FormData();
  
  // Добавляем текстовые поля
  Object.keys(modelForm).forEach(k => {
    fd.append(k, modelForm[k] === null ? '' : modelForm[k]);
  });
  
  // Добавляем файлы только если они выбраны
  if (files.image) fd.append('image', files.image);
  if (files.model) fd.append('model', files.model);

  const method = editingModelId.value ? 'PATCH' : 'POST';
  const url = editingModelId.value ? `/api/models/${editingModelId.value}` : '/api/models';

  try {
    await $fetch(url, {
      method,
      body: fd,
      headers: { Authorization: token.value ? `Bearer ${token.value}` : undefined }
    });
    cancelModelEdit();
    refreshData();
    alert('Успешно сохранено!');
  } catch (e) { alert(`Ошибка сервера: ${e.status}`); }
  finally { uploading.value = false; }
}

function cancelModelEdit() {
  editingModelId.value = null;
  Object.assign(modelForm, { title: '', description: '', price: 0, category_id: null, is_active: true, is_stock: false, button_name: '', direct_purchase_url: '' });
  files.image = null;
  files.model = null;
}

// Системное
function cancelCatEdit() { editingCatId.value = null; newCatName.value = ''; }
async function deleteCategory(id) {
  if(!confirm('Удалить категорию?')) return;
  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: token.value ? `Bearer ${token.value}` : undefined } });
    refreshData();
  } catch (e) { alert(e.status); }
}
async function deleteModel(id) {
  if(!confirm('Удалить модель?')) return;
  try {
    await $fetch(`/api/models/${id}`, { method: 'DELETE', headers: { Authorization: token.value ? `Bearer ${token.value}` : undefined } });
    refreshData();
  } catch (e) { alert(e.status); }
}
async function handleAuth() {
  try {
    const data = await $fetch('/api/auth/login', { method: 'POST', body: form });
    token.value = data.token; userEmail.value = data.email; refreshData();
  } catch (e) { alert('Ошибка входа'); }
}
function logout() { token.value = null; userEmail.value = null; }
onMounted(refreshData);
</script>

<style scoped>
.container { max-width: 900px; margin: 1rem auto; font-family: sans-serif; }
.section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #eee; }
.editing-now, .editing-card { border: 2px solid #2563eb !important; background: #eff6ff !important; }
.chip { background: #f1f5f9; padding: 6px 12px; border-radius: 20px; cursor: pointer; margin: 4px; display: inline-flex; align-items: center; gap: 8px; }
.model-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }
.model-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; cursor: pointer; transition: 0.2s; }
.model-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.model-card img { width: 100%; height: 100px; object-fit: cover; }
.model-info { padding: 10px; }
.primary-btn { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.cancel-btn { background: #94a3b8; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }
.flex-row { display: flex; gap: 10px; align-items: center; }
.grid-form { display: flex; flex-direction: column; gap: 10px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
input, textarea, select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; width: 100%; box-sizing: border-box; }
.del-btn-simple { background: #fee2e2; color: #ef4444; border: none; font-size: 11px; padding: 4px 8px; border-radius: 4px; margin-top: 5px; cursor: pointer; }
</style>