<template>
  <div class="tests-page">
    <div class="header-section">
      <h1 class="header-title gradient-text">🎯 Все тесты</h1>
      <p class="header-subtitle">
        {{ filteredTests.length }} из {{ tests.length }} тестов
      </p>
      <v-btn
        to="/"
        color="primary"
        class="back-btn font-weight-bold rounded-xl"
        size="large"
      >
        ← На главную
      </v-btn>
      
      <v-btn
        v-if="isAdmin"
        color="secondary"
        class="admin-btn font-weight-bold rounded-xl ml-3"
        size="large"
        @click="showAdminPanel = true"
      >
        Админ-панель
      </v-btn>
    </div>

    <div class="search-section">
      <v-card class="search-card dark-card">
        <div class="search-filters">
          <v-text-field
            v-model="searchQuery"
            label=" Поиск тестов"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="search-input dark-input"
            clearable
          />
          <v-select
            v-model="selectedLevel"
            :items="levelOptions"
            label="Все уровни"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="level-select dark-input"
          />
        </div>
      </v-card>
    </div>

    <div class="tests-grid">
      <div
        v-for="test in filteredTests"
        :key="test.id"
        class="test-card-wrapper"
      >
        <v-card
          class="test-card-dark gradient-border"
          @click="openTestModal(test)"
        >
          <div class="card-image-container">
            <v-img
              :src="test.image || fallbackImage"
              height="140"
              cover
              class="card-image"
              @error="onImageError"
            />
            <v-chip
              size="small"
              :color="getLevelColor(test.level)"
              class="level-badge white--text font-weight-bold"
            >
              {{ capitalize(test.level) }}
            </v-chip>
            <v-chip
              v-if="test.isExternal"
              size="x-small"
              color="info"
              class="external-badge white--text font-weight-bold"
            >
              Внешний
            </v-chip>
          </div>

          <div class="card-content">
            <h3 class="card-title light-text">
              {{ test.title }}
            </h3>
            <p class="card-subtitle light-text">
              {{ test.subtitle }}
            </p>

            <div class="card-info">
              <v-chip
                size="x-small"
                color="primary"
                class="font-weight-medium white--text"
              >
                {{ test.questions }} q
              </v-chip>
              <span class="card-time light-text">
                {{ test.timeLimit }} мин
              </span>
            </div>

            <v-btn
              block
              color="primary"
              class="card-btn font-weight-bold white--text"
              size="small"
              @click.stop="openTestModal(test)"
            >
              Пройти тест
            </v-btn>
          </div>
        </v-card>
      </div>
    </div>

    <v-dialog
      v-model="testModal"
      max-width="580"
      max-height="85vh"
      persistent
    >
      <v-card class="test-modal-dark">
        <v-card-title class="modal-title">
          <div class="modal-header">
            <h2 class="modal-title-text light-text">
              {{ selectedTest.title }}
            </h2>
            <v-btn
              icon
              color="grey-lighten-1"
              size="small"
              density="comfortable"
              @click="closeTestModal"
              class="modal-close-btn"
            >
              ✕
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="modal-content">
          <div class="modal-top">
            <v-avatar size="72" class="modal-avatar">
              <v-img
                :src="selectedTest.image || fallbackImage"
                cover
                @error="onImageError"
              />
            </v-avatar>
            <div class="modal-top-text">
              <div class="modal-subtitle light-text">
                {{ selectedTest.subtitle }}
              </div>
              <div class="modal-chips">
                <v-chip
                  :color="getLevelColor(selectedTest.level)"
                  size="small"
                  class="white--text font-weight-medium"
                >
                  {{ capitalize(selectedTest.level) }}
                </v-chip>
                <v-chip
                  color="primary"
                  size="small"
                  class="white--text font-weight-medium"
                >
                  {{ selectedTest.questions }} вопросов
                </v-chip>
                <v-chip
                  color="warning"
                  size="small"
                  class="white--text font-weight-medium"
                >
                  {{ selectedTest.timeLimit }} мин
                </v-chip>
              </div>
            </div>
          </div>

          <div class="modal-description-title light-text">
            Описание теста
          </div>
          <p class="modal-description-text light-text">
            {{ selectedTest.description || 'Подготовьтесь к госэкзамену с этим тестом. Вопросы подобраны по программе и соответствуют формату реального экзамена.' }}
          </p>

          <div class="modal-buttons">
            <v-btn
              v-if="selectedTest.externalUrl"
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="small"
              height="40"
              :href="selectedTest.externalUrl"
              target="_blank"
              @click="closeTestModal"
            >
              Пройти тест онлайн
            </v-btn>
            <v-btn
              v-else
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="small"
              height="40"
              @click="startRealTest"
            >
              Начать тест сейчас
            </v-btn>
            <v-btn
              variant="tonal"
              color="grey-lighten-2"
              class="modal-btn-later font-weight-bold light-text"
              size="small"
              height="40"
              min-width="90"
              @click="closeTestModal"
            >
              Позже
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAdminPanel" max-width="800" persistent @click:outside="closeAdminPanel">
      <v-card class="admin-panel light-card">
        <v-card-title class="admin-title">
          <v-icon color="primary" class="mr-2">mdi-crown</v-icon>
          <span class="dark-text">Админ-панель</span>
          <v-spacer />
          <v-btn icon @click="closeAdminPanel" color="grey-darken-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="admin-info mb-4">
            <p class="dark-text">Вы вошли как администратор: <strong>{{ userStore.user?.email }}</strong></p>
            <p class="text-caption dark-text">Для доступа к админ-панели email должен содержать "admin"</p>
          </div>

          <v-form ref="adminForm" v-model="formValid" class="admin-form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editTest.title"
                  label="Название теста"
                  :rules="[v => !!v || 'Обязательное поле']"
                  required
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editTest.subtitle"
                  label="Подзаголовок"
                  required
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="editTest.questions"
                  label="Количество вопросов"
                  type="number"
                  required
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="editTest.timeLimit"
                  label="Время (мин)"
                  type="number"
                  required
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-select
                  v-model="editTest.level"
                  :items="levelOptions.filter(l => l.value)"
                  label="Уровень сложности"
                  required
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model="editTest.image"
                  label="Ссылка на изображение"
                  placeholder="https://..."
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editTest.description"
                  label="Описание теста"
                  rows="2"
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editTest.externalUrl"
                  label="Ссылка на внешний тест"
                  placeholder="https://..."
                  hint="Оставьте пустым для внутреннего теста"
                  variant="outlined"
                  bg-color="white"
                  class="dark-input-field"
                />
              </v-col>
            </v-row>

            <div class="admin-actions">
              <v-btn
                color="primary"
                @click="saveTest"
                :disabled="!formValid"
              >
                {{ isEditing ? 'Обновить' : 'Добавить' }}
              </v-btn>
              <v-btn
                variant="outlined"
                color="grey-darken-2"
                @click="closeAdminPanel"
                class="ml-2"
              >
                Отмена
              </v-btn>
            </div>
          </v-form>

          <div class="admin-tests-list">
            <h3 class="admin-subtitle dark-text">Управление тестами ({{ tests.length }})</h3>
            <v-table density="compact" class="light-table">
              <thead>
                <tr>
                  <th class="dark-text">Название</th>
                  <th class="dark-text">Вопросы</th>
                  <th class="dark-text">Сложность</th>
                  <th class="dark-text">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="test in tests.slice(0, 10)" :key="test.id">
                  <td class="dark-text">{{ test.title }}</td>
                  <td class="dark-text">{{ test.questions }}</td>
                  <td>
                    <v-chip :color="getLevelColor(test.level)" size="small" class="white--text">
                      {{ capitalize(test.level) }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      icon
                      size="x-small"
                      @click="editExistingTest(test)"
                      class="mr-2"
                      color="primary"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      @click="deleteTest(test.id)"
                      color="error"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="tests.length > 10">
                  <td colspan="4" class="text-center">
                    <v-chip color="grey-lighten-2">
                      И ещё {{ tests.length - 10 }} тестов...
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const tests = ref([])
const searchQuery = ref('')
const selectedLevel = ref(null)
const testModal = ref(false)
const selectedTest = ref({})
const showAdminPanel = ref(false)
const formValid = ref(false)
const adminForm = ref(null)
const isEditing = ref(false)

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'

const levelOptions = [
  { title: 'Все уровни', value: null },
  { title: 'Легкие', value: 'easy' },
  { title: 'Средние', value: 'medium' },
  { title: 'Сложные', value: 'hard' }
]

const editTest = ref({
  id: null,
  title: '',
  subtitle: '',
  questions: 10,
  timeLimit: 30,
  level: 'medium',
  image: '',
  description: '',
  externalUrl: ''
})

const isAdmin = computed(() => {
  const user = userStore.user
  if (!user) return false
  return user.email && user.email.toLowerCase().includes('admin')
})

const filteredTests = computed(() =>
  tests.value.filter(test => {
    const q = searchQuery.value?.toLowerCase() || ''
    const matchesSearch =
      !q ||
      test.title?.toLowerCase().includes(q) ||
      test.subtitle?.toLowerCase().includes(q)
    const matchesLevel = !selectedLevel.value || test.level === selectedLevel.value
    return matchesSearch && matchesLevel
  })
)

onMounted(async () => {
  userStore.loadUser()
  
  try {
    const res = await axios.get('https://6937d58d4618a71d77cdc83e.mockapi.io/users')
    tests.value = res.data.map((test, index) => {
      const externalUrls = [
        'https://learn.javascript.ru/quiz',
        'https://spacelab-academy.com/ru/tests/test-javascript/',
        'https://spacelab-academy.com/ru/tests/test-react-js/',
        'https://onlinetestpad.com/ru/tests/python',
        'https://use-web.ru/tests.php',
        'https://math100.ru/oge-2025/',
        'https://silvertests.ru/',
        'https://stepik.org/course/219443/promo',
        'https://gordeevaln.ru/ege_test',
        'https://proforientator.ru/tests/',
        'https://www.123test.com/iq-test/',
        'https://www.cambridgeenglish.org/test-your-english/'
      ]
      
      const levelDescriptions = {
        easy: 'Базовый тест для начинающих. Поможет проверить фундаментальные знания.',
        medium: 'Тест средней сложности. Подходит для подготовки к экзаменам.',
        hard: 'Сложный тест для продвинутых пользователей. Проверяет глубокие знания.'
      }
      
      return {
        id: test.id,
        title: test.title,
        subtitle: test.subtitle,
        questions: parseInt(test.questionCount) || 10,
        timeLimit: parseInt(test.timeLimit) || 30,
        level: test.level || 'medium',
        image: getTestImage(index),
        description: levelDescriptions[test.level] || 'Подготовьтесь к госэкзамену с этим тестом.',
        externalUrl: externalUrls[index % externalUrls.length],
        isExternal: true
      }
    })
  } catch (e) {
    createDemoTests()
  }
})

const createDemoTests = () => {
  const externalUrls = [
    'https://learn.javascript.ru/quiz',
    'https://spacelab-academy.com/ru/tests/test-javascript/',
    'https://spacelab-academy.com/ru/tests/test-react-js/',
    'https://onlinetestpad.com/ru/tests/python',
    'https://use-web.ru/tests.php',
    'https://math100.ru/oge-2025/',
    'https://stepik.org/course/219443/promo',
    'https://gordeevaln.ru/ege_test',
    'https://proforientator.ru/tests/',
    'https://www.123test.com/iq-test/',
    'https://www.cambridgeenglish.org/test-your-english/',
    'https://silvertests.ru/'
  ]

  for (let i = 1; i <= 46; i++) {
    const levelIndex = i % 3
    const level = ['easy', 'medium', 'hard'][levelIndex]
    
    const levelDescriptions = {
      easy: 'Базовый тест для начинающих. Поможет проверить фундаментальные знания.',
      medium: 'Тест средней сложности. Подходит для подготовки к экзаменам.',
      hard: 'Сложный тест для продвинутых пользователей. Проверяет глубокие знания.'
    }
    
    tests.value.push({
      id: i,
      title: `Тест по программированию ${i}`,
      subtitle: `Подготовка к экзамену по информатике ${i}`,
      questions: 10 + (i % 20),
      timeLimit: 30 + (i % 30),
      level: level,
      image: getTestImage(i),
      description: levelDescriptions[level] || 'Подготовьтесь к госэкзамену с этим тестом.',
      externalUrl: externalUrls[i % externalUrls.length],
      isExternal: true
    })
  }
}

const openTestModal = test => {
  selectedTest.value = test
  testModal.value = true
}

const closeTestModal = () => {
  testModal.value = false
}

const startRealTest = () => {
  closeTestModal()
  router.push(`/tests/${selectedTest.value.id}`)
}

const getTestImage = index => {
  const images = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80'
  ]
  const url = images[index % images.length]
  return url || fallbackImage
}

