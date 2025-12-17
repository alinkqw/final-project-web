<template>
  <div class="admin-profile-view">
    <v-container fluid class="pa-4 pa-md-6">
      <v-row>
        <v-col cols="12">
          <ProfileComponent :is-admin="true" />
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="actions-card pa-4">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon icon="mdi-tools" class="mr-2" />
              Управление системой
            </h3>
            <v-divider class="mb-4" />
            <div class="actions-grid">
              <v-btn
                to="/admin"
                color="primary"
                variant="flat"
                class="action-btn"
                size="large"
              >
                <v-icon icon="mdi-account-group" class="mr-2" />
                Управление пользователями
              </v-btn>
              
              <v-btn
                to="/tests"
                color="success"
                variant="flat"
                class="action-btn"
                size="large"
              >
                <v-icon icon="mdi-plus-circle" class="mr-2" />
                Управление тестами
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- ИНФОРМАЦИЯ О СИСТЕМЕ -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="info-card pa-4">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon icon="mdi-information" class="mr-2" />
              Информация о системе
            </h3>
            <v-divider class="mb-4" />
            
            <div class="info-grid">
              <div class="info-item">
                <v-icon icon="mdi-account-group" color="primary" class="mr-3" />
                <div>
                  <div class="info-label">Всего пользователей</div>
                  <div class="info-value">{{ totalUsers }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon icon="mdi-file-document-multiple" color="success" class="mr-3" />
                <div>
                  <div class="info-label">Всего тестов</div>
                  <div class="info-value">{{ totalTests }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon icon="mdi-shield-crown" color="warning" class="mr-3" />
                <div>
                  <div class="info-label">Ваша роль</div>
                  <div class="info-value">Администратор</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ProfileComponent from '@/components/ProfileComponent.vue'

const router = useRouter()
const userStore = useUserStore()

const totalUsers = ref(0)
const totalTests = ref(0)

const isAdmin = computed(() => {
  return userStore.user?.role === 'admin'
})

const loadStats = () => {
  try {

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    totalUsers.value = users.length
    

    const tests = JSON.parse(localStorage.getItem('admin_tests') || '[]')
    totalTests.value = tests.length || 46
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
    totalUsers.value = 25
    totalTests.value = 46
  }
}

onMounted(() => {
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  
  loadStats()
})
</script>

<style scoped>
.admin-profile-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0f1a 0%, #1a1f35 100%);
  color: #e2e8f0;
}

.actions-card,
.info-card {
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.actions-card {
  border-color: rgba(37, 99, 235, 0.3);
}

.info-card {
  border-color: rgba(16, 185, 129, 0.3);
}


.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.action-btn {
  border-radius: 12px;
  height: 56px;
  justify-content: flex-start;
  padding-left: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.5);
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.info-label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

@media (max-width: 768px) {
  .actions-grid,
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-btn {
    justify-content: center;
    padding-left: 16px;
  }
  
  .info-item {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .admin-profile-view {
    padding: 12px;
  }
  
  .action-btn {
    height: 50px;
    font-size: 0.9rem;
  }
  
  .info-value {
    font-size: 1.25rem;
  }
}
</style>