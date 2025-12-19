<template>
  <div class="profile-page">
    <div class="header-section">
      <h1 class="header-title gradient-text">Мой профиль</h1>
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
                {{ userStore.user?.email || 'Не указан' }}
              </div>
              
              <div v-if="userStore.user?.group" class="user-group">
                <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
                Группа: {{ userStore.user.group }}
              </div>
            </div>
          </div>

          <div class="stats-section">
            <h3 class="stats-title">Статистика</h3>
            <v-divider class="mb-4" />
            
            <div class="stats-grid">
              <div class="stat-item" v-if="userStats.completedTests > 0">
                <div class="stat-value">{{ userStats.completedTests }}</div>
                <div class="stat-label">Пройдено тестов</div>
              </div>
              <div class="stat-item" v-else>
                <div class="stat-value">0</div>
                <div class="stat-label">Пройдено тестов</div>
              </div>
              
              <div class="stat-item" v-if="userStats.averageScore > 0">
                <div class="stat-value">{{ userStats.averageScore }}%</div>
                <div class="stat-label">Средний балл</div>
              </div>
              <div class="stat-item" v-else>
                <div class="stat-value">0%</div>
                <div class="stat-label">Средний балл</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-value">{{ formatTime(userStats.totalTime) }}</div>
                <div class="stat-label">Времени потрачено</div>
              </div>
              
              <div class="stat-item" v-if="userStats.completedTests > 0">
                <div class="stat-value">{{ userStats.successRate }}%</div>
                <div class="stat-label">Успешность</div>
              </div>
              <div class="stat-item" v-else>
                <div class="stat-value">0%</div>
                <div class="stat-label">Успешность</div>
              </div>
            </div>
          </div>

          <div class="activity-section" v-if="realActivities.length > 0">
            <h3 class="activity-title">Последняя активность</h3>
            <v-divider class="mb-4" />
            
            <v-timeline side="end" density="compact">
              <v-timeline-item
                v-for="activity in realActivities.slice(0, 4)"
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
          
          <div class="activity-section" v-else>
            <h3 class="activity-title">Активность</h3>
            <v-divider class="mb-4" />
            <div class="no-activity">
              <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-calendar-blank</v-icon>
              <p class="no-activity-text">У вас пока нет активности</p>
              <v-btn 
                to="/tests" 
                color="primary" 
                variant="outlined" 
                size="small"
                class="mt-2"
              >
                Пройти первый тест
              </v-btn>
            </div>
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
                :rules="nameRules"
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
            
            <div class="form-field" v-if="userStore.user?.group">
              <v-text-field
                :model-value="userStore.user.group"
                label="Группа"
                prepend-inner-icon="mdi-account-group-outline"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="dark-input"
                color="primary"
                readonly
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
                :disabled="!hasChanges"
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
              @click="goToDashboard"
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
            :rules="urlRules"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="avatarDialog = false" variant="text">Отмена</v-btn>
          <v-btn 
            @click="updateAvatar" 
            color="primary"
            :disabled="!selectedAvatar && !customAvatarUrl"
            :loading="avatarLoading"
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
const avatarLoading = ref(false)
const showPassword = ref(false)
const avatarDialog = ref(false)
const selectedAvatar = ref(null)
const customAvatarUrl = ref('')

const editForm = ref({
  name: '',
  email: '',
  newPassword: ''
})