const onImageError = event => {
  const img = event?.target
  if (!img) return
  if (img.dataset.fallbackApplied === 'true') return
  img.src = fallbackImage
  img.dataset.fallbackApplied = 'true'
}

const getLevelColor = level => {
  const colors = { easy: 'success', medium: 'warning', hard: 'error' }
  return colors[level] || 'grey'
}

const capitalize = str =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const editExistingTest = (test) => {
  editTest.value = { ...test }
  isEditing.value = true
  showAdminPanel.value = true
}

const saveTest = () => {
  if (isEditing.value) {
    const index = tests.value.findIndex(t => t.id === editTest.value.id)
    if (index !== -1) {
      tests.value[index] = { 
        ...editTest.value,
        isExternal: !!editTest.value.externalUrl
      }
    }
  } else {
    const newId = tests.value.length > 0 ? Math.max(...tests.value.map(t => t.id)) + 1 : 1
    editTest.value.id = newId
    editTest.value.isExternal = !!editTest.value.externalUrl
    tests.value.unshift({ ...editTest.value })
  }
  
  localStorage.setItem('admin_tests', JSON.stringify(tests.value))
  
  resetForm()
  closeAdminPanel()
}

const deleteTest = (id) => {
  if (confirm('Удалить этот тест?')) {
    tests.value = tests.value.filter(test => test.id !== id)
    localStorage.setItem('admin_tests', JSON.stringify(tests.value))
  }
}

