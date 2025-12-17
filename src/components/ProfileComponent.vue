<template>
  <div class="profile-page">
    <!-- ХЕДЕР -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-title-section">
          <h1 class="header-title gradient-text">
            <v-icon :icon="headerIcon" size="large" class="mr-2" />
            {{ pageTitle }}
          </h1>
          <p class="header-subtitle">
            {{ pageSubtitle }}
          </p>
        </div>
        
        <v-btn
          :to="backRoute"
          color="primary"
          class="back-btn font-weight-bold rounded-lg"
          size="large"
          variant="outlined"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          {{ backButtonText }}
        </v-btn>
      </div>
    </div>

    <!-- ОСНОВНОЙ КОНТЕЙНЕР -->
    <div class="profile-container">
      <!-- ЛЕВАЯ КОЛОНКА: ИНФОРМАЦИЯ -->
      <div class="profile-left">
        <!-- КАРТОЧКА ПРОФИЛЯ -->
        <v-card class="profile-card gradient-card">
          <div class="profile-header">
            <div class="avatar-container">
              <v-avatar 
                size="120" 
                class="profile-avatar"
                :class="{ 'admin-avatar': isAdmin }"
              >
                <v-img 
                  v-if="userAvatar"
                  :src="userAvatar"
                  alt="Аватар"
                  @error="handleAvatarError"
                />
                <v-icon 
                  v-else
                  size="60" 
                  color="white"
                  :icon="avatarIcon"
                />
              </v-avatar>
              
              <!-- КНОПКА СМЕНЫ АВАТАРА -->
              <v-btn
                @click="triggerAvatarUpload"
                color="primary"
                icon
                size="small"
                class="avatar-edit-btn"
              >
                <v-icon>mdi-camera</v-icon>
              </v-btn>
              
              <!-- Скрытый input для загрузки -->
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="onAvatarUpload"
                style="display: none"
              />
            </div>
            
            <!-- ИМЯ И СТАТУС -->
            <div class="profile-info">
              <h2 class="user-name">{{ userName }}</h2>
              <v-chip 
                :color="roleColor"
                class="role-chip font-weight-bold"
                size="small"
                :prepend-icon="roleIcon"
              >
                {{ roleText }}
              </v-chip>
              
              <div class="user-email">
                <v-icon size="small" class="mr-2">mdi-email</v-icon>
                {{ userEmail }}
              </div>
              
              <div v-if="userStore.user?.createdAt" class="user-registered">
                <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
                Зарегистрирован: {{ formatDate(userStore.user.createdAt) }}
              </div>
            </div>
          </div>

          <!-- СТАТИСТИКА -->
          <div class="stats-section">
            <h3 class="stats-title">
              <v-icon class="mr-2">mdi-chart-box</v-icon>
              Статистика
            </h3>
            <v-divider class="mb-4" />
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="primary">mdi-test-tube</v-icon>
                </div>
                <div class="stat-value">{{ userStats.completedTests }}</div>
                <div class="stat-label">Пройдено тестов</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="success">mdi-chart-line</v-icon>
                </div>
                <div class="stat-value">{{ userStats.averageScore }}%</div>
                <div class="stat-label">Средний балл</div>
              </div>
              <div v-if="userStats.lastTestDate" class="stat-item">
                <div class="stat-icon">
                  <v-icon color="warning">mdi-clock</v-icon>
                </div>
                <div class="stat-value">{{ formatDate(userStats.lastTestDate) }}</div>
                <div class="stat-label">Последний тест</div>
              </div>
            </div>
          </div>
        </v-card>
      </div>

      <!-- ПРАВАЯ КОЛОНКА: НАСТРОЙКИ -->
      <div class="profile-right">
        <!-- КАРТОЧКА НАСТРОЕК -->
        <v-card class="settings-card gradient-card">
          <h3 class="settings-title">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Настройки профиля
          </h3>
          <v-divider class="mb-6" />

          <!-- ФОРМА РЕДАКТИРОВАНИЯ -->
          <v-form @submit.prevent="updateProfile" class="settings-form">
            <!-- ИМЯ -->
            <div class="form-field">
              <v-text-field
                v-model="editForm.name"
                label="Имя"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="dark-input"
                :rules="[v => !!v.trim() || 'Имя обязательно']"
              />
            </div>

            <!-- EMAIL -->
            <div class="form-field">
              <v-text-field
                v-model="editForm.email"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                :rules="emailRules"
                density="comfortable"
                hide-details="auto"
                class="dark-input"
              />
            </div>

            <!-- НОВЫЙ ПАРОЛЬ -->
            <div class="form-field">
              <v-text-field
                v-model="editForm.newPassword"
                label="Новый пароль"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="passwordRules"
                density="comfortable"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details="auto"
                class="dark-input"
                placeholder="Оставьте пустым, если не хотите менять"
              />
            </div>

            <!-- КНОПКИ -->
            <div class="actions-section">
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!hasChanges"
                block
                size="large"
                class="save-btn font-weight-bold rounded-lg"
              >
                <v-icon start>mdi-content-save</v-icon>
                СОХРАНИТЬ ИЗМЕНЕНИЯ
              </v-btn>

              <v-btn
                @click="resetForm"
                variant="outlined"
                color="grey-lighten-1"
                block
                size="large"
                class="reset-btn mt-3 rounded-lg"
              >
                <v-icon start>mdi-restore</v-icon>
                ОТМЕНИТЬ
              </v-btn>

              <v-btn
                @click="logout"
                variant="outlined"
                color="red-lighten-2"
                block
                size="large"
                class="logout-btn mt-3 rounded-lg"
              >
                <v-icon start>mdi-logout</v-icon>
                ВЫЙТИ ИЗ АККАУНТА
              </v-btn>
            </div>
          </v-form>
        </v-card>


      </div>
    </div>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
          icon="mdi-close"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const userStore = useUserStore()
