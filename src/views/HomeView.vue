<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-logo">
            <v-icon color="blue-lighten-2" size="40" class="mr-3">mdi-certificate</v-icon>
            <div>
              <p class="hero-kicker">Онлайн‑платформа подготовки</p>
              <h1 class="hero-title">Гос<span class="text-blue-lighten-2">Экзамен</span></h1>
            </div>
          </div>
          <p class="hero-description">
            Интеллектуальная система подготовки к государственным экзаменам. 
            AI-помощник анализирует ваши результаты и даёт персонализированные рекомендации.
          </p>
          <div class="hero-buttons">
            <v-btn 
              color="blue-lighten-2" 
              class="text-none font-weight-bold rounded-lg" 
              size="large" 
              @click="$router.push('/tests')"
            >
              Начать подготовку
            </v-btn>
            <v-btn 
              v-if="isLoggedIn && !isAdmin"
              color="primary"
              variant="outlined" 
              class="text-none font-weight-bold rounded-lg" 
              size="large"
              @click="goToDashboard"
            >
              Личный кабинет
            </v-btn>
            <v-btn 
              v-if="isLoggedIn && isAdmin"
              color="cyan"
              variant="outlined" 
              class="text-none font-weight-bold rounded-lg" 
              size="large"
              @click="goToDashboard"
              prepend-icon="mdi-shield-account"
            >
              Админ панель
            </v-btn>
            <v-btn 
              v-if="!isLoggedIn"
              color="primary"
              variant="outlined" 
              class="text-none font-weight-bold rounded-lg" 
              size="large"
              @click="$router.push('/login')"
              prepend-icon="mdi-login"
            >
              Войти в систему
            </v-btn>
          </div>
        </div>
        
        <div class="hero-stats">
          <v-card class="stat-card">
            <v-icon size="3" color="blue-lighten-2" class="mb-3">mdi-test-tube</v-icon>
            <div class="stat-number">{{ allTests.length }}+</div>
            <div class="stat-label">Тестовых заданий</div>
          </v-card>
          
          <v-card class="stat-card">
            <v-icon size="3" color="green-lighten-2" class="mb-3">mdi-brain</v-icon>
            <div class="stat-number">AI</div>
            <div class="stat-label">Умный помощник</div>
          </v-card>
          
          <v-card class="stat-card">
            <v-icon size="3" color="purple-lighten-2" class="mb-3">mdi-chart-timeline</v-icon>
            <div class="stat-number">{{ userTestsCompleted }}</div>
            <div class="stat-label">Ваших результатов</div>
          </v-card>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-content">
        <div class="info-text">
          <h2 class="section-title">Платформа <span class="text-blue-lighten-2">ГосЭкзамен</span></h2>
          <p class="info-description">
            Современная образовательная экосистема, объединяющая технологии искусственного интеллекта 
            и адаптивное обучение для эффективной подготовки к государственным экзаменам.
          </p>
          <div class="info-features">
            <div class="feature">
              <v-icon color="green" size="20" class="mr-2">mdi-check-circle</v-icon>
              <span>AI-анализ результатов в реальном времени</span>
            </div>
            <div class="feature">
              <v-icon color="green" size="20" class="mr-2">mdi-check-circle</v-icon>
              <span>Персонализированные планы подготовки</span>
            </div>
            <div class="feature">
              <v-icon color="green" size="20" class="mr-2">mdi-check-circle</v-icon>
              <span>Детальная статистика прогресса</span>
            </div>
            <div class="feature">
              <v-icon color="green" size="20" class="mr-2">mdi-check-circle</v-icon>
              <span>Интеграция с учебными программами</span>
            </div>
          </div>
        </div>
        <div class="info-visual">
          <v-img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
            height="300"
            cover
            class="rounded-lg"
          />
        </div>
      </div>
    </div>

    <div class="nav-section">
      <h2 class="section-title">Быстрый доступ</h2>
      <p class="section-subtitle">Все инструменты для эффективной подготовки в одном месте</p>
      
      <div class="nav-cards">
        <v-card 
          class="nav-card"
          @click="$router.push('/tests')"
          v-for="card in navigationCards"
          :key="card.id"
        >
          <h3 class="nav-title">{{ card.title }}</h3>
          <p class="nav-description">{{ card.description }}</p>
          <div class="nav-stats" v-if="card.stats">
            <v-chip size="x-small" :color="card.color" variant="outlined">{{ card.stats }}</v-chip>
          </div>
          <div class="nav-arrow">
            <v-icon size="20" color="grey-lighten-1">mdi-chevron-right</v-icon>
          </div>
        </v-card>
      </div>
    </div>

    <div class="tests-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Популярные тесты</h2>
          <p class="section-subtitle">
            Начните с самых эффективных заданий для подготовки
            <v-btn 
              variant="text" 
              color="blue-lighten-2" 
              to="/tests" 
              class="inline-btn ml-2"
              size="small"
            >
              Все тесты ({{ allTests.length }})
            </v-btn>
          </p>
        </div>
        <div class="search-filters">
          <v-text-field
            v-model="searchQuery"
            label="Поиск тестов"
            variant="outlined"
            density="compact"
            hide-details
            class="search-input"
            clearable
            prepend-inner-icon="mdi-magnify"
          />
          <v-select
            v-model="selectedLevel"
            :items="levelOptions"
            label="Уровень сложности"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="level-select"
          />
        </div>
      </div>

      <div class="tests-grid">
        <div
          v-for="test in filteredTests.slice(0, 6)"
          :key="test.id"
          class="test-card-wrapper"
        >
          <v-card
            class="test-card"
            :class="{
              'completed': test.userScore !== null,
              [`level-${test.level}`]: true
            }"
            @click="openTestModal(test)"
          >
            <div class="card-header">
              <div class="card-badges">
                <v-chip
                  size="x-small"
                  :color="getLevelColor(test.level)"
                  class="level-badge"
                >
                  {{ getLevelLabel(test.level) }}
                </v-chip>
                <v-chip
                  v-if="test.userScore !== null"
                  size="x-small"
                  :color="getScoreColor(test.userScore)"
                  class="score-badge"
                >
                  {{ test.userScore }}%
                </v-chip>
              </div>
              <v-img
                :src="test.image || fallbackImage"
                height="120"
                cover
                class="card-image"
                @error="onImageError"
              />
            </div>

            <div class="card-content">
              <h3 class="card-title">
                {{ test.title }}
              </h3>
              <p class="card-subtitle">
                {{ test.subtitle }}
              </p>

              <div class="card-info">
                <div class="info-item">
                  <v-icon size="16" color="grey-lighten-1">mdi-help-circle</v-icon>
                  <span>{{ test.questions }} вопросов</span>
                </div>
                <div class="info-item">
                  <v-icon size="16" color="grey-lighten-1">mdi-clock</v-icon>
                  <span>{{ test.timeLimit }} мин</span>
                </div>
              </div>

              <div class="card-actions">
                <v-btn
                  v-if="test.userScore === null"
                  block
                  :color="getLevelColor(test.level)"
                  class="card-btn"
                  size="small"
                  variant="tonal"
                  @click.stop="openTestModal(test)"
                >
                  <v-icon left size="small">mdi-play</v-icon>
                  Начать тест
                </v-btn>
                <div v-else class="results-buttons">
                  <v-btn
                    block
                    color="success"
                    class="card-btn mb-1"
                    size="small"
                    variant="tonal"
                    @click.stop="viewTestResults(test)"
                  >
                    <v-icon left size="small">mdi-chart-box</v-icon>
                    Результаты
                  </v-btn>
                  <v-btn
                    block
                    :color="getLevelColor(test.level)"
                    variant="text"
                    class="card-btn"
                    size="small"
                    @click.stop="retryTest(test)"
                  >
                    <v-icon left size="small">mdi-reload</v-icon>
                    Повторить
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">Почему выбирают нашу платформу</h2>
      <p class="section-subtitle">Инновационный подход к подготовке с использованием технологий AI</p>
      
      <div class="features-grid">
        <v-card class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="feature-icon" :style="{ background: feature.bgColor }">
            <v-icon :color="feature.iconColor" size="28">{{ feature.icon }}</v-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </v-card>
      </div>
    </div>

    <div class="stats-section" v-if="isLoggedIn">
      <v-card class="stats-card">
        <div class="stats-header">
          <v-avatar size="48" class="mr-3">
            <v-icon color="white">mdi-account-circle</v-icon>
          </v-avatar>
          <div>
            <div class="stats-title">Привет, {{ user?.name }}!</div>
            <div class="stats-subtitle">
              <v-chip :color="isAdmin ? 'cyan' : 'blue'" size="x-small" class="mr-2">
                {{ isAdmin ? 'АДМИНИСТРАТОР' : 'СТУДЕНТ' }}
              </v-chip>
              <span v-if="user?.group">Группа: {{ user.group }}</span>
            </div>
          </div>
        </div>
        
        <v-divider class="my-4" />
        
        <div class="stats-progress">
          <div class="progress-info">
            <span class="progress-label">Общий прогресс</span>
            <span class="progress-value">{{ overallProgress }}%</span>
          </div>
          <v-progress-linear 
            :model-value="overallProgress" 
            height="8" 
            color="blue-lighten-2" 
            rounded 
            class="mt-1"
          />
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <v-icon color="green" size="20" class="mr-2">mdi-check-circle</v-icon>
            <div>
              <div class="stat-number">{{ completedTestsCount }}</div>
              <div class="stat-label">Пройдено тестов</div>
            </div>
          </div>
          <div class="stat-item">
            <v-icon color="blue" size="20" class="mr-2">mdi-trending-up</v-icon>
            <div>
              <div class="stat-number">{{ averageScore }}%</div>
              <div class="stat-label">Средний результат</div>
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="testModal" max-width="580">
      <v-card class="test-modal">
        <v-card-title class="modal-header">
          <div class="modal-title-section">
            <v-chip :color="getLevelColor(selectedTest.level)" size="small" class="mb-2">
              {{ getLevelLabel(selectedTest.level) }}
            </v-chip>
            <h2 class="modal-title">{{ selectedTest.title }}</h2>
          </div>
          <v-btn icon @click="closeTestModal" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-content">
          <div class="modal-info">
            <v-img
              :src="selectedTest.image || fallbackImage"
              height="160"
              cover
              class="rounded-lg mb-4"
            />
            
            <div class="modal-stats">
              <div class="stat">
                <v-icon size="20" color="blue">mdi-help-circle</v-icon>
                <div>
                  <div class="stat-value">{{ selectedTest.questions }}</div>
                  <div class="stat-label">вопросов</div>
                </div>
              </div>
              <div class="stat">
                <v-icon size="20" color="amber">mdi-clock</v-icon>
                <div>
                  <div class="stat-value">{{ selectedTest.timeLimit }}</div>
                  <div class="stat-label">минут</div>
                </div>
              </div>
            </div>

            <p class="modal-description">
              {{ selectedTest.description || 'Тест для подготовки к государственному экзамену. Вопросы составлены по официальной программе и соответствуют формату реального экзамена.' }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-btn
            color="blue-lighten-2"
            block
            size="large"
            class="modal-btn-start"
            @click="startRealTest"
            prepend-icon="mdi-play"
          >
            Начать тест
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import testsData from '@/data/tests.json'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated())
const isAdmin = computed(() => userStore.isAdmin && userStore.isAdmin())

