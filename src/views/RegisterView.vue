<template>
  <div class="register-page">
    <!-- ХЕДЕР -->
    <div class="header-section">
      <h1 class="header-title gradient-text">✨ Создать аккаунт</h1>
      <p class="header-subtitle">
        Присоединяйтесь к платформе подготовки к экзаменам
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

    <!-- КАРТОЧКА РЕГИСТРАЦИИ -->
    <div class="register-container">
      <v-card class="register-card gradient-card gradient-border">
        <!-- АВАТАР -->
        <div class="avatar-container">
          <v-avatar 
            size="80" 
            class="register-avatar"
          >
            <v-icon size="40" color="white" icon="mdi-account-plus" />
          </v-avatar>
        </div>

        <!-- АЛЕРТЫ -->
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

        <v-slide-y-transition>
          <v-alert 
            v-if="successMessage" 
            type="success" 
            variant="tonal" 
            class="mb-4 alert-card"
            density="comfortable"
          >
            {{ successMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- ФОРМА -->
        <v-form @submit.prevent="handleRegister" class="register-form">
          <!-- ПОЛЯ ФОРМЫ -->
          <div class="form-grid">
            <!-- ФИО -->
            <div class="form-field">
              <v-text-field
                v-model="name"
                label="ФИО"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                :rules="nameRules"
                density="comfortable"
                required
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>

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

            <!-- ГРУППА -->
            <div class="form-field">
              <v-text-field
                v-model="group"
                label="Группа (необязательно)"
                prepend-inner-icon="mdi-school-outline"
                variant="outlined"
                density="comfortable"
                hide-details
                class="dark-input"
                color="primary"
              />
            </div>

            <!-- ПАРОЛЬ -->
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

            <!-- ПОДТВЕРЖДЕНИЕ ПАРОЛЯ -->
            <div class="form-field">
              <v-text-field
                v-model="confirmPassword"
                label="Подтверждение пароля"
                prepend-inner-icon="mdi-lock-check-outline"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="confirmRules"
                density="comfortable"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                required
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>
          </div>

          <!-- КНОПКА РЕГИСТРАЦИИ -->
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            :disabled="!isFormValid"
            class="register-btn font-weight-bold white--text py-5"
            rounded="lg"
          >
            <template v-if="!loading">
              <v-icon start>mdi-account-plus</v-icon>
              СОЗДАТЬ АККАУНТ
            </template>
            <template v-else>
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
                color="white"
                class="mr-2"
              />
              СОЗДАНИЕ...
            </template>
          </v-btn>

          <!-- СОГЛАШЕНИЕ -->
          <div class="agreement-text">
            Нажимая кнопку, вы соглашаетесь с 
            <a href="#" class="text-primary text-decoration-none">условиями использования</a>
          </div>

          <!-- РАЗДЕЛИТЕЛЬ -->
          <v-divider class="divider" />

          <!-- ССЫЛКА НА ВХОД -->
          <div class="login-link">
            <span class="login-text">Уже есть аккаунт?</span>
            <v-btn 
              variant="text" 
              size="small" 
              class="login-btn font-weight-bold text-primary" 
              @click="goToLogin"
              prepend-icon="mdi-login"
            >
              Войти
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

const name = ref('')
const email = ref('')
const group = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const nameRules = [
  v => !!v || 'Имя обязательно',
  v => v.length >= 2 || 'Минимум 2 символа'
]

const emailRules = [
  v => !!v || 'Email обязателен',
  v => /.+@.+\..+/.test(v) || 'Email некорректен'
]

const passwordRules = [
  v => !!v || 'Пароль обязателен',
  v => v.length >= 6 || 'Минимум 6 символов'
]

const confirmRules = [
  v => !!v || 'Подтверждение пароля обязательно',
  v => v === password.value || 'Пароли не совпадают'
]

const isFormValid = computed(() => {
  return name.value && email.value && password.value && confirmPassword.value &&
    password.value === confirmPassword.value
})

const goToLogin = () => {
  router.push('/login')
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    const userData = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      group: group.value.trim() || ''
    }
    
    const result = await userStore.register(userData)
    
    if (!result.success) {
      errorMessage.value = result.message || 'Ошибка регистрации'
      return
    }
    
    successMessage.value = 'Регистрация успешна! Перенаправляем...'
    
    setTimeout(() => {
      if (result.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }, 1500)
    
  } catch (e) {
    errorMessage.value = 'Ошибка регистрации. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР */
.register-page {
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

/* ХЕДЕР */
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

/* КОНТЕЙНЕР РЕГИСТРАЦИИ */
.register-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* КАРТОЧКА РЕГИСТРАЦИИ */
.register-card {
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

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #0891b2);
  z-index: 1;
}

/* АВАТАР */
.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.register-avatar {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.25),
    0 4px 12px rgba(37, 99, 235, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
}

/* АЛЕРТЫ */
.alert-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
}

/* ФОРМА */
.register-form {
  animation: fadeInUp 0.6s ease-out;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.form-field {
  width: 100%;
}

/* ПОЛЯ ВВОДА - БОЛЕЕ ТЕМНЫЕ */
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

.dark-input :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.dark-input :deep(.v-field--error .v-field__outline) {
  color: #ef4444 !important;
}

/* КНОПКА РЕГИСТРАЦИИ */
.register-btn {
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
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.5s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 25px rgba(37, 99, 235, 0.35),
    0 6px 15px rgba(37, 99, 235, 0.25);
}

.register-btn:hover::before {
  left: 100%;
}

.register-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 4px 12px rgba(37, 99, 235, 0.25),
    0 2px 6px rgba(37, 99, 235, 0.15);
}

.register-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: none !important;
}

/* СОГЛАШЕНИЕ */
.agreement-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin: 24px 0;
  line-height: 1.6;
}

.agreement-text a {
  color: #3b82f6 !important;
  font-weight: 500;
  transition: color 0.2s ease;
}

.agreement-text a:hover {
  color: #60a5fa !important;
  text-decoration: underline;
}

/* РАЗДЕЛИТЕЛЬ */
.divider {
  border-color: rgba(255, 255, 255, 0.06) !important;
  margin: 32px 0;
}

/* ССЫЛКА НА ВХОД */
.login-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.login-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.login-btn {
  color: #3b82f6 !important;
  font-weight: 600;
}

.login-btn:hover {
  color: #60a5fa !important;
}

/* АНИМАЦИИ */
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

/* АДАПТИВНОСТЬ */
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
  
  .register-container {
    padding: 0 16px 40px;
  }
  
  .register-card {
    padding: 32px 24px;
    border-radius: 20px;
  }
  
  .form-grid {
    gap: 16px;
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
  
  .register-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .back-btn {
    width: 100%;
  }
}

/* ТЕМНЫЙ ТЕКСТ ДЛЯ КАРТОЧКИ */
::v-deep(.v-card-title),
::v-deep(.v-card-text),
::v-deep(.v-alert__content) {
  color: #e5e7eb !important;
}

/* ДОПОЛНИТЕЛЬНОЕ ЗАТЕМНЕНИЕ ДЛЯ ЧИТАЕМОСТИ */
.register-card * {
  color: #e5e7eb !important;
}

/* ИКОНКИ */
::v-deep(.v-icon) {
  color: #9ca3af !important;
}

::v-deep(.v-icon.text-primary) {
  color: #3b82f6 !important;
}
</style>