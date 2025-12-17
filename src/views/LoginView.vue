<template>
  <div class="login-page">
    <!-- ХЕДЕР -->
    <div class="header-section">
      <h1 class="header-title gradient-text">Вход в аккаунт</h1>
      <p class="header-subtitle">
        Войдите, чтобы начать подготовку к экзамену
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

    <div class="login-container">
      <v-card class="login-card gradient-card gradient-border">
        <!-- АВАТАР -->
        <div class="avatar-container">
          <v-avatar 
            size="80" 
            class="login-avatar"
          >
            <v-icon size="40" color="white" icon="mdi-login" />
          </v-avatar>
        </div>

        <v-slide-y-transition>
          <v-alert 
            v-if="errorMessage" 
            type="error" 
            variant="tonal" 
            class="mb-4 alert-card"
            density="comfortable"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>

        <v-form @submit.prevent="handleLogin" class="login-form">
          <!-- EMAIL -->
          <div class="form-field">
            <v-text-field
              v-model="email"
              label="Email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              :rules="emailRules"
              density="comfortable"
              required
              hide-details="auto"
              class="dark-input"
              color="primary"
            />
          </div>

          <div class="form-field">
            <v-text-field
              v-model="password"
              label="Пароль"
              prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              :rules="passwordRules"
              density="comfortable"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              required
              hide-details="auto"
              class="dark-input"
              color="primary"
            />
          </div>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            :disabled="!isFormValid"
            class="login-btn font-weight-bold white--text py-5"
            rounded="lg"
          >
            <template v-if="!loading">
              <v-icon start>mdi-login</v-icon>
              ВОЙТИ В АККАУНТ
            </template>
            <template v-else>
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
                color="white"
                class="mr-2"
              />
              ВХОД...
            </template>
          </v-btn>

          <v-divider class="divider" />

          <div class="demo-section">
            <p class="demo-title">Демо доступ:</p>
            <div class="demo-buttons">
              <v-btn
                @click="loginDemo('student')"
                variant="tonal"
                size="small"
                color="primary"
                :loading="loadingDemo === 'student'"
                class="demo-btn font-weight-medium"
              >
                 Студент
              </v-btn>
              <v-btn
                @click="loginDemo('admin')"
                variant="tonal"
                size="small"
                color="warning"
                :loading="loadingDemo === 'admin'"
                class="demo-btn font-weight-medium"
              >
                 Админ
              </v-btn>
            </div>
          </div>

          <v-divider class="divider" />

          <!-- ССЫЛКА НА РЕГИСТРАЦИЮ -->
          <div class="register-link">
            <span class="register-text">Нет аккаунта?</span>
            <v-btn 
              variant="text" 
              size="small" 
              class="register-btn font-weight-bold text-primary" 
              @click="goToRegister"
              prepend-icon="mdi-account-plus"
            >
              Зарегистрироваться
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const loadingDemo = ref(null)
const errorMessage = ref('')

const emailRules = [
  v => !!v || 'Email обязателен',
  v => /.+@.+\..+/.test(v) || 'Email некорректен'
]

const passwordRules = [
  v => !!v || 'Пароль обязателен',
  v => v.length >= 6 || 'Минимум 6 символов'
]

const isFormValid = computed(() => {
  return email.value && password.value && 
    emailRules.every(rule => rule(email.value) === true) &&
    passwordRules.every(rule => rule(password.value) === true)
})

const goToRegister = () => {
  router.push('/register')
}

const loginDemo = async (role) => {
  loadingDemo.value = role
  
  if (role === 'student') {
    email.value = 'student@example.com'
    password.value = '123456'
  } else {
    email.value = 'admin@example.com'
    password.value = 'admin123'
  }
  
  await new Promise(resolve => setTimeout(resolve, 300))
  await handleLogin()
  loadingDemo.value = null
}

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  
  try {
    const result = await userStore.checkLogin(email.value, password.value)
    
    if (!result.success) {
      errorMessage.value = result.message || 'Неверный email или пароль'
      return
    }
    
    router.push('/')
    
  } catch (e) {
    errorMessage.value = 'Ошибка входа. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
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
  max-width: 1200px;
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

.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.login-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%);
  border-radius: 24px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))
      padding-box,
    linear-gradient(135deg, #2563eb, #0891b2) border-box;
  border: 1px solid transparent;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #0891b2);
  z-index: 1;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.login-avatar {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.25),
    0 4px 12px rgba(37, 99, 235, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
}

.alert-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
}

.login-form {
  animation: fadeInUp 0.6s ease-out;
}

.form-field {
  width: 100%;
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

.login-btn {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  border: none;
  border-radius: 12px;
  box-shadow: 
    0 8px 20px rgba(37, 99, 235, 0.25),
    0 4px 8px rgba(37, 99, 235, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: #ffffff !important;
  font-weight: 700;
  margin-top: 8px;
  margin-bottom: 32px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 25px rgba(37, 99, 235, 0.35),
    0 6px 15px rgba(37, 99, 235, 0.25);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 4px 12px rgba(37, 99, 235, 0.25),
    0 2px 6px rgba(37, 99, 235, 0.15);
}

.login-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: none !important;
}

.divider {
  border-color: rgba(255, 255, 255, 0.06) !important;
  margin: 32px 0;
}

.demo-section {
  margin-bottom: 32px;
}

.demo-title {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.demo-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-btn {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.demo-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.register-text {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.register-btn {
  color: #3b82f6 !important;
  font-weight: 600;
}

.register-btn:hover {
  color: #60a5fa !important;
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

@media (max-width: 768px) {
  .header-section {
    padding: 40px 16px 32px;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .header-subtitle {
    font-size: 1.125rem;
    color: #9ca3af;
  }
  
  .login-container {
    padding: 0 16px 40px;
  }
  
  .login-card {
    padding: 32px 24px;
    border-radius: 20px;
  }
  
  .demo-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .demo-btn {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 32px 12px 24px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
    color: #9ca3af;
  }
  
  .login-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .back-btn {
    width: 100%;
  }
  
  .demo-btn {
    width: 100%;
  }
}

::v-deep(.v-card-title),
::v-deep(.v-card-text),
::v-deep(.v-alert__content) {
  color: #e5e7eb !important;
}

.login-card * {
  color: #e5e7eb !important;
}

::v-deep(.v-icon) {
  color: #9ca3af !important;
}

::v-deep(.v-icon.text-primary) {
  color: #3b82f6 !important;
}
</style>