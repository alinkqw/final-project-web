<template>
  <div class="admin-tests-page">
    <div class="admin-header">
      <v-btn to="/tests" color="primary" class="back-btn">
        <v-icon left>mdi-arrow-left</v-icon>
        Назад к тестам
      </v-btn>
      
      <div class="header-content">
        <h1 class="admin-title">Админ-панель: Управление тестами</h1>
        <p class="admin-subtitle">
          Создавайте, редактируйте и удаляйте тесты. Всего тестов: {{ tests.length }}
        </p>
      </div>
      
      <v-btn color="success" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Создать тест
      </v-btn>
    </div>

    <!-- Фильтры -->
    <v-card class="filter-card">
      <div class="filter-controls">
        <v-text-field
          v-model="searchQuery"
          label="🔍 Поиск тестов"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
          clearable
        />
        
        <v-select
          v-model="selectedCategory"
          :items="categories"
          label="Категория"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="category-select"
        />
      </div>
    </v-card>

    <!-- Таблица тестов -->
    <v-card class="tests-table-card">
      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p>Загружаем тесты...</p>
      </div>
      
      <template v-else>
        <v-table hover>
          <thead>
            <tr>
              <th class="text-left" width="60">ID</th>
              <th class="text-left">Название теста</th>
              <th class="text-left" width="120">Вопросы</th>
              <th class="text-left" width="120">Время</th>
              <th class="text-left" width="120">Сложность</th>
              <th class="text-left" width="120">Статус</th>
              <th class="text-left" width="180">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="test in filteredTests" 
              :key="test.id"
              :class="{ 'active-row': test.id === editingTest.id }"
            >
              <td class="text-center font-weight-bold">
                {{ test.id }}
              </td>
              <td>
                <div class="test-info">
                  <div class="test-title">{{ test.title }}</div>
                  <div class="test-subtitle">{{ test.subtitle }}</div>
                  <div class="test-category">
                    <v-chip size="x-small" color="info" variant="outlined">
                      {{ test.category }}
                    </v-chip>
                  </div>
                </div>
              </td>
              <td class="text-center">
                {{ test.questions }}
              </td>
              <td class="text-center">
                {{ test.timeLimit }} мин
              </td>
              <td>
                <v-chip
                  :color="getLevelColor(test.level)"
                  size="small"
                  class="white--text"
                >
                  {{ capitalize(test.level) }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  :color="getStatusColor(test)"
                  size="small"
                  variant="outlined"
                >
                  {{ getStatusText(test) }}
                </v-chip>
              </td>
              <td>
                <div class="action-buttons">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    @click="editTest(test)"
                    class="mr-2"
                  >
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                  
                  <v-btn
                    size="small"
                    color="warning"
                    variant="tonal"
                    @click="duplicateTest(test)"
                    class="mr-2"
                  >
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
                  
                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    @click="deleteTest(test.id)"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        
        <div v-if="filteredTests.length === 0 && !loading" class="no-tests">
          <v-icon size="64" color="grey">mdi-file-question</v-icon>
          <h3>Тесты не найдены</h3>
          <p>Создайте первый тест или измените условия поиска</p>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Создать тест
          </v-btn>
        </div>
      </template>
    </v-card>

    <!-- Диалог редактирования -->
    <v-dialog v-model="showDialog" max-width="800" persistent>
      <v-card class="edit-dialog">
        <v-card-title class="dialog-title">
          <v-icon left>{{ editingTest.id ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingTest.id ? 'Редактирование теста' : 'Создание нового теста' }}
          <v-spacer />
          <v-btn icon @click="closeDialog" color="grey">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="testForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <h3 class="section-title">Основная информация</h3>
              </v-col>
              
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="editingTest.title"
                  label="Название теста *"
                  :rules="[v => !!v || 'Обязательное поле']"
                  required
                  variant="outlined"
                  placeholder="Например: Основы Python для начинающих"
                />
              </v-col>
              
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editingTest.questions"
                  label="Количество вопросов *"
                  type="number"
                  :rules="[v => !!v || 'Обязательное поле', v => v > 0 || 'Минимум 1 вопрос']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editingTest.subtitle"
                  label="Краткое описание"
                  variant="outlined"
                  rows="2"
                  placeholder="Краткое описание, которое видно в карточке теста"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editingTest.description"
                  label="Полное описание теста"
                  variant="outlined"
                  rows="3"
                  placeholder="Подробное описание теста, которое показывается в модальном окне"
                />
              </v-col>

              <v-col cols="12">
                <h3 class="section-title">Настройки теста</h3>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editingTest.timeLimit"
                  label="Время на прохождение (минут) *"
                  type="number"
                  :rules="[v => !!v || 'Обязательное поле', v => v > 0 || 'Минимум 1 минута']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="editingTest.level"
                  :items="levelOptions"
                  label="Уровень сложности *"
                  :rules="[v => !!v || 'Обязательное поле']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="editingTest.category"
                  :items="categories"
                  label="Категория *"
                  :rules="[v => !!v || 'Обязательное поле']"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <h3 class="section-title">Изображение теста</h3>
              </v-col>
              
              <v-col cols="12">
                <div class="image-preview-section">
                  <div class="image-preview">
                    <v-img
                      :src="editingTest.image || fallbackImage"
                      height="120"
                      width="200"
                      cover
                      class="preview-image"
                      @error="onImageError"
                    />
                  </div>
                  
                  <v-text-field
                    v-model="editingTest.image"
                    label="URL изображения"
                    variant="outlined"
                    placeholder="https://example.com/image.jpg"
                    class="image-url-field"
                  />
                  
                  <div class="preset-images">
                    <p class="preset-label">Или выберите из готовых:</p>
                    <div class="image-options">
                      <div
                        v-for="(img, index) in presetImages"
                        :key="index"
                        class="image-option"
                        :class="{ 'selected': editingTest.image === img }"
                        @click="editingTest.image = img"
                      >
                        <v-img
                          :src="img"
                          height="60"
                          width="80"
                          cover
                          class="option-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12">
                <v-checkbox
                  v-model="editingTest.isExternal"
                  label="Внешний тест (ссылка на другой сайт)"
                  color="primary"
                  hide-details
                />
              </v-col>
              
              <v-col cols="12" v-if="editingTest.isExternal">
                <v-text-field
                  v-model="editingTest.externalUrl"
                  label="Ссылка на внешний тест *"
                  :rules="[v => !!v || 'Обязательное поле для внешнего теста']"
                  variant="outlined"
                  placeholder="https://example.com/test"
                />
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="editingTest.tags"
                  label="Теги"
                  variant="outlined"
                  multiple
                  chips
                  closable-chips
                  :items="suggestedTags"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeDialog">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveTest"
            :disabled="!formValid"
          >
            {{ editingTest.id ? 'Сохранить изменения' : 'Создать тест' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">Подтверждение удаления</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить тест "{{ testToDelete?.title }}"?
          <br>
          <span class="text-caption text-grey">Это действие нельзя отменить.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" @click="confirmDelete">
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Статистика -->
    <div class="admin-stats">
      <v-card class="stat-card">
        <v-card-title class="stat-title">
          <v-icon left color="primary">mdi-chart-bar</v-icon>
          Статистика тестов
        </v-card-title>
        <v-card-text>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ tests.length }}</div>
              <div class="stat-label">Всего тестов</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ activeTestsCount }}</div>
              <div class="stat-label">Активных</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ easyTestsCount }}</div>
              <div class="stat-label">Легких</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ externalTestsCount }}</div>
              <div class="stat-label">Внешних</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import testsData from '@/data/tests.json'

