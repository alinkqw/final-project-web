<template>
  <v-container fluid class="dashboard-container">
    <v-row class="mb-8">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h3 font-weight-bold mb-2 gradient-text">
              Личный кабинет
            </h1>
            <p class="text-body-1 text-grey-lighten-1">
              {{ userStore.user?.name || 'Пользователь' }}, управляйте своими экзаменами
            </p>
          </div>
          <v-btn 
            color="primary" 
            icon="mdi-plus" 
            size="large" 
            @click="showCreateDialog = true"
            class="elevation-4 btn-primary"
          />
        </div>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card 
          class="pa-6 height-100 stats-card" 
          elevation="4" 
          hover
        >
          <div class="d-flex align-center mb-2">
            <v-avatar size="48" color="primary" class="mr-3">
              <v-icon color="white" size="24">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="text-caption text-grey-lighten-1 text-uppercase">{{ stat.title }}</div>
            </div>
          </div>
          <v-progress-linear 
            :model-value="stat.progress" 
            height="6" 
            color="primary" 
            rounded 
            class="mt-3 progress-bar"
            bg-color="rgba(255, 255, 255, 0.1)"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-card class="elevation-8 table-card" rounded="lg">
      <v-card-title class="pa-6 table-header">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div>
            <h2 class="text-h6 font-weight-bold mb-1">Мои экзамены</h2>
            <p class="text-body-2 text-grey-lighten-2 mb-0">
              Все запланированные и пройденные экзамены
            </p>
          </div>
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            density="compact"
            variant="outlined"
            placeholder="Все статусы"
            hide-no-data
            class="max-width-200 dark-select"
            clearable
            color="primary"
          />
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredExams"
        :loading="loading"
        class="pa-4 dark-table"
        hover
        show-current-page
        :items-per-page="10"
      >
        <template #item.status="{ item }">
          <v-chip 
            :color="getStatusColor(item.status)" 
            size="small" 
            class="font-weight-medium status-chip"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.date="{ item }">
          <span class="date-text">{{ formatDate(item.date) }}</span>
        </template>

        <template #item.score="{ item }">
          <div v-if="item.status === 'passed'" class="text-h6 font-weight-bold score-primary">
            {{ item.score }}%
          </div>
          <span v-else class="text-grey-lighten-1">—</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-btn 
                  v-bind="props"
                  icon="mdi-pencil" 
                  size="small" 
                  variant="tonal" 
                  color="primary"
                  class="action-btn"
                  @click="editExam(item)"
                />
              </template>
              <span>Редактировать</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-btn 
                  v-bind="props"
                  icon="mdi-eye" 
                  size="small" 
                  variant="tonal" 
                  color="primary"
                  class="action-btn"
                  @click="viewExam(item)"
                />
              </template>
              <span>Результаты</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-btn 
                  v-bind="props"
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  variant="tonal"
                  class="action-btn"
                  @click="confirmDelete(item)"
                />
              </template>
              <span>Удалить</span>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="primary" class="mb-4">mdi-calendar-check</v-icon>
            <h3 class="text-h6 font-weight-medium mb-2 text-white">Нет запланированных экзаменов</h3>
            <p class="text-grey-lighten-1 mb-4">Создайте первый экзамен для подготовки</p>
            <v-btn color="primary" @click="showCreateDialog = true" class="btn-primary">
              Добавить экзамен
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <v-card class="dialog-card">
        <v-card-title class="d-flex justify-space-between align-center dialog-header">
          <span class="text-h6">{{ editingExam ? 'Редактировать экзамен' : 'Новый экзамен' }}</span>
          <v-btn icon="mdi-close" variant="text" color="white" @click="closeDialog" />
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-form @submit.prevent="saveExam" ref="examForm">
            <v-text-field
              v-model="form.subject"
              label="Предмет *"
              variant="outlined"
              :rules="requiredRule"
              class="mb-4 dark-input"
              color="primary"
              bg-color="rgba(255, 255, 255, 0.05)"
            />
            <v-text-field
              v-model="form.date"
              label="Дата экзамена *"
              type="date"
              variant="outlined"
              :rules="requiredRule"
              class="mb-4 dark-input"
              color="primary"
              bg-color="rgba(255, 255, 255, 0.05)"
            />
            <v-text-field
              v-model.number="form.score"
              label="Ожидаемый балл (%)"
              type="number"
              min="0"
              max="100"
              variant="outlined"
              class="mb-4 dark-input"
              color="primary"
              bg-color="rgba(255, 255, 255, 0.05)"
            />
            <v-select
              v-model="form.status"
              label="Статус *"
              :items="statusOptions"
              variant="outlined"
              :rules="requiredRule"
              class="mb-4 dark-select"
              color="primary"
              bg-color="rgba(255, 255, 255, 0.05)"
            />
            <v-textarea
              v-model="form.notes"
              label="Заметки"
              variant="outlined"
              rows="3"
              class="mb-4 dark-input"
              color="primary"
              bg-color="rgba(255, 255, 255, 0.05)"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 dialog-actions">
          <v-spacer />
          <v-btn variant="tonal" @click="closeDialog" class="cancel-btn">Отмена</v-btn>
          <v-btn 
            color="primary" 
            @click="saveExam" 
            :loading="saving"
            :disabled="!isFormValid"
            class="btn-primary"
          >
            {{ editingExam ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="dialog-card">
        <v-card-title class="text-h6 font-weight-bold dialog-header">
          Удалить экзамен?
        </v-card-title>
        <v-card-text class="text-grey-lighten-1">
          Экзамен "<strong class="text-white">{{ deleteExam?.subject }}</strong>" будет удален навсегда.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="tonal" @click="showDeleteDialog = false" class="cancel-btn">Отмена</v-btn>
          <v-btn color="error" @click="deleteExamConfirmed" :loading="deleting" class="btn-error">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const exams = ref([])
const statusFilter = ref(null)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingExam = ref(null)
const deleteExam = ref(null)

const form = ref({
  subject: '',
  date: '',
  score: null,
  status: 'planned',
  notes: ''
})

const examForm = ref(null)
const requiredRule = [v => !!v || 'Обязательное поле']

// Headers
const headers = [
  { title: 'Предмет', key: 'subject', sortable: true },
  { title: 'Дата', key: 'date', sortable: true },
  { title: 'Статус', key: 'status' },
  { title: 'Балл', key: 'score', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Status options
const statusOptions = [
  { title: 'Запланирован', value: 'planned' },
  { title: 'Пройден', value: 'passed' },
  { title: 'Провален', value: 'failed' }
]

const stats = computed(() => [
  {
    title: 'Всего экзаменов',
    value: exams.value.length,
    icon: 'mdi-calendar',
    progress: 75
  },
  {
    title: 'Запланировано',
    value: exams.value.filter(e => e.status === 'planned').length,
    icon: 'mdi-clock-outline',
    progress: 60
  },
  {
    title: 'Пройдено',
    value: exams.value.filter(e => e.status === 'passed').length,
    icon: 'mdi-check-circle',
    progress: 90
  },
  {
    title: 'Средний балл',
    value: exams.value.filter(e => e.score).length ? 
      Math.round(exams.value.reduce((sum, e) => sum + (e.score || 0), 0) / exams.value.filter(e => e.score).length) + '%' : 
      '—',
    icon: 'mdi-chart-line',
    progress: 85
  }
])

const filteredExams = computed(() => {
  if (!statusFilter.value) return exams.value
  return exams.value.filter(exam => exam.status === statusFilter.value)
})

const isFormValid = computed(() => {
  return form.value.subject && form.value.date && form.value.status
})

onMounted(async () => {
  await loadExams()
})

const loadExams = async () => {
  loading.value = true
  try {
    exams.value = [
      {
        id: 1,
        userId: userStore.user?.id || 2,
        subject: 'Веб-технологии',
        date: '2025-12-20',
        status: 'planned',
        score: null,
        notes: 'Full-stack проект'
      },
      {
        id: 2,
        userId: userStore.user?.id || 2,
        subject: 'Базы данных',
        date: '2025-12-15',
        status: 'passed',
        score: 92,
        notes: 'Отлично!'
      }
    ]
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingExam.value = null
  form.value = { subject: '', date: '', score: null, status: 'planned', notes: '' }
  examForm.value?.resetValidation()
}

const editExam = (exam) => {
  editingExam.value = exam
  form.value = { ...exam }
  showCreateDialog.value = true
}

const saveExam = async () => {
  const { valid } = await examForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (editingExam.value) {

      const index = exams.value.findIndex(e => e.id === editingExam.value.id)
      exams.value[index] = { ...form.value, id: editingExam.value.id }
    } else {
      const newExam = {
        id: Date.now(),
        userId: userStore.user?.id || 2,
        ...form.value
      }
      exams.value.unshift(newExam)
    }
    closeDialog()
  } finally {
    saving.value = false
  }
}

const viewExam = (exam) => {
  console.log('Просмотр:', exam)
}

const confirmDelete = (exam) => {
  deleteExam.value = exam
  showDeleteDialog.value = true
}

const deleteExamConfirmed = async () => {
  deleting.value = true
  try {
    exams.value = exams.value.filter(e => e.id !== deleteExam.value.id)
    showDeleteDialog.value = false
    deleteExam.value = null
  } finally {
    deleting.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    planned: 'blue-darken-2',
    passed: 'primary',
    failed: 'red-darken-2'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  return {
    planned: 'Запланирован',
    passed: 'Пройден',
    failed: 'Провален'
  }[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #0a0f1a 0%, #131a2b 100%);
  min-height: 100vh;
  padding-top: 24px;
  padding-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: white !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(37, 99, 235, 0.2) !important;
  border-color: rgba(59, 130, 246, 0.4);
}


.table-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.table-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.dark-table {
  background: transparent !important;
  color: white !important;
}

.dark-table :deep(th) {
  color: #9ca3af !important;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.2) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2) !important;
}

.dark-table :deep(td) {
  color: #e5e7eb !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
}

.dark-table :deep(.v-data-table__tr:hover) {
  background: rgba(59, 130, 246, 0.05) !important;
}

/* Status chips - синие оттенки */
.status-chip {
  font-weight: 500;
}

/* Score - синий */
.score-primary {
  color: #3b82f6 !important;
}

.date-text {
  color: #d1d5db;
}

/* Action buttons */
.action-btn {
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.2) !important;
  transform: scale(1.1);
}


.dialog-card {
  background: linear-gradient(145deg, #1a2332 0%, #2a3648 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: white !important;
}

.dialog-header {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  color: white !important;
}

.dialog-content {
  background: transparent;
}

.dialog-actions {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}


.dark-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  color: white !important;
}

.dark-input :deep(.v-field):hover {
  border-color: rgba(59, 130, 246, 0.5) !important;
}

.dark-input :deep(.v-field--focused) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.dark-input :deep(.v-label) {
  color: #9ca3af !important;
}

.dark-input :deep(.v-field__input) {
  color: white !important;
}

.dark-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  color: white !important;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
  border: none;
  color: white !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3) !important;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af !important;
}

.btn-error {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
  border: none;
  color: white !important;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Height utilities */
.height-100 {
  height: 100%;
}

.max-width-200 {
  max-width: 200px;
}

.gap-1 :deep(.v-btn) {
  margin-right: 4px;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}
</style>

<style>
/* Global overrides for Vuetify components */
.dark-table .v-data-table-footer {
  background: rgba(0, 0, 0, 0.2) !important;
  color: #9ca3af !important;
  border-top: 1px solid rgba(59, 130, 246, 0.2) !important;
}

.dark-table .v-data-table-footer__items-per-page,
.dark-table .v-data-table-footer__info,
.dark-table .v-data-table-footer__pagination {
  color: #9ca3af !important;
}

.dark-table .v-data-table-footer .v-btn {
  color: #9ca3af !important;
}

.dark-table .v-data-table-footer .v-btn--active {
  color: #3b82f6 !important;
}
</style>