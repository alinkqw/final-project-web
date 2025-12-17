<template>
  <div class="admin-page">
    <div class="header-section">
      <h1 class="header-title gradient-text"> Панель администратора</h1>
      <p class="header-subtitle">
        Управление пользователями и системой подготовки к экзаменам
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

    <div class="stats-container">
      <div class="stats-grid">
        <v-card class="stat-card gradient-card gradient-border">
          <div class="stat-content">
            <v-avatar size="56" class="stat-avatar blue-gradient">
              <v-icon size="32" color="white">mdi-account-group</v-icon>
            </v-avatar>
            <div class="stat-info">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">Всего пользователей</div>
            </div>
          </div>
        </v-card>

        <v-card class="stat-card gradient-card gradient-border">
          <div class="stat-content">
            <v-avatar size="56" class="stat-avatar blue-gradient">
              <v-icon size="32" color="white">mdi-account-check</v-icon>
            </v-avatar>
            <div class="stat-info">
              <div class="stat-number">{{ activeUsers }}</div>
              <div class="stat-label">Активных сегодня</div>
            </div>
          </div>
        </v-card>

        <v-card class="stat-card gradient-card gradient-border">
          <div class="stat-content">
            <v-avatar size="56" class="stat-avatar blue-gradient">
              <v-icon size="32" color="white">mdi-shield-account</v-icon>
            </v-avatar>
            <div class="stat-info">
              <div class="stat-number">{{ adminUsers }}</div>
              <div class="stat-label">Администраторов</div>
            </div>
          </div>
        </v-card>

        <v-card class="stat-card gradient-card gradient-border">
          <div class="stat-content">
            <v-avatar size="56" class="stat-avatar blue-gradient">
              <v-icon size="32" color="white">mdi-account-school</v-icon>
            </v-avatar>
            <div class="stat-info">
              <div class="stat-number">{{ studentUsers }}</div>
              <div class="stat-label">Студентов</div>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div class="content-container">
      <v-card class="content-card gradient-card gradient-border">
        <!-- ЗАГОЛОВОК ТАБЛИЦЫ -->
        <div class="table-header">
          <div class="table-title">
            <h2 class="title">
              <v-icon left color="primary">mdi-account-group</v-icon>
              Список пользователей
            </h2>
            <p class="subtitle">
              Все зарегистрированные пользователи системы
            </p>
          </div>
          
          <div class="table-actions">
            <div class="search-field">
              <v-text-field
                v-model="searchQuery"
                placeholder="Поиск по имени или email..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                class="dark-input"
              />
            </div>
            <v-btn 
              color="primary" 
              prepend-icon="mdi-refresh" 
              @click="loadUsers"
              class="refresh-btn"
            >
              Обновить
            </v-btn>
          </div>
        </div>

        <v-divider class="divider" />

        <div class="table-wrapper">
          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :loading="loading"
            hover
            class="dark-table"
          >
            <template #loading>
              <div class="loading-container">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <span class="loading-text">Загрузка пользователей...</span>
              </div>
            </template>

            <template #item.name="{ item }">
              <div class="user-cell">
                <v-avatar size="36" :class="item.role === 'admin' ? 'admin-avatar' : 'user-avatar'">
                  <v-icon v-if="item.role === 'admin'" color="white" size="20">mdi-shield</v-icon>
                  <v-icon v-else color="white" size="20">mdi-account</v-icon>
                </v-avatar>
                <div class="user-info">
                  <div class="user-name">{{ item.name }}</div>
                  <div class="user-email">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template #item.group="{ item }">
              <v-chip 
                v-if="item.group" 
                size="small" 
                class="group-chip"
              >
                {{ item.group }}
              </v-chip>
              <span v-else class="empty-value">—</span>
            </template>

            <template #item.role="{ item }">
              <v-chip
                :class="item.role === 'admin' ? 'admin-chip' : 'user-chip'"
                size="small"
                :prepend-icon="item.role === 'admin' ? 'mdi-shield' : 'mdi-account'"
                class="role-chip"
              >
                {{ item.role === 'admin' ? 'Администратор' : 'Студент' }}
              </v-chip>
            </template>

            <template #item.createdAt="{ item }">
              <div class="date-cell">
                {{ formatDate(item.createdAt) }}
              </div>
            </template>

            <template #item.lastLogin="{ item }">
              <div class="date-cell">
                <span v-if="item.lastLogin">
                  {{ formatDate(item.lastLogin) }}
                </span>
                <span v-else class="empty-value">—</span>
              </div>
            </template>

            <template #item.actions="{ item }">
              <div class="actions-cell">
                <v-btn
                  size="small"
                  variant="tonal"
                  @click="editUser(item)"
                  icon
                  class="action-btn edit-btn"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  @click="deleteUser(item)"
                  icon
                  class="action-btn delete-btn"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>

            <template #no-data>
              <div class="no-data">
                <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-account-off</v-icon>
                <div class="no-data-title">Пользователи не найдены</div>
                <p class="no-data-text">Зарегистрируйтесь, чтобы увидеть пользователей</p>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card class="edit-dialog gradient-card gradient-border">
        <div class="dialog-header">
          <span class="dialog-title">Редактирование пользователя</span>
          <v-btn icon @click="showEditDialog = false" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <v-card-text>
          <v-form v-model="formValid" @submit.prevent="saveUser" class="edit-form">
            <div class="form-field">
              <v-text-field
                v-model="editForm.name"
                label="Имя"
                variant="outlined"
                required
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>
            
            <div class="form-field">
              <v-text-field
                v-model="editForm.email"
                label="Email"
                variant="outlined"
                required
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>
            
            <div class="form-field">
              <v-text-field
                v-model="editForm.group"
                label="Группа"
                variant="outlined"
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>
            
            <div class="form-field">
              <v-select
                v-model="editForm.role"
                label="Роль"
                :items="roles"
                variant="outlined"
                required
                hide-details="auto"
                class="dark-input"
                color="primary"
              />
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn 
            @click="showEditDialog = false" 
            class="cancel-btn"
          >
            Отмена
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveUser" 
            :loading="saving"
            class="save-btn"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar 
      v-model="showSnackbar" 
      :color="snackbarColor" 
      location="top right"
      class="snackbar"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn icon @click="showSnackbar = false" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')

