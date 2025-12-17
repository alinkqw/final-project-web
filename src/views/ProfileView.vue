<template>
  <div class="profile-page">
    <div class="header-section">
      <h1 class="header-title gradient-text"> Мой профиль</h1>
      <p class="header-subtitle">
        Управление аккаунтом и настройками
      </p>
      <v-btn
        to="/"
        color="primary"
        class="back-btn font-weight-bold rounded-xl"
        size="large"
      >
        ← На главную
      </v-btn>
    </div>


    <div class="profile-container">

      <div class="profile-left">

        <v-card class="profile-card gradient-card gradient-border">
          <div class="profile-header">
            <div class="avatar-container">
              <v-avatar 
                size="120" 
                class="profile-avatar"
              >
                <v-img 
                  v-if="userStore.user?.avatar"
                  :src="userStore.user.avatar"
                  alt="Avatar"
                  @error="onAvatarError"
                />
                <v-icon 
                  v-else
                  size="60" 
                  color="white"
                  icon="mdi-account"
                />
              </v-avatar>
              

              <v-btn
                icon
                class="avatar-edit-btn"
                @click="avatarDialog = true"
              >
                <v-icon>mdi-camera</v-icon>
              </v-btn>
            </div>
            

            <div class="profile-info">
              <h2 class="user-name">{{ userStore.user?.name || 'Пользователь' }}</h2>
              <v-chip 
                :color="getRoleColor()"
                class="role-chip font-weight-bold"
                size="small"
              >
                <v-icon start>{{ getRoleIcon() }}</v-icon>
                {{ getRoleText() }}
              </v-chip>
              
              <div class="user-email">
                <v-icon size="small" class="mr-1">mdi-email</v-icon>
                {{ userStore.user?.email || 'email@example.com' }}
              </div>
            </div>
          </div>


          <div class="stats-section">
            <h3 class="stats-title"> Статистика</h3>
            <v-divider class="mb-4" />
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.completedTests }}</div>
                <div class="stat-label">Пройдено тестов</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.averageScore }}%</div>
                <div class="stat-label">Средний балл</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatTime(userStats.totalTime) }}</div>
                <div class="stat-label">Времени потрачено</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.successRate }}%</div>
                <div class="stat-label">Успешность</div>
              </div>
            </div>
          </div>

          <div class="activity-section">
            <h3 class="activity-title"> Последняя активность</h3>
            <v-divider class="mb-4" />
            
            <v-timeline side="end" density="compact">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <template v-slot:icon>
                  <v-icon>{{ activity.icon }}</v-icon>
                </template>
                
                <div class="activity-item">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-card>
      </div>


      <div class="profile-right">

        <v-card class="settings-card gradient-card gradient-border">
          <h3 class="settings-title">Настройки профиля</h3>
          <v-divider class="mb-6" />

          <v-form @submit.prevent="updateProfile" class="settings-form">
            <div class="form-field">
              <v-text-field
                v-model="editForm.name"
                label="Имя"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>

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
                color="primary"
              />
            </div>

            <div class="form-field">
              <v-text-field
                v-model="editForm.newPassword"
                label="Новый пароль"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="newPasswordRules"
                density="comfortable"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details="auto"
                class="dark-input"
                color="primary"
                placeholder="Оставьте пустым, если не хотите менять"
              />
            </div>

            <div class="form-field">
              <v-select
                v-model="editForm.theme"
                label="Тема интерфейса"
                prepend-inner-icon="mdi-palette-outline"
                :items="themeOptions"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>

            <div class="notifications-section">
              <h4 class="notifications-title">🔔 Уведомления</h4>
              <v-switch
                v-model="editForm.notifications.email"
                label="Email уведомления"
                color="primary"
                hide-details
                class="notification-switch"
              />
              <v-switch
                v-model="editForm.notifications.news"
                label="Новости и обновления"
                color="primary"
                hide-details
                class="notification-switch"
              />
              <v-switch
                v-model="editForm.notifications.reminders"
                label="Напоминания о тестах"
                color="primary"
                hide-details
                class="notification-switch"
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
                class="save-btn font-weight-bold"
              >
                <v-icon start>mdi-content-save</v-icon>
                СОХРАНИТЬ ИЗМЕНЕНИЯ
              </v-btn>

              <v-btn
                @click="resetForm"
                variant="outlined"
                color="grey"
                block
                size="large"
                class="reset-btn mt-3"
              >
                <v-icon start>mdi-restore</v-icon>
                ОТМЕНИТЬ
              </v-btn>

              <v-btn
                @click="logout"
                variant="outlined"
                color="error"
                block
                size="large"
                class="logout-btn mt-3"
              >
                <v-icon start>mdi-logout</v-icon>
                ВЫЙТИ ИЗ АККАУНТА
              </v-btn>
            </div>
          </v-form>
        </v-card>

        <v-card v-if="isAdmin" class="admin-card gradient-card gradient-border">
          <h3 class="admin-title">Панель администратора</h3>
          <v-divider class="mb-4" />
          
          <div class="admin-actions">
            <v-btn
              @click="goToAdminPanel"
              color="warning"
              block
              class="mb-3"
            >
              <v-icon start>mdi-cog</v-icon>
              Управление тестами
            </v-btn>
            
            <v-btn
              @click="goToUsers"
              variant="outlined"
              color="warning"
              block
              class="mb-3"
            >
              <v-icon start>mdi-account-group</v-icon>
              Управление пользователями
            </v-btn>
            
            <v-btn
              @click="goToAnalytics"
              variant="outlined"
              color="warning"
              block
            >
              <v-icon start>mdi-chart-bar</v-icon>
              Аналитика
            </v-btn>
          </div>
        </v-card>
      </div>
    </div>


    <v-dialog v-model="avatarDialog" max-width="500">
      <v-card class="avatar-dialog gradient-card gradient-border">
        <v-card-title class="dialog-title">
          <v-icon start>mdi-camera</v-icon>
          Смена аватара
        </v-card-title>
        
        <v-card-text>
          <div class="avatar-options">
            <div 
              v-for="avatar in avatarOptions"
              :key="avatar"
              class="avatar-option"
              :class="{ 'selected': selectedAvatar === avatar }"
              @click="selectedAvatar = avatar"
            >
              <v-avatar size="80">
                <v-img :src="avatar" />
              </v-avatar>
            </div>
          </div>
          
          <v-text-field
            v-model="customAvatarUrl"
            label="Или введите ссылку на изображение"
            placeholder="https://example.com/avatar.jpg"
            class="mt-4 dark-input"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="avatarDialog = false" variant="text">Отмена</v-btn>
          <v-btn 
            @click="updateAvatar" 
            color="primary"
            :disabled="!selectedAvatar && !customAvatarUrl"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()