const avatarInput = ref(null)


const loading = ref(false)
const showPassword = ref(false)

const editForm = ref({
  name: '',
  email: '',
  newPassword: ''
})


const userStats = ref({
  completedTests: 0,
  averageScore: 0,
  lastTestDate: null
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})


const pageTitle = computed(() => {
  return props.isAdmin ? 'Профиль администратора' : 'Мой профиль'
})

const pageSubtitle = computed(() => {
  return props.isAdmin ? 'Управление системой' : 'Управление аккаунтом'
})

const backRoute = computed(() => {
  return props.isAdmin ? '/admin' : '/'
})

const backButtonText = computed(() => {
  return props.isAdmin ? 'В админ-панель' : 'На главную'
})

const headerIcon = computed(() => {
  return props.isAdmin ? 'mdi-shield-crown' : 'mdi-account'
})

const avatarIcon = computed(() => {
  return props.isAdmin ? 'mdi-shield-crown' : 'mdi-account'
})

const roleColor = computed(() => {
  return props.isAdmin ? 'amber-darken-2' : 'blue-darken-2'
})

const roleIcon = computed(() => {
  return props.isAdmin ? 'mdi-shield-crown' : 'mdi-school'
})

const roleText = computed(() => {
  return props.isAdmin ? 'Администратор' : 'Студент'
})

const userName = computed(() => {
  return userStore.user?.name || 'Пользователь'
})

const userEmail = computed(() => {
  return userStore.user?.email || 'email@example.com'
})

const userAvatar = computed(() => {
  return userStore.user?.avatar
})

const hasChanges = computed(() => {
  const user = userStore.user || {}
  return editForm.value.name !== user.name ||
    editForm.value.email !== user.email ||
    editForm.value.newPassword
})


const emailRules = [
  v => !v || /.+@.+\..+/.test(v) || 'Email некорректен'
]

const passwordRules = [
  v => !v || v.length >= 6 || 'Минимум 6 символов'
]