const showEditDialog = ref(false)
const editForm = ref({})
const formValid = ref(false)
const saving = ref(false)

const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const headers = [
  { title: 'Пользователь', key: 'name', sortable: true },
  { title: 'Группа', key: 'group', sortable: true },
  { title: 'Роль', key: 'role', sortable: true },
  { title: 'Дата регистрации', key: 'createdAt', sortable: true },
  { title: 'Последний вход', key: 'lastLogin', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false, align: 'end' }
]

const roles = [
  { title: 'Студент', value: 'user' },
  { title: 'Администратор', value: 'admin' }
]


const totalUsers = computed(() => users.value.length)
const adminUsers = computed(() => users.value.filter(u => u.role === 'admin').length)
const studentUsers = computed(() => users.value.filter(u => u.role === 'user').length)
const activeUsers = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return users.value.filter(u => {
    if (!u.lastLogin) return false
    return u.lastLogin.split('T')[0] === today
  }).length
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    (user.group && user.group.toLowerCase().includes(query))
  )
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showNotification = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}

const loadUsers = async () => {
  loading.value = true
  
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    let allUsers = [...registeredUsers]
    
    if (allUsers.length === 0) {
      allUsers = [
        {
          id: 'admin-1',
          name: 'Администратор',
          email: 'admin@example.com',
          password: 'admin123',
          group: 'Админ',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        },
        {
          id: 'student-1',
          name: 'Иванов Иван',
          email: 'student@example.com',
          password: '123456',
          group: 'ИС-21',
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        }
      ]
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers))
    }
    
    const currentUserStr = localStorage.getItem('currentUser')
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr)
      const userExists = allUsers.some(u => u.email === currentUser.email)
      
      if (!userExists && currentUser.email) {
        allUsers.push({
          id: currentUser.id || Date.now().toString(),
          name: currentUser.name || 'Текущий пользователь',
          email: currentUser.email,
          group: currentUser.group || 'Не указана',
          role: currentUser.role || 'user',
          createdAt: currentUser.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        })
      }
    }
    
    users.value = allUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      group: user.group,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount || 0
    }))
    
    showNotification(`Загружено ${users.value.length} пользователей`)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error)
    showNotification('Ошибка загрузки пользователей', 'error')
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  editForm.value = { ...user }
  showEditDialog.value = true
}

const saveUser = async () => {
  saving.value = true
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    
    const updatedUsers = registeredUsers.map(u => {
      if (u.email === editForm.value.email) {
        return {
          ...u,
          name: editForm.value.name,
          group: editForm.value.group,
          role: editForm.value.role
        }
      }
      return u
    })
    
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
    
    users.value = users.value.map(u => {
      if (u.email === editForm.value.email) {
        return {
          ...u,
          name: editForm.value.name,
          group: editForm.value.group,
          role: editForm.value.role
        }
      }
      return u
    })
    
    showNotification('Пользователь обновлен')
    showEditDialog.value = false
    
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showNotification('Ошибка сохранения', 'error')
  } finally {
    saving.value = false
  }
}