const loading = ref(false)
const showPassword = ref(false)
const avatarDialog = ref(false)
const selectedAvatar = ref(null)
const customAvatarUrl = ref('')


const editForm = ref({
  name: '',
  email: '',
  newPassword: '',
  theme: 'dark',
  notifications: {
    email: true,
    news: true,
    reminders: true
  }
})


const userStats = ref({
  completedTests: 12,
  averageScore: 85,
  totalTime: 5480, // минуты
  successRate: 92
})


const recentActivities = ref([
  { id: 1, text: 'Пройден тест "JavaScript Basic"', time: '2 часа назад', icon: 'mdi-check-circle', color: 'success' },
  { id: 2, text: 'Начат тест "React Advanced"', time: 'Вчера', icon: 'mdi-play-circle', color: 'primary' },
  { id: 3, text: 'Обновлен профиль', time: '2 дня назад', icon: 'mdi-account-edit', color: 'info' },
  { id: 4, text: 'Достижение "Мастер тестов"', time: 'Неделю назад', icon: 'mdi-trophy', color: 'warning' }
])


const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})


const themeOptions = [
  { title: 'Тёмная', value: 'dark' },
  { title: 'Светлая', value: 'light' },
  { title: 'Системная', value: 'system' }
]

const avatarOptions = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
]


const emailRules = [
  v => !v || /.+@.+\..+/.test(v) || 'Email некорректен'
]

const newPasswordRules = [
  v => !v || v.length >= 6 || 'Минимум 6 символов'
]


const isAdmin = computed(() => {
  return userStore.isAdmin && userStore.isAdmin()
})

const hasChanges = computed(() => {
  const user = userStore.user || {}
  return editForm.value.name !== user.name ||
    editForm.value.email !== user.email ||
    editForm.value.newPassword ||
    editForm.value.theme !== 'dark'
})


const getRoleColor = () => {
  return isAdmin.value ? 'warning' : 'primary'
}

const getRoleIcon = () => {
  return isAdmin.value ? 'mdi-shield-crown' : 'mdi-account'
}

const getRoleText = () => {
  return isAdmin.value ? 'Администратор' : 'Студент'
}

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
}

const updateProfile = async () => {
  loading.value = true
  
  try {

    await new Promise(resolve => setTimeout(resolve, 1000))
    

    if (userStore.user) {
      userStore.user.name = editForm.value.name
      userStore.user.email = editForm.value.email
    }
    
    showSnackbar('Профиль успешно обновлен', 'success')
  } catch (error) {
    showSnackbar('Ошибка при обновлении профиля', 'error')
  } finally {
    loading.value = false
  }
}

const updateAvatar = () => {
  const avatarUrl = customAvatarUrl.value || selectedAvatar.value
  if (avatarUrl && userStore.user) {
    userStore.user.avatar = avatarUrl
    showSnackbar('Аватар обновлен', 'success')
  }
  avatarDialog.value = false
  customAvatarUrl.value = ''
  selectedAvatar.value = null
}