const resetForm = () => {
  editTest.value = {
    id: null,
    title: '',
    subtitle: '',
    questions: 10,
    timeLimit: 30,
    level: 'medium',
    image: '',
    description: '',
    externalUrl: ''
  }
  isEditing.value = false
}

const closeAdminPanel = () => {
  showAdminPanel.value = false
  resetForm()
}
</script>

<style scoped>
.tests-page {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
  position: absolute;
  left: 0;
}

.header-section,
.search-section,
.tests-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  padding-top: 60px;
  padding-bottom: 40px;
}

.header-title {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.5rem;
  color: #cbd5e1;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 32px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white !important;
}

.admin-btn {
  padding: 8px 32px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white !important;
}

.dark-card {
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.search-card {
  border-radius: 16px;
  padding: 32px;
}

.search-filters {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.level-select {
  min-width: 180px;
}

.dark-input :deep(.v-field) {
  background: rgba(15, 23, 42, 0.8) !important;
  color: #f8fafc !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.dark-input :deep(.v-field__input) {
  color: #f8fafc !important;
}

.dark-input :deep(.v-label) {
  color: #94a3b8 !important;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding-bottom: 60px;
}

.test-card-wrapper {
  height: 100%;
}

.test-card-dark {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border: 1px solid transparent;
  border-radius: 24px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.1))
      padding-box,
    linear-gradient(135deg, #3b82f6, #06b6d4) border-box;
  border: 1px solid transparent;
}

.test-card-dark:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.card-image-container {
  position: relative;
  height: 140px;
}

.card-image {
  border-radius: 20px 20px 0 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.level-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.external-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(37, 99, 235, 0.9);
}

.card-content {
  padding: 20px;
}

.light-text {
  color: #f8fafc !important;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.card-subtitle {
  font-size: 0.75rem;
  margin-bottom: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 34px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-time {
  font-size: 0.75rem;
  font-weight: 500;
}

.card-btn {
  border-radius: 16px;
  font-weight: 700;
}

.test-modal-dark {
  background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin: 24px auto;
}

.modal-title {
  padding: 20px 24px 12px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.modal-title-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.modal-close-btn {
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  transition: transform 0.15s ease, background 0.15s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: rgba(30, 41, 59, 1);
  transform: scale(1.05);
}

.modal-content {
  padding: 0 24px 24px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-top {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  padding-top: 20px;
}

.modal-avatar {
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-top-text {
  flex: 1;
  min-width: 0;
}

.modal-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.4;
}

.modal-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-description-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.modal-description-text {
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #cbd5e1;
}

.modal-buttons {
  display: flex;
  gap: 16px;
}

.modal-btn-start {
  flex: 1;
  border-radius: 20px;
}

.modal-btn-later {
  border-radius: 20px;
}

.admin-panel {
  border-radius: 20px !important;
  background: white !important;
}

.admin-title {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 20px 20px 0 0 !important;
  border-bottom: 1px solid #e2e8f0;
}

.dark-text {
  color: #1e293b !important;
}

.admin-info {
  padding: 15px;
  background: #f1f5f9;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
}

.admin-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.dark-input-field :deep(.v-field) {
  background: white !important;
  color: #1e293b !important;
  border-color: #cbd5e1 !important;
}

.dark-input-field :deep(.v-field__input) {
  color: #1e293b !important;
}

.dark-input-field :deep(.v-label) {
  color: #475569 !important;
}

.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.admin-tests-list {
  margin-top: 30px;
  max-height: 400px;
  overflow-y: auto;
}

.admin-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.light-table {
  background: white !important;
}

.light-table :deep(th) {
  background: #f8fafc !important;
  color: #475569 !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.light-table :deep(td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

@media (max-width: 1200px) {
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-section,
  .search-section,
  .tests-grid {
    padding: 32px 16px;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-input,
  .level-select {
    width: 100%;
  }
  
  .modal-top {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .modal-chips {
    justify-content: center;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-section,
  .search-section,
  .tests-grid {
    padding: 24px 12px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1.125rem;
  }
  
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .search-card {
    padding: 24px;
  }
  
  .card-title {
    font-size: 0.875rem;
  }
  
  .admin-panel {
    margin: 10px;
  }
}
</style>