const deleteUser = (user) => {
  if (!confirm(`Удалить пользователя "${user.name}" (${user.email})?`)) return
  
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const filteredUsers = registeredUsers.filter(u => u.email !== user.email)
    localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers))
    
    users.value = users.value.filter(u => u.email !== user.email)
    
    showNotification('Пользователь удален', 'warning')
    
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showNotification('Ошибка удаления', 'error')
  }
}

onMounted(() => {
  loadUsers()
  
  const currentUser = userStore.user
  if (!currentUser || currentUser.role !== 'admin') {
    console.log('⚠️ Нет прав администратора!')
  }
})
</script>

<style scoped>
.admin-page {
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

.stats-container {
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.3);
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))
      padding-box,
    linear-gradient(135deg, #2563eb, #0891b2) border-box;
  border: 1px solid transparent;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-avatar {
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.25),
    0 4px 12px rgba(37, 99, 235, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
}

.blue-gradient {
  background: linear-gradient(135deg, #2563eb, #0891b2);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.content-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%);
  border-radius: 24px;
  padding: 32px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
}

.table-title {
  flex: 1;
  min-width: 300px;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
}

.table-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  min-width: 300px;
}

.refresh-btn {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  color: #ffffff !important;
}

.divider {
  border-color: rgba(255, 255, 255, 0.06) !important;
  margin: 24px 0;
}

/* ТАБЛИЦА */
.table-wrapper {
  overflow-x: auto;
}

.dark-table {
  background: transparent !important;
}

.dark-table :deep(.v-data-table-header) {
  background: rgba(10, 15, 26, 0.6);
}

.dark-table :deep(.v-data-table-header__content) {
  color: #9ca3af !important;
  font-weight: 600;
  font-size: 0.875rem;
}

.dark-table :deep(.v-data-table__tr) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dark-table :deep(.v-data-table__tr:hover) {
  background: rgba(255, 255, 255, 0.03) !important;
}

.dark-table :deep(.v-data-table__td) {
  color: #e5e7eb !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.user-avatar {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #ffffff;
}

.user-email {
  font-size: 0.75rem;
  color: #9ca3af;
}

.group-chip {
  background: rgba(37, 99, 235, 0.15) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.admin-chip {
  background: rgba(220, 38, 38, 0.15) !important;
  color: #f87171 !important;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.user-chip {
  background: rgba(37, 99, 235, 0.15) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.empty-value {
  color: #6b7280;
  font-style: italic;
}

.date-cell {
  font-size: 0.875rem;
  color: #d1d5db;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.edit-btn:hover {
  background: rgba(37, 99, 235, 0.15) !important;
  border-color: #2563eb !important;
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.15) !important;
  border-color: #dc2626 !important;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
}

.loading-text {
  color: #9ca3af;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 48px;
}

.no-data-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 8px;
}

.no-data-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.edit-dialog {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%) !important;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.close-btn {
  color: #9ca3af !important;
}

.edit-form {
  padding: 0 24px;
}

.form-field {
  margin-bottom: 20px;
}

.dialog-actions {
  padding: 16px 24px 24px;
}

.cancel-btn {
  color: #9ca3af !important;
}

.save-btn {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
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
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}

.dark-input :deep(.v-field--focused) {
  background: rgba(10, 15, 26, 0.9);
  border-color: #2563eb;
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
  color: #2563eb !important;
}

.snackbar {
  font-weight: 500;
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
  }
  
  .stats-container,
  .content-container {
    padding: 0 16px 40px;
  }
  
  .content-card {
    padding: 24px;
    border-radius: 20px;
  }
  
  .table-header {
    flex-direction: column;
  }
  
  .table-title,
  .table-actions {
    width: 100%;
  }
  
  .search-field {
    min-width: 100%;
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
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-card {
    padding: 20px 16px;
    border-radius: 16px;
  }
  
  .back-btn,
  .refresh-btn {
    width: 100%;
  }
}

::v-deep(.v-card-title),
::v-deep(.v-card-text),
::v-deep(.v-alert__content) {
  color: #e5e7eb !important;
}

::v-deep(.v-icon) {
  color: #9ca3af !important;
}

::v-deep(.v-icon.text-primary) {
  color: #2563eb !important;
}
</style>