const updateProfile = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (userStore.user) {
      userStore.user.name = editForm.value.name
      userStore.user.email = editForm.value.email
      userStore.user.updatedAt = new Date().toISOString()
      
      localStorage.setItem('currentUser', JSON.stringify(userStore.user))
      
      if (editForm.value.newPassword) {
        showSnackbar('Пароль успешно изменен', 'success', 'mdi-lock-check')
        editForm.value.newPassword = ''
      }
    }
    
    showSnackbar('Профиль успешно обновлен', 'success')
  } catch (error) {
    showSnackbar('Ошибка при обновлении профиля', 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  const user = userStore.user || {}
  editForm.value = {
    name: user.name || '',
    email: user.email || '',
    newPassword: ''
  }
  showSnackbar('Изменения отменены', 'info', 'mdi-information')
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const goToAdminPanel = () => {
  router.push('/admin/tests')
}

const goToUsers = () => {
  router.push('/admin/users')
}

const goToStatistics = () => {
  router.push('/admin/analytics')
}

const handleAvatarError = (event) => {
  const img = event?.target
  if (img) {
    img.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const onAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    showSnackbar('Пожалуйста, выберите изображение', 'error', 'mdi-alert')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showSnackbar('Файл слишком большой (макс. 5MB)', 'error', 'mdi-alert')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    if (userStore.user) {
      userStore.user.avatar = e.target.result
      localStorage.setItem('currentUser', JSON.stringify(userStore.user))
      showSnackbar('Аватар успешно обновлен', 'success', 'mdi-check-circle')
    }
  }
  reader.readAsDataURL(file)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Неизвестно'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const showSnackbar = (message, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = { 
    show: true, 
    message, 
    color,
    icon
  }
}

const loadUserStats = () => {
  const savedStats = localStorage.getItem(`userStats_${userStore.user?.id}`)
  
  if (savedStats) {
    userStats.value = JSON.parse(savedStats)
  } else {
    userStats.value = {
      completedTests: props.isAdmin ? 0 : Math.floor(Math.random() * 50),
      averageScore: props.isAdmin ? 0 : Math.floor(Math.random() * 30) + 70,
      lastTestDate: props.isAdmin ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

onMounted(() => {
  const user = userStore.user || {}
  editForm.value = {
    name: user.name || '',
    email: user.email || '',
    newPassword: ''
  }
  
  loadUserStats()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #131a2b 100%);
  color: #ffffff; /* ВСЕ ТЕКСТЫ БЕЛЫЕ */
  padding: 24px;
}

.header-section {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.header-title-section {
  flex: 1;
  min-width: 300px;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.header-subtitle {
  font-size: 1.1rem;
  color: #b0b0b0; /* Слегка серый для подзаголовка */
  margin: 0;
}

.back-btn {
  min-width: 160px;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}


.profile-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
}


.gradient-card {
  background: rgba(25, 35, 55, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  color: #ffffff;
}


.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.profile-avatar.admin-avatar {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, #f59e0b, #dc2626);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #3b82f6 !important;
  color: white !important;
}

.profile-info {
  flex: 1;
  color: #ffffff;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.role-chip {
  margin-bottom: 12px;
  padding: 4px 12px;
}

.user-email, .user-registered {
  display: flex;
  align-items: center;
  color: #cccccc; /* Светло-серый для второстепенной информации */
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Статистика */
.stats-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
  display: flex;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(40, 55, 90, 0.5);
  border-radius: 12px;
  transition: transform 0.2s;
  color: #ffffff;
}

.stat-item:hover {
  transform: translateY(-2px);
  background: rgba(40, 55, 90, 0.8);
}

.stat-icon {
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #b0b0b0;
}

/* Настройки */
.settings-title, .admin-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
  display: flex;
  align-items: center;
}

.form-field {
  margin-bottom: 20px;
}

.dark-input {
  background: rgba(40, 50, 70, 0.5) !important;
  color: #ffffff !important;
}

.dark-input :deep(.v-field__input) {
  color: #ffffff !important;
}

.dark-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.dark-input :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.2) !important;
}

.actions-section {
  margin-top: 32px;
}

.save-btn, .reset-btn, .logout-btn {
  border-radius: 8px;
  color: #ffffff;
}


.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}


.v-avatar {
  transition: transform 0.3s;
}

.v-avatar:hover {
  transform: scale(1.05);
}

.stat-item {
  transition: all 0.3s;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
  }
  
  .back-btn {
    width: 100%;
  }
  
  .profile-card,
  .settings-card,
  .admin-card {
    padding: 16px;
  }
}
</style>