const resetForm = () => {
  const user = userStore.user || {}
  editForm.value = {
    name: user.name || '',
    email: user.email || '',
    newPassword: '',
    theme: 'dark',
    notifications: {
      email: true,
      news: true,
      reminders: true
    }
  }
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

const goToAnalytics = () => {
  router.push('/admin/analytics')
}

const onAvatarError = (event) => {
  const img = event?.target
  if (img) {
    img.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}


onMounted(() => {
  const user = userStore.user || {}
  editForm.value = {
    name: user.name || '',
    email: user.email || '',
    newPassword: '',
    theme: 'dark',
    notifications: {
      email: true,
      news: true,
      reminders: true
    }
  }
})
</script>

<style scoped>
.profile-page {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #131a2b 100%);
  color: #d1d5db;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
  position: absolute;
  left: 0;
}

.header-section {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  padding: 60px 20px 40px;
}

.header-title {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.25rem;
  color: #9ca3af;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 32px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  border: none;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  color: #ffffff;
}

/* ОСНОВНОЙ КОНТЕЙНЕР ПРОФИЛЯ */
.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.profile-card,
.settings-card,
.admin-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))
      padding-box,
    linear-gradient(135deg, #2563eb, #0891b2) border-box;
  border: 1px solid transparent;
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
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.25),
    0 4px 12px rgba(37, 99, 235, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: white !important;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

/* ИНФОРМАЦИЯ ПОЛЬЗОВАТЕЛЯ */
.profile-info {
  flex: 1;
}

.user-name {
  font-size: 2rem;
  font-weight: 700;
  color: #f3f4f6;
  margin-bottom: 8px;
}

.role-chip {
  font-size: 0.75rem;
  margin-bottom: 12px;
}

.user-email {
  display: flex;
  align-items: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.stats-section,
.activity-section,
.notifications-section {
  margin-bottom: 32px;
}

.stats-title,
.activity-title,
.settings-title,
.admin-title,
.notifications-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  background: rgba(10, 15, 26, 0.5);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.activity-item {
  background: rgba(10, 15, 26, 0.5);
  border-radius: 12px;
  padding: 12px 16px;
  margin-left: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.activity-text {
  color: #f3f4f6;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.settings-form {
  animation: fadeInUp 0.6s ease-out;
}

.form-field {
  margin-bottom: 20px;
}

.dark-input :deep(.v-field) {
  background: rgba(10, 15, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #e5e7eb;
  transition: all 0.3s ease;
}

.dark-input :deep(.v-field):hover {
  background: rgba(10, 15, 26, 0.9);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}

.dark-input :deep(.v-field--focused) {
  background: rgba(10, 15, 26, 0.9);
  border-color: #3b82f6;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.15);
}

.dark-input :deep(.v-label) {
  color: #6b7280 !important;
  font-weight: 500;
}

.dark-input :deep(.v-field__input) {
  color: #f3f4f6 !important;
}

.dark-input :deep(.v-icon) {
  color: #6b7280 !important;
}

.dark-input :deep(.v-field--focused .v-icon) {
  color: #3b82f6 !important;
}

.notification-switch {
  margin-bottom: 8px;
}

.notification-switch :deep(.v-label) {
  color: #e5e7eb !important;
  font-size: 0.875rem;
}

.actions-section {
  margin-top: 32px;
}

.save-btn {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  border: none;
  border-radius: 12px;
  box-shadow: 
    0 8px 20px rgba(37, 99, 235, 0.25),
    0 4px 8px rgba(37, 99, 235, 0.15);
  transition: all 0.3s ease;
  color: #ffffff !important;
  font-weight: 700;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 25px rgba(37, 99, 235, 0.35),
    0 6px 15px rgba(37, 99, 235, 0.25);
}

.reset-btn,
.logout-btn {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.reset-btn:hover,
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.admin-card {
  margin-top: 24px;
}

.admin-actions .v-btn {
  border-radius: 12px;
  height: 48px;
}

.avatar-dialog {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dialog-title {
  color: #f3f4f6 !important;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.avatar-option {
  cursor: pointer;
  border-radius: 16px;
  padding: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.avatar-option:hover {
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: #3b82f6;
  background: rgba(37, 99, 235, 0.2);
}

.avatar-option :deep(.v-avatar) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1200px) {
  .profile-container {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 40px 16px 32px;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .profile-container {
    padding: 0 16px 40px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 32px 12px 24px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .profile-card,
  .settings-card,
  .admin-card {
    padding: 24px 20px;
    border-radius: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    padding: 16px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::v-deep(.v-card-title),
::v-deep(.v-card-text),
::v-deep(.v-timeline-item__body) {
  color: #e5e7eb !important;
}

::v-deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.06) !important;
}
</style>