const router = useRouter()
const userStore = useUserStore()
const testForm = ref(null)

const tests = ref([])
const loading = ref(false)
const saving = ref(false)

const showDialog = ref(false)
const showDeleteDialog = ref(false)
const formValid = ref(false)

const searchQuery = ref('')
const selectedCategory = ref(null)

const editingTest = ref({
  id: null,
  title: '',
  subtitle: '',
  questions: 15,
  timeLimit: 30,
  level: 'medium',
  category: 'programming',
  image: '',
  description: '',
  isExternal: false,
  externalUrl: '',
  tags: [],
  active: true
})

const testToDelete = ref(null)

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'

const presetImages = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
]

const levelOptions = [
  { title: 'Легкий', value: 'easy' },
  { title: 'Средний', value: 'medium' },
  { title: 'Сложный', value: 'hard' }
]

const categories = [
  'programming',
  'web',
  'frontend',
  'backend',
  'algorithms',
  'databases',
  'exam',
  'general',
  'python',
  'javascript',
  'html-css'
]

const suggestedTags = [
  'python',
  'javascript',
  'html',
  'css',
  'vue',
  'react',
  'algorithms',
  'databases',
  'sql',
  'ege',
  'beginner',
  'advanced',
  'practice',
  'theory'
]

const filteredTests = computed(() => {
  return tests.value.filter(test => {
    const query = searchQuery.value?.toLowerCase() || ''
    const matchesSearch = !query || 
      test.title?.toLowerCase().includes(query) ||
      test.subtitle?.toLowerCase().includes(query) ||
      test.tags?.some(tag => tag.toLowerCase().includes(query))
    
    const matchesCategory = !selectedCategory.value || 
      test.category === selectedCategory.value
    
    return matchesSearch && matchesCategory
  })
})

