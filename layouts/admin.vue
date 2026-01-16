<template>
  <div class="admin-layout">
    <nav class="admin-nav">
      <div class="nav-container">
        <div class="nav-links">
          <NuxtLink to="/admin/models" class="nav-item"> Модели</NuxtLink>
          <NuxtLink to="/admin/categories" class="nav-item"> Категории</NuxtLink>
        </div>

        <div class="user-menu" v-if="userEmail">
          <span class="user-name"> {{ userEmail }}</span>
          <button @click="handleLogout" class="logout-btn">Выйти</button>
        </div>
      </div>
    </nav>

    <main class="admin-content">
      <slot /> </main>
  </div>
</template>

<script setup>
const token = useCookie('auth_token')
const userEmail = useCookie('user_email')
const router = useRouter()

function handleLogout() {
  token.value = null
  userEmail.value = null
  router.push('/auth/login')
}
</script>

<style scoped>
.admin-nav {
  background: #7ba3e2;
  color: #0e0505;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
}

.nav-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links { 
  display: flex; 
  gap: 10px;
  height: 100%;
}

.nav-item {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  padding: 15px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #000000;
}

.nav-item.router-link-active {
  background: #ffffff;
  color: #040507;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-menu { display: flex; align-items: center; gap: 15px; }
.user-name { font-size: 14px; color: #020405; }
.logout-btn {
  background: #ef4444;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.admin-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
</style>

<style>
  body {
  margin: 0;
  padding: 0;
}
</style>