const allTests = ref([])
const searchQuery = ref('')
const selectedLevel = ref(null)
const testModal = ref(false)
const selectedTest = ref({})

const levelOptions = [
  { title: 'Все уровни', value: null },
  { title: 'Легкий', value: 'easy' },
  { title: 'Средний', value: 'medium' },
  { title: 'Сложный', value: 'hard' }
]

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'

const filteredTests = computed(() => {
  return allTests.value.filter(test => {
    const q = searchQuery.value?.toLowerCase() || ''
    const matchesSearch = !q || 
      test.title?.toLowerCase().includes(q) || 
      test.subtitle?.toLowerCase().includes(q)
    const matchesLevel = !selectedLevel.value || test.level === selectedLevel.value
    return matchesSearch && matchesLevel
  })
})

const userTestsCompleted = computed(() => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]')
    return results.length
  } catch {
    return 0
  }
})

const completedTestsCount = computed(() => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]')
    return results.length
  } catch {
    return 0
  }
})

const averageScore = computed(() => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]')
    if (results.length === 0) return 0
    const total = results.reduce((sum, r) => sum + (r.percentage || 0), 0)
    return Math.round(total / results.length)
  } catch {
    return 0
  }
})

const overallProgress = computed(() => {
  const completed = completedTestsCount.value
  const total = allTests.value.length
  if (total === 0) return 0
  return Math.min(Math.round((completed / total) * 100), 100)
})