const userStats = ref({
  completedTests: 0,
  averageScore: 0,
  totalTime: 0,
  successRate: 0
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const avatarOptions = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
]

const nameRules = [
  v => !!v || 'Имя обязательно',
  v => (v && v.length >= 2) || 'Минимум 2 символа'
]

const emailRules = [
  v => !!v || 'Email обязателен',
  v => /.+@.+\..+/.test(v) || 'Email некорректен'
]

const newPasswordRules = [
  v => !v || v.length >= 6 || 'Минимум 6 символов'
]

const urlRules = [
  v => !v || /^https?:\/\/.+/.test(v) || 'Некорректная ссылка'
]

const isAdmin = computed(() => {
  return userStore.isAdmin && userStore.isAdmin()
})

const hasChanges = computed(() => {
  const user = userStore.user || {}
  return editForm.value.name !== user.name ||
    editForm.value.email !== user.email ||
    editForm.value.newPassword
})

const realActivities = computed(() => {
  const activities = []
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  
  testResults.slice(0, 5).forEach(result => {
    const date = new Date(result.date)
    const timeAgo = getTimeAgo(date)
    
    activities.push({
      id: result.id || Date.now() + Math.random(),
      text: `Пройден тест "${result.testTitle}" - ${result.percentage}%`,
      time: timeAgo,
      icon: 'mdi-check-circle',
      color: result.percentage >= 60 ? 'success' : 'error'
    })
  })
  
  if (userStore.user?.createdAt) {
    const joinDate = new Date(userStore.user.createdAt)
    activities.push({
      id: 'join',
      text: 'Регистрация в системе',
      time: getTimeAgo(joinDate),
      icon: 'mdi-account-plus',
      color: 'info'
    })
  }
  
  return activities
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
  if (minutes === 0) return '0м'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
}

const getTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} дн. назад`
  } else if (diffHours > 0) {
    return `${diffHours} час. назад`
  } else if (diffMins > 0) {
    return `${diffMins} мин. назад`
  } else {
    return 'только что'
  }
}

const loadUserStats = () => {
  try {
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
    const stats = {
      completedTests: testResults.length,
      averageScore: 0,
      totalTime: 0,
      successRate: 0
    }
    
    if (testResults.length > 0) {
      const totalScore = testResults.reduce((sum, result) => sum + (result.percentage || 0), 0)
      stats.averageScore = Math.round(totalScore / testResults.length)
      
      const totalTime = testResults.reduce((sum, result) => sum + (result.timeSpent || 0), 0)
      stats.totalTime = totalTime
      
      const successfulTests = testResults.filter(result => (result.percentage || 0) >= 60).length
      stats.successRate = Math.round((successfulTests / testResults.length) * 100)
    }
    
    userStats.value = stats
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
  }
}

const updateProfile = async () => {
  if (!editForm.value.name.trim()) {
    showSnackbar('Введите имя', 'error')
    return
  }
  
  if (!editForm.value.email.trim()) {
    showSnackbar('Введите email', 'error')
    return
  }
  
  loading.value = true
  
  try {
    if (userStore.user) {
      const updates = {
        name: editForm.value.name.trim(),
        email: editForm.value.email.trim()
      }
      
      if (editForm.value.newPassword.trim()) {
        updates.password = editForm.value.newPassword.trim()
      }
      
      Object.assign(userStore.user, updates)
      
      localStorage.setItem('currentUser', JSON.stringify(userStore.user))
      
      showSnackbar('Профиль успешно обновлен', 'success')
    }
  } catch (error) {
    showSnackbar('Ошибка при обновлении профиля', 'error')
  } finally {
    loading.value = false
  }
}

const updateAvatar = async () => {
  const avatarUrl = customAvatarUrl.value.trim() || selectedAvatar.value
  if (!avatarUrl) {
    showSnackbar('Выберите аватар или введите ссылку', 'error')
    return
  }
  
  avatarLoading.value = true
  
  try {
    const testImage = new Image()
    testImage.src = avatarUrl
    
    await new Promise((resolve, reject) => {
      testImage.onload = resolve
      testImage.onerror = () => reject(new Error('Не удалось загрузить изображение'))
    })
    
    if (userStore.user) {
      userStore.user.avatar = avatarUrl
      localStorage.setItem('currentUser', JSON.stringify(userStore.user))
      showSnackbar('Аватар успешно обновлен', 'success')
      avatarDialog.value = false
      customAvatarUrl.value = ''
      selectedAvatar.value = null
    }
  } catch (error) {
    showSnackbar('Неверная ссылка на изображение', 'error')
  } finally {
    avatarLoading.value = false
  }
}

const resetForm = () => {
  const user = userStore.user || {}
  editForm.value = {
    name: user.name || '',
    email: user.email || '',
    newPassword: ''
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

const goToDashboard = () => {
  router.push('/dashboard')
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
  color: #d1d5db;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
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
  margin-bottom: 8px;
}

.user-email,
.user-group {
  display: flex;
  align-items: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.stats-section,
.activity-section {
  margin-bottom: 32px;
}

.stats-title,
.activity-title,
.settings-title,
.admin-title {
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

.no-activity {
  text-align: center;
  padding: 40px 20px;
}

.no-activity-text {
  color: #9ca3af;
  margin-bottom: 16px;
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