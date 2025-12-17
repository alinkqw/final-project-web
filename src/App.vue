<template>
  <v-app>
    <v-app-bar color="blue-darken-4" dark elevation="3" fixed>
      <v-app-bar-nav-icon @click="drawer = true" class="d-md-none" />

      <v-toolbar-title class="font-weight-bold mr-6">
        ГосЭкзамен
      </v-toolbar-title>


      <div class="d-none d-md-flex">
        <v-btn
          variant="text"
          class="text-none font-weight-bold"
          to="/"
          exact
        >
          <v-icon start>mdi-home</v-icon>
          Главная
        </v-btn>

        <v-btn
          variant="text"
          class="text-none font-weight-bold"
          to="/tests"
        >
          <v-icon start>mdi-file-document-multiple</v-icon>
          Все тесты
        </v-btn>

        <v-btn
          v-if="isAdmin"
          variant="text"
          class="text-none font-weight-bold"
          to="/admin"
        >
          <v-icon start>mdi-shield-crown</v-icon>
          Админ панель
        </v-btn>
      </div>

      <v-spacer />


      <template v-if="isLoggedIn">
        <!-- Меню профиля -->
        <v-menu location="bottom end" min-width="200">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="white"
              variant="text"
              class="text-none font-weight-bold"
            >

              <v-avatar size="32" class="mr-2">
                <v-img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  alt="Avatar"
                />
                <v-icon v-else color="white">mdi-account-circle</v-icon>
              </v-avatar>
              {{ userName }}
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              :to="profileLink"
              @click="drawer = false"
            >
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>Мой профиль</v-list-item-title>
            </v-list-item>

            <v-divider />

            <template v-if="isAdmin">
              <v-list-item to="/admin" @click="drawer = false">
                <template #prepend>
                  <v-icon color="amber">mdi-shield-crown</v-icon>
                </template>
                <v-list-item-title>Админ панель</v-list-item-title>
              </v-list-item>
              <v-divider />
            </template>

            <v-list-item @click="logout">
              <template #prepend>
                <v-icon color="red-lighten-2">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn
          to="/login"
          color="white"
          variant="outlined"
          class="text-none font-weight-bold mr-2"
        >
          <v-icon start>mdi-login</v-icon>
          Войти
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      color="blue-darken-4"
      width="280"
    >
      <v-list nav density="comfortable">
        <!-- Заголовок профиля -->
        <v-list-item
          v-if="isLoggedIn"
          :to="profileLink"
          @click="drawer = false"
        >
          <template #prepend>
            <v-avatar size="48">
              <v-img
                v-if="user?.avatar"
                :src="user.avatar"
                alt="Avatar"
              />
              <v-icon v-else size="32" color="white">mdi-account-circle</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="text-h6 font-weight-bold">
            {{ userName }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ userGroup }}
          </v-list-item-subtitle>
        </v-list-item>

        <!-- Для неавторизованных -->
        <v-list-item
          v-else
          to="/login"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon size="32">mdi-account-circle-outline</v-icon>
          </template>
          <v-list-item-title>Войти в систему</v-list-item-title>
        </v-list-item>

        <v-divider class="my-4" />

        <!-- Основное меню -->
        <v-list-item
          to="/"
          exact
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Главная</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/tests"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon>mdi-file-document-multiple</v-icon>
          </template>
          <v-list-item-title>Все тесты</v-list-item-title>
        </v-list-item>

        <template v-if="isLoggedIn">
          <v-list-item
            :to="profileLink"
            @click="drawer = false"
          >
            <template #prepend>
              <v-icon>mdi-account-cog</v-icon>
            </template>
            <v-list-item-title>Настройки профиля</v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="isAdmin"
            to="/admin"
            @click="drawer = false"
          >
            <template #prepend>
              <v-icon color="amber">mdi-shield-crown</v-icon>
            </template>
            <v-list-item-title>Админ панель</v-list-item-title>
          </v-list-item>

          <v-divider class="my-4" />

          <v-list-item @click="logout">
            <template #prepend>
              <v-icon color="red-lighten-2">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item>
        </template>

        <template v-else>
          <v-divider class="my-4" />

          <v-list-item
            to="/login"
            @click="drawer = false"
          >
            <template #prepend>
              <v-icon>mdi-login</v-icon>
            </template>
            <v-list-item-title>Войти</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main class="app-main">
      <div class="main-content">
        <router-view />
      </div>
    </v-main>

    <v-footer color="blue-darken-4" class="footer" height="40">
      <v-container class="text-center pa-0">
        <div class="footer-content">
          <span class="text-caption text-white opacity-75">
            🎓 ГосЭкзамен • © 2024
          </span>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const drawer = ref(false)

const user = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated())
const isAdmin = computed(() => {
  return userStore.isAdmin && userStore.isAdmin()
})

const profileLink = computed(() => {
  if (isLoggedIn.value) {
    return isAdmin.value ? '/admin/profile' : '/profile'
  }
  return '/login'
})

const userName = computed(() => {
  if (user.value?.name) return user.value.name
  
  try {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      return parsedUser.name || 'Пользователь'
    }
  } catch (e) {
    console.error('Ошибка при получении имени:', e)
  }
  return 'Гость'
})

const userGroup = computed(() => {
  if (user.value?.group) return user.value.group
  if (isAdmin.value) return 'Администратор'
  return 'Студент'
})

onMounted(() => {
  // Загружаем пользователя при загрузке приложения
  userStore.loadUser()
  
  if (!userStore.user && userStore.getToken()) {
    console.log('Обнаружен токен, восстанавливаю сессию...')
  }
})


watch(() => router.currentRoute.value.path, () => {

  drawer.value = false
})

const logout = async () => {
  try {
    await userStore.logout()
    drawer.value = false
    
    router.push('/')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  height: 100%;
  background: #0f172a !important;
}

#app {
  height: 100%;
  background: #0f172a !important;
}


.app-main {
  min-height: 100vh;
  padding-top: 64px; /* Высота header */
  padding-bottom: 40px; /* Высота footer */
  background: #0f172a !important;
}

.main-content {
  min-height: calc(100vh - 104px); /* 100vh - (header + footer) */
  padding-bottom: 20px;
}


.v-avatar {
  transition: transform 0.3s ease;
}

.v-avatar:hover {
  transform: scale(1.05);
}


@media (max-width: 960px) {
  .v-app-bar {
    padding: 0 8px;
  }
  
  .v-toolbar-title {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .app-main {
    padding: 8px;
    padding-top: 64px;
    padding-bottom: 40px;
  }
}


.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}


.v-navigation-drawer {
  backdrop-filter: blur(10px);
  background-color: rgba(13, 71, 161, 0.95) !important;
}


.v-btn.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}


.v-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.opacity-75 {
  opacity: 0.75;
}
</style>

<style>
.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.v-list-item--active .v-icon {
  color: #ffffff !important;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
}

.v-application * {
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}


.v-application {
  background: #0f172a !important;
}


.v-container {
  background: transparent !important;
}

.v-card {
  background: rgba(15, 23, 42, 0.95) !important;
  color: #ffffff !important;
}

.v-field {
  color: #ffffff !important;
}

.v-field__input {
  color: #ffffff !important;
}

.v-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

.v-field__outline {
  color: rgba(255, 255, 255, 0.2) !important;
}
</style>