const activeTestsCount = computed(() => {
  return tests.value.filter(test => test.active).length
})

const easyTestsCount = computed(() => {
  return tests.value.filter(test => test.level === 'easy').length
})

const externalTestsCount = computed(() => {
  return tests.value.filter(test => test.isExternal).length
})

onMounted(async () => {
  // Проверяем права администратора
  if (!userStore.user?.email?.toLowerCase().includes('admin')) {
    router.push('/tests')
    return
  }
  
  await loadTests()
})

const loadTests = async () => {
  try {
    loading.value = true
    console.log('🔄 Загружаем тесты для админ-панели...')
    
    // 1. Пробуем загрузить из основного источника tests.json
    try {
      console.log('📂 Импортируем тесты из tests.json')
      
      if (testsData && testsData.tests && Array.isArray(testsData.tests)) {
        console.log(`✅ Найдено ${testsData.tests.length} тестов в tests.json`)
        
        // Преобразуем в формат для админки
        tests.value = testsData.tests.map(test => {
          // Определяем категорию на основе заголовка
          let category = 'programming'
          if (test.title.includes('Python')) category = 'python'
          if (test.title.includes('JavaScript')) category = 'javascript'
          if (test.title.includes('HTML') || test.title.includes('CSS')) category = 'html-css'
          if (test.title.includes('Алгоритмы')) category = 'algorithms'
          if (test.title.includes('Базы данных')) category = 'databases'
          if (test.title.includes('ЕГЭ')) category = 'exam'
          
          // Определяем уровень
          let level = 'medium'
          if (test.level === 'новичок') level = 'easy'
          if (test.level === 'средний') level = 'medium'
          if (test.level === 'экзамен') level = 'hard'
          
          return {
            id: test.id,
            title: test.title,
            subtitle: test.description,
            questions: test.questions?.length || test.questionsCount || 15,
            timeLimit: Math.floor((test.timeLimit || 1800) / 60), // секунды -> минуты
            level: level,
            category: category,
            image: presetImages[(test.id - 1) % presetImages.length],
            description: test.description,
            isExternal: false,
            externalUrl: '',
            tags: [test.level, test.icon || '📚'],
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
        
        console.log(`✅ Преобразовано ${tests.value.length} тестов для админки`)
        saveTestsToLocalStorage()
        return
      } else {
        console.warn('❌ tests.json не содержит массив tests')
      }
    } catch (importError) {
      console.warn('❌ Ошибка импорта tests.json:', importError)
    }
    
    // 2. Fallback на localStorage
    const savedTests = localStorage.getItem('admin_tests')
    if (savedTests) {
      tests.value = JSON.parse(savedTests)
      console.log('📁 Загружены сохраненные тесты из localStorage:', tests.value.length)
      return
    }
    
    // 3. Fallback на MockAPI
    try {
      await loadFromMockAPI()
      console.log('🌐 Загружены тесты из MockAPI')
    } catch (mockapiError) {
      console.warn('❌ MockAPI не доступен:', mockapiError)
      // 4. Final fallback: начальные тесты
      createInitialTests()
      console.log('📝 Созданы начальные тесты')
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка загрузки тестов:', error)
    createInitialTests()
  } finally {
    loading.value = false
  }
}

const loadFromMockAPI = async () => {
  try {
    const response = await axios.get('https://6937d58d4618a71d77cdc83e.mockapi.io/users')
    const mockapiData = response.data.slice(0, 20)
    
    tests.value = mockapiData.map((item, index) => ({
      id: index + 1,
      title: item.title || `Тест ${index + 1}`,
      subtitle: item.description || `Описание теста ${index + 1}`,
      questions: 15,
      timeLimit: 30,
      level: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
      category: categories[index % categories.length],
      image: item.avatar || presetImages[index % presetImages.length],
      description: item.description || 'Описание теста для админ-панели',
      isExternal: false,
      externalUrl: '',
      tags: ['programming', 'test'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    saveTestsToLocalStorage()
    
  } catch (error) {
    console.error('Ошибка загрузки из MockAPI:', error)
    throw error
  }
}

const createInitialTests = () => {
  tests.value = [
    {
      id: 1,
      title: '🐍 Python: Основы программирования',
      subtitle: 'Базовые концепции и синтаксис Python для начинающих',
      questions: 15,
      timeLimit: 30,
      level: 'easy',
      category: 'python',
      image: presetImages[0],
      description: 'Базовые концепции и синтаксис Python для начинающих',
      isExternal: false,
      externalUrl: '',
      tags: ['python', 'новичок', '🐍'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: '📜 JavaScript: Основы веб-разработки',
      subtitle: 'Основы JavaScript для фронтенд разработки',
      questions: 15,
      timeLimit: 30,
      level: 'easy',
      category: 'javascript',
      image: presetImages[1],
      description: 'Основы JavaScript для фронтенд разработки',
      isExternal: false,
      externalUrl: '',
      tags: ['javascript', 'новичок', '📜'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: '🎨 HTML/CSS: Верстка и стили',
      subtitle: 'Основы HTML разметки и CSS стилизации',
      questions: 15,
      timeLimit: 30,
      level: 'medium',
      category: 'html-css',
      image: presetImages[2],
      description: 'Основы HTML разметки и CSS стилизации',
      isExternal: false,
      externalUrl: '',
      tags: ['html', 'css', 'средний', '🎨'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      title: '⚡ Алгоритмы и структуры данных',
      subtitle: 'Основные алгоритмы и структуры данных',
      questions: 15,
      timeLimit: 40,
      level: 'medium',
      category: 'algorithms',
      image: presetImages[3],
      description: 'Основные алгоритмы и структуры данных',
      isExternal: false,
      externalUrl: '',
      tags: ['алгоритмы', 'средний', '⚡'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      title: '🗄️ Базы данных и SQL',
      subtitle: 'Основы работы с базами данных и SQL запросы',
      questions: 15,
      timeLimit: 35,
      level: 'medium',
      category: 'databases',
      image: presetImages[4],
      description: 'Основы работы с базами данных и SQL запросы',
      isExternal: false,
      externalUrl: '',
      tags: ['базы данных', 'sql', 'средний', '🗄️'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 6,
      title: '🎯 Симулятор ЕГЭ по информатике',
      subtitle: 'Пробный экзамен в формате ЕГЭ',
      questions: 15,
      timeLimit: 120,
      level: 'hard',
      category: 'exam',
      image: presetImages[5],
      description: 'Пробный экзамен в формате ЕГЭ',
      isExternal: false,
      externalUrl: '',
      tags: ['егэ', 'экзамен', 'hard', '🎯'],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  saveTestsToLocalStorage()
}

const saveTestsToLocalStorage = () => {
  localStorage.setItem('admin_tests', JSON.stringify(tests.value))
}

const openCreateDialog = () => {
  editingTest.value = {
    id: null,
    title: '',
    subtitle: '',
    questions: 15,
    timeLimit: 30,
    level: 'medium',
    category: 'programming',
    image: presetImages[0],
    description: '',
    isExternal: false,
    externalUrl: '',
    tags: [],
    active: true
  }
  
  showDialog.value = true
}

const editTest = (test) => {
  editingTest.value = { ...test }
  showDialog.value = true
}

const duplicateTest = (test) => {
  const newId = Math.max(...tests.value.map(t => t.id)) + 1
  
  editingTest.value = {
    ...test,
    id: newId,
    title: `${test.title} (Копия)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  showDialog.value = true
}

const saveTest = async () => {
  if (!formValid.value) return
  
  saving.value = true
  
  try {
    const now = new Date().toISOString()
    
    if (editingTest.value.id) {
      const index = tests.value.findIndex(t => t.id === editingTest.value.id)
      if (index !== -1) {
        tests.value[index] = {
          ...editingTest.value,
          updatedAt: now
        }
      }
    } else {
      const newId = tests.value.length > 0 ? Math.max(...tests.value.map(t => t.id)) + 1 : 1
      
      editingTest.value.id = newId
      editingTest.value.createdAt = now
      editingTest.value.updatedAt = now
      
      tests.value.unshift(editingTest.value)
    }
    
    saveTestsToLocalStorage()
    showDialog.value = false
    resetForm()
    
  } catch (error) {
    console.error('Ошибка сохранения теста:', error)
    alert('Не удалось сохранить тест')
  } finally {
    saving.value = false
  }
}

const deleteTest = (id) => {
  testToDelete.value = tests.value.find(test => test.id === id)
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (!testToDelete.value) return
  
  tests.value = tests.value.filter(test => test.id !== testToDelete.value.id)
  saveTestsToLocalStorage()
  
  showDeleteDialog.value = false
  testToDelete.value = null
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingTest.value = {
    id: null,
    title: '',
    subtitle: '',
    questions: 15,
    timeLimit: 30,
    level: 'medium',
    category: 'programming',
    image: presetImages[0],
    description: '',
    isExternal: false,
    externalUrl: '',
    tags: [],
    active: true
  }
  
  if (testForm.value) {
    testForm.value.reset()
  }
}

const getLevelColor = (level) => {
  const colors = { 
    easy: 'success', 
    medium: 'warning', 
    hard: 'error' 
  }
  return colors[level] || 'grey'
}

const getStatusColor = (test) => {
  if (!test.active) return 'grey'
  return test.level === 'easy' ? 'success' : test.level === 'medium' ? 'warning' : 'error'
}

const getStatusText = (test) => {
  if (!test.active) return 'Неактивен'
  return test.level === 'easy' ? 'Легкий' : test.level === 'medium' ? 'Средний' : 'Сложный'
}

const capitalize = (str) => {
  if (!str) return ''
  if (str === 'easy') return 'Легкий'
  if (str === 'medium') return 'Средний'
  if (str === 'hard') return 'Сложный'
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const onImageError = (event) => {
  const img = event.target
  if (!img || img.dataset.fallbackApplied === 'true') return
  img.src = fallbackImage
  img.dataset.fallbackApplied = 'true'
}
</script>

<style scoped>
.admin-tests-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  padding: 0;
}

.admin-header {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.back-btn {
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.admin-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-subtitle {
  font-size: 1.2rem;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.filter-card {
  max-width: 1400px;
  margin: 0 auto 30px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
}

.filter-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-field {
  flex: 2;
}

.category-select {
  flex: 1;
  min-width: 200px;
}

.tests-table-card {
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
  overflow: hidden;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.loading-state p {
  margin-top: 20px;
  font-size: 1.1rem;
}

.tests-table-card :deep(.v-table) {
  background: transparent !important;
  color: #f8fafc !important;
}

.tests-table-card :deep(th) {
  background: rgba(15, 23, 42, 0.8) !important;
  color: #94a3b8 !important;
  font-weight: 700;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
}

.tests-table-card :deep(td) {
  color: #f8fafc !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.tests-table-card :deep(tr:hover) {
  background: rgba(59, 130, 246, 0.1) !important;
}

.active-row {
  background: rgba(59, 130, 246, 0.2) !important;
}

.test-info {
  min-width: 0;
}

.test-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1rem;
}

.test-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.test-category {
  display: flex;
  gap: 6px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .v-btn {
  min-width: 36px;
  height: 36px;
}

.no-tests {
  text-align: center;
  padding: 60px 20px;
}

.no-tests h3 {
  font-size: 1.5rem;
  margin: 20px 0 10px;
  color: #f8fafc;
}

.no-tests p {
  color: #94a3b8;
  margin-bottom: 30px;
}

/* Диалог редактирования */
.edit-dialog {
  background: linear-gradient(145deg, #1f2937 0%, #111827 100%) !important;
  color: #f8fafc !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px !important;
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #e2e8f0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
}

.image-preview-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-preview {
  display: flex;
  justify-content: center;
}

.preview-image {
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.image-url-field {
  flex: 1;
}

.preset-images {
  margin-top: 16px;
}

.preset-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 12px;
}

.image-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-option {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.image-option:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.image-option.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.option-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-actions {
  padding: 20px 24px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Статистика */
.admin-stats {
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px;
}

.stat-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: 600;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .admin-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-content {
    order: -1;
  }
}

@media (max-width: 768px) {
  .admin-header,
  .filter-card,
  .tests-table-card,
  .admin-stats {
    padding: 30px 16px;
  }
  
  .admin-title {
    font-size: 2rem;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .search-field,
  .category-select {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .admin-header,
  .filter-card,
  .tests-table-card,
  .admin-stats {
    padding: 20px 12px;
  }
  
  .admin-title {
    font-size: 1.75rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .image-options {
    justify-content: center;
  }
}
</style>