const navigationCards = computed(() => [
  {
    id: 1,
    title: 'Все тесты',
    description: 'Полный каталог тестовых заданий',
    icon: 'mdi-book-open-page-variant',
    color: 'blue-lighten-2',
    stats: `${allTests.value.length} тестов`
  },
  {
    id: 2,
    title: isAdmin.value ? 'Админ панель' : 'Личный кабинет',
    description: isAdmin.value ? 'Управление системой' : 'Статистика и прогресс',
    icon: isAdmin.value ? 'mdi-shield-account' : 'mdi-chart-box',
    color: isAdmin.value ? 'cyan' : 'green-lighten-1',
    stats: isAdmin.value ? 'Управление' : 'Аналитика'
  },
  {
    id: 3,
    title: 'История тестов',
    description: 'Архив ваших результатов',
    icon: 'mdi-history',
    color: 'purple-lighten-1',
    stats: `${userTestsCompleted.value} попыток`
  }
])

const features = [
  {
    id: 1,
    title: 'AI-Анализ',
    description: 'Искусственный интеллект анализирует ваши ошибки и предлагает персонализированные рекомендации',
    icon: 'mdi-brain',
    iconColor: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.1)'
  },
  {
    id: 2,
    title: 'Адаптивное обучение',
    description: 'Система подбирает сложность заданий в зависимости от вашего уровня',
    icon: 'mdi-auto-fix',
    iconColor: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.1)'
  },
  {
    id: 3,
    title: 'Детальная статистика',
    description: 'Наглядные графики и отчеты по всем аспектам подготовки',
    icon: 'mdi-chart-areaspline',
    iconColor: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.1)'
  },
  {
    id: 4,
    title: 'Мобильность',
    description: 'Доступ к платформе с любого устройства в любое время',
    icon: 'mdi-cellphone',
    iconColor: '#FF9800',
    bgColor: 'rgba(255, 152, 0, 0.1)'
  }
]

const goToDashboard = () => {
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/dashboard')
  }
}

onMounted(async () => {
  userStore.loadUser()
  await loadTests()
})

const loadTests = async () => {
  try {
    const response = await axios.get('https://6937d58d4618a71d77cdc83e.mockapi.io/users')
    const mockapiData = response.data.slice(0, 46)
    const jsonTests = testsData.tests
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
    
    const cards = []
    
    for (let i = 0; i < 46; i++) {
      const mockapiItem = mockapiData[i] || {}
      const testIndex = i % jsonTests.length
      const baseTest = jsonTests[testIndex]
      const variantNumber = Math.floor(i / jsonTests.length) + 1
      const cardId = i + 1
      
      const cardResult = testResults.find(result => 
        result.cardId == cardId || 
        (result.testId == baseTest.id && result.variantNumber == variantNumber)
      )
      
      cards.push({
        id: cardId,
        title: mockapiItem.title || `${baseTest.title} (Вариант ${variantNumber})`,
        subtitle: getCardSubtitle(baseTest.title),
        questions: baseTest.questionsCount || 15,
        timeLimit: Math.floor((baseTest.timeLimit || 1800) / 60),
        level: mapLevel(baseTest.level),
        image: mockapiItem.avatar || getTestImage(i),
        description: mockapiItem.description || `Вариант ${variantNumber}. ${baseTest.description}`,
        testId: baseTest.id,
        variantNumber: variantNumber,
        userScore: cardResult ? cardResult.percentage : null,
        userResult: cardResult || null
      })
    }
    
    allTests.value = cards
  } catch (error) {
    createFallbackTests()
  }
}

const getCardSubtitle = (title) => {
  const subtitles = {
    'Python': 'Тест по программированию на Python',
    'JavaScript': 'Тест по JavaScript и веб-разработке',
    'HTML/CSS': 'Тест по верстке и стилизации',
    'Алгоритмы': 'Тест по алгоритмам и структурам данных',
    'Базы данных': 'Тест по SQL и базам данных',
    'ЕГЭ': 'Подготовка к единому государственному экзамену'
  }
  
  for (const [key, subtitle] of Object.entries(subtitles)) {
    if (title.includes(key)) return subtitle
  }
  
  return 'Тест для подготовки к экзамену'
}

const mapLevel = (jsonLevel) => {
  const mapping = {
    'новичок': 'easy',
    'средний': 'medium',
    'экзамен': 'hard'
  }
  return mapping[jsonLevel] || 'medium'
}

const createFallbackTests = () => {
  const jsonTests = testsData.tests
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  const cards = []
  
  for (let i = 0; i < 46; i++) {
    const testIndex = i % jsonTests.length
    const baseTest = jsonTests[testIndex]
    const variantNumber = Math.floor(i / jsonTests.length) + 1
    const cardId = i + 1
    
    const cardResult = testResults.find(result => 
      result.cardId == cardId || 
      (result.testId == baseTest.id && result.variantNumber == variantNumber)
    )
    
    cards.push({
      id: cardId,
      title: `${baseTest.title} (Вариант ${variantNumber})`,
      subtitle: getCardSubtitle(baseTest.title),
      questions: baseTest.questionsCount || 15,
      timeLimit: Math.floor((baseTest.timeLimit || 1800) / 60),
      level: mapLevel(baseTest.level),
      image: getTestImage(i),
      description: `Вариант ${variantNumber}. ${baseTest.description}`,
      testId: baseTest.id,
      variantNumber: variantNumber,
      userScore: cardResult ? cardResult.percentage : null,
      userResult: cardResult || null
    })
  }
  
  allTests.value = cards
}

const getTestImage = index => {
  const images = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
  ]
  return images[index % images.length] || fallbackImage
}

const openTestModal = test => {
  selectedTest.value = test
  testModal.value = true
}

const closeTestModal = () => {
  testModal.value = false
}

const startRealTest = () => {
  if (!selectedTest.value.testId) {
    alert('Ошибка: не найден ID теста')
    return
  }
  
  closeTestModal()
  
  router.push({
    path: `/tests/${selectedTest.value.id}`,
    query: {
      title: selectedTest.value.title,
      timeLimit: selectedTest.value.timeLimit,
      testId: selectedTest.value.testId,
      variantNumber: selectedTest.value.variantNumber
    }
  })
}

const viewTestResults = (test) => {
  if (test.userResult) {
    router.push({
      path: `/test-results/card/${test.id}`,
      query: {
        testId: test.testId,
        variantNumber: test.variantNumber
      }
    })
  } else {
    openTestModal(test)
  }
}

const retryTest = (test) => {
  selectedTest.value = test
  testModal.value = true
}

const getLevelColor = level => {
  const colors = { 
    easy: 'green', 
    medium: 'amber', 
    hard: 'deep-orange' 
  }
  return colors[level] || 'grey'
}

const getLevelLabel = level => {
  const labels = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  }
  return labels[level] || 'Средний'
}

const getScoreColor = score => {
  if (score >= 80) return 'green'
  if (score >= 60) return 'amber'
  return 'deep-orange'
}

const onImageError = event => {
  const img = event?.target
  if (!img || img.dataset.fallbackApplied === 'true') return
  img.src = fallbackImage
  img.dataset.fallbackApplied = 'true'
}
</script>

<style scoped>
.home-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: #e5e7eb;
}

.hero-section {
  position: relative;
  padding: 80px 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 70% 30%, rgba(30, 136, 229, 0.15), transparent 50%);
  pointer-events: none;
  animation: pulse 8s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-logo {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-kicker {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-bottom: 4px;
  animation: fadeIn 1s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.1;
  animation: slideUp 0.8s ease-out 0.4s both;
}

.hero-description {
  font-size: 1.125rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 600px;
  animation: fadeIn 1s ease-out 0.6s both;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  animation: fadeIn 1s ease-out 0.8s both;
}

.hero-buttons .v-btn {
  transition: all 0.3s ease;
}

.hero-buttons .v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: slideUp 0.8s ease-out 1s both;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.info-section {
  padding: 80px 20px;
  background: rgba(15, 23, 42, 0.95);
}

.info-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.info-text {
  max-width: 600px;
}

.info-description {
  font-size: 1.125rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 24px;
}

.info-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #cbd5e1;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateX(5px);
}

.info-visual {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

.info-visual:hover {
  transform: perspective(1000px) rotateY(5deg) rotateX(2deg);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

.nav-section,
.tests-section,
.features-section,
.stats-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 2px;
  animation: slideIn 1s ease-out;
}

@keyframes slideIn {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

.section-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 40px;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.nav-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.nav-card:nth-child(1) { animation-delay: 0.1s; }
.nav-card:nth-child(2) { animation-delay: 0.2s; }
.nav-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.nav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.8), transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.nav-card:hover::before {
  transform: scaleX(1);
}

.nav-icon {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.nav-card:hover .nav-icon {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.12);
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
}

.nav-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 16px;
  flex-grow: 1;
  line-height: 1.5;
}

.nav-stats {
  margin-top: 8px;
}

.nav-arrow {
  position: absolute;
  top: 28px;
  right: 28px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.nav-card:hover .nav-arrow {
  opacity: 1;
  transform: translateX(5px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  gap: 24px;
}

.search-filters {
  display: flex;
  gap: 16px;
  min-width: 400px;
}

.search-input,
.level-select {
  min-width: 200px;
}

.search-input :deep(.v-field),
.level-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.search-input :deep(.v-field:hover),
.level-select :deep(.v-field:hover) {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-2px);
}

.search-input :deep(.v-field__input),
.level-select :deep(.v-field__input) {
  color: #ffffff;
}

.search-input :deep(.v-label),
.level-select :deep(.v-label) {
  color: #94a3b8;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.test-card-wrapper {
  height: 100%;
  animation: fadeIn 0.5s ease-out;
  animation-fill-mode: both;
}

.test-card-wrapper:nth-child(1) { animation-delay: 0.1s; }
.test-card-wrapper:nth-child(2) { animation-delay: 0.2s; }
.test-card-wrapper:nth-child(3) { animation-delay: 0.3s; }
.test-card-wrapper:nth-child(4) { animation-delay: 0.4s; }
.test-card-wrapper:nth-child(5) { animation-delay: 0.5s; }
.test-card-wrapper:nth-child(6) { animation-delay: 0.6s; }

.test-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  height: 100%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.test-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.test-card:hover::before {
  opacity: 1;
}

.test-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.test-card.completed {
  border-color: rgba(76, 175, 80, 0.3);
}

.card-header {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.test-card:hover .card-image {
  transform: scale(1.1);
}

.card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.level-badge,
.score-badge {
  backdrop-filter: blur(8px);
  font-weight: 600;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-actions {
  margin-top: auto;
}

.card-btn {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(10deg);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.5;
}

.stats-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.4s ease;
}

.stats-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.stats-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.stats-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-progress {
  margin-bottom: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.progress-value {
  font-size: 1rem;
  font-weight: 600;
  color: #60a5fa;
  animation: countUp 1s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.test-modal {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  animation: modalSlide 0.3s ease-out;
}

@keyframes modalSlide {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.modal-content {
  padding: 24px !important;
}

.modal-info {
  margin-bottom: 24px;
}

.modal-stats {
  display: flex;
  gap: 32px;
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modal-stats:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.modal-description {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

.modal-actions {
  padding: 16px 24px 24px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-btn-start {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-logo {
    justify-content: center;
  }
  
  .info-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .info-features {
    align-items: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filters {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .hero-section,
  .info-section,
  .nav-section,
  .tests-section,
  .features-section,
  .stats-section {
    padding: 60px 16px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
  }
  
  .nav-cards {
    grid-template-columns: 1fr;
  }
  
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filters {
    flex-direction: column;
  }
  
  .search-input,
  .level-select {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-stats {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
  }
  
  .hero-buttons .v-btn {
    width: 100%;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .nav-card {
    padding: 20px;
  }
  
  .nav-icon {
    width: 40px;
    height: 40px;
  }
  
  .nav-title {
    font-size: 1.125rem;
  }
}
</style>