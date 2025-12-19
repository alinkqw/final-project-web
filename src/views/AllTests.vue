<template>
  <div class="tests-page">
    <div class="header-section">
      <h1 class="header-title gradient-text">Все тесты</h1>
      <p class="header-subtitle">
        <span v-if="loading" class="loading-text">(загрузка...)</span>
      </p>
      <div class="header-buttons">
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
          @click="goToAdminPanel"
        >
          Админ-панель
        </v-btn>
        
        <v-btn
          color="info"
          class="refresh-btn font-weight-bold rounded-xl ml-3"
          size="large"
          @click="reloadTests"
          :loading="loading"
        >
          <v-icon left>mdi-refresh</v-icon>
          Обновить
        </v-btn>
      </div>
      
      <div class="stats-summary">
        <v-chip color="success" class="mr-2">
          <v-icon left>mdi-check-circle</v-icon>
          Пройдено: {{ completedTestsCount }}
        </v-chip>
        <v-chip color="warning" class="mr-2">
          <v-icon left>mdi-clock</v-icon>
          В процессе: {{ inProgressTestsCount }}
        </v-chip>
        <v-chip color="info">
          <v-icon left>mdi-circle-outline</v-icon>
          Не начато: {{ notStartedTestsCount }}
        </v-chip>
      </div>
    </div>

    <div class="search-section">
      <v-card class="search-card dark-card">
        <div class="search-filters">
          <v-text-field
            v-model="searchQuery"
            label=" Поиск тестов по названию или описанию"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="search-input dark-input"
            clearable
            @input="debouncedSearch"
          />
          <v-select
            v-model="selectedLevel"
            :items="levelOptions"
            label="Все уровни сложности"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="level-select dark-input"
          />
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Все статусы"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="status-select dark-input"
          />
        </div>
      </v-card>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
      />
      <p class="loading-message">Загружаем тесты...</p>
    </div>

    <div v-else class="tests-grid">
      <div
        v-for="(test, index) in paginatedTests"
        :key="test.uniqueId || `${test.testId}-${test.variantNumber}-${index}`"
        class="test-card-wrapper"
      >
        <v-card
          class="test-card-dark gradient-border"
          :class="{ 'completed-card': test.userScore !== null }"
          @click="openTestModal(test)"
        >
          <div class="test-number-badge">
            #{{ test.id || index + 1 }}
          </div>
          
          <div class="card-image-container">
            <v-img
              :src="getUniqueCardImage(test, index)"
              height="140"
              cover
              class="card-image"
              @error="onImageError"
              :lazy-src="fallbackImage"
            />
            <v-chip
              size="small"
              :color="getLevelColor(test.level)"
              class="level-badge white--text font-weight-bold"
            >
              {{ capitalize(test.level) }}
            </v-chip>
            
            <div v-if="test.userScore !== null" class="result-overlay">
              <div class="result-circle" :class="getScoreClass(test.userScore)">
                {{ test.userScore }}%
              </div>
            </div>
          </div>

          <div class="card-content">
            <h3 class="card-title light-text">
              {{ test.title }}
            </h3>
            <p class="card-subtitle light-text">
              {{ test.subtitle }}
              <span class="variant-label">Вариант {{ test.variantNumber }}</span>
            </p>

            <div class="card-info">
              <div class="info-item">
                <v-icon size="small" color="primary">mdi-help-circle</v-icon>
                <span>{{ test.questions }} вопросов</span>
              </div>
              <div class="info-item">
                <v-icon size="small" color="warning">mdi-clock-outline</v-icon>
                <span>{{ test.timeLimit }} мин</span>
              </div>
            </div>

            <div class="card-actions">
              <v-btn
                v-if="test.userScore === null"
                block
                color="primary"
                class="card-btn font-weight-bold white--text"
                size="small"
                @click.stop="openTestModal(test)"
              >
                <v-icon left size="small">mdi-play-circle</v-icon>
                Пройти тест
              </v-btn>
              <div v-else class="results-buttons">
                <v-btn
                  block
                  :color="getScoreColor(test.userScore)"
                  class="card-btn font-weight-bold white--text mb-2"
                  size="small"
                  @click.stop="viewTestResults(test)"
                >
                  <v-icon left size="small">mdi-chart-box</v-icon>
                  Результаты ({{ test.userScore }}%)
                </v-btn>
                <v-btn
                  block
                  color="primary"
                  variant="outlined"
                  class="card-btn font-weight-bold"
                  size="small"
                  @click.stop="retryTest(test)"
                >
                  <v-icon left size="small">mdi-reload</v-icon>
                  Повторить тест
                </v-btn>
              </div>
            </div>
            
            <div class="card-status" :class="getStatusClass(test)">
              <v-icon size="x-small">{{ getStatusIcon(test) }}</v-icon>
              <span>{{ getStatusText(test) }}</span>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div v-if="filteredTests.length > 0" class="pagination-section">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        color="primary"
        @update:model-value="scrollToTop"
      />
      <div class="pagination-info">
        Показано {{ startItem }}-{{ endItem }} из {{ filteredTests.length }} тестов
      </div>
    </div>

    <div v-if="!loading && filteredTests.length === 0" class="no-results">
      <v-icon size="64" color="grey">mdi-magnify-remove</v-icon>
      <h3>Тесты не найдены</h3>
      <p>Попробуйте изменить условия поиска</p>
      <v-btn color="primary" @click="clearFilters">
        <v-icon left>mdi-filter-remove</v-icon>
        Сбросить фильтры
      </v-btn>
    </div>

    <v-dialog
      v-model="testModal"
      max-width="600"
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
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="modal-content">
          <div class="modal-top">
            <v-avatar size="72" class="modal-avatar" rounded>
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
                <v-chip
                  v-if="selectedTest.variantNumber"
                  color="info"
                  size="small"
                  class="white--text font-weight-medium"
                >
                  Вариант {{ selectedTest.variantNumber }}
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
          
          <div v-if="selectedTest.userScore !== null" class="modal-progress">
            <div class="progress-info">
              <v-icon color="success">mdi-check-circle</v-icon>
              <span>Тест уже пройден</span>
            </div>
            <v-progress-linear
              :model-value="selectedTest.userScore"
              height="10"
              :color="getScoreColor(selectedTest.userScore)"
              rounded
              class="mt-2"
            />
            <div class="progress-stats">
              <span>Результат: {{ selectedTest.userScore }}%</span>
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                @click="viewTestResults(selectedTest)"
              >
                Подробнее
              </v-btn>
            </div>
          </div>

          <div class="modal-buttons">
            <v-btn
              v-if="selectedTest.externalUrl"
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="large"
              height="48"
              :href="selectedTest.externalUrl"
              target="_blank"
              @click="closeTestModal"
            >
              <v-icon left>mdi-open-in-new</v-icon>
              Пройти тест онлайн
            </v-btn>
            <v-btn
              v-else
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="large"
              height="48"
              @click="startRealTest"
            >
              <v-icon left>mdi-play</v-icon>
              Начать тест сейчас
            </v-btn>
            <v-btn
              variant="tonal"
              color="grey-lighten-2"
              class="modal-btn-later font-weight-bold light-text"
              size="large"
              height="48"
              @click="closeTestModal"
            >
              <v-icon left>mdi-clock-outline</v-icon>
              Позже
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import testsData from '@/data/tests.json'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const tests = ref([])
const loading = ref(true)

const searchQuery = ref('')
const selectedLevel = ref(null)
const selectedStatus = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'

const levelOptions = [
  { title: 'Все уровни', value: null },
  { title: 'Легкие', value: 'easy' },
  { title: 'Средние', value: 'medium' },
  { title: 'Сложные', value: 'hard' }
]

const statusOptions = [
  { title: 'Все статусы', value: null },
  { title: 'Не начато', value: 'not_started' },
  { title: 'В процессе', value: 'in_progress' },
  { title: 'Пройдено', value: 'completed' }
]

const testModal = ref(false)
const selectedTest = ref({})

const completedTestsCount = computed(() => {
  return tests.value.filter(test => test.userScore !== null).length
})

const inProgressTestsCount = computed(() => {
  return tests.value.filter(test => test.userScore === null && test.lastAttempt).length
})

const notStartedTestsCount = computed(() => {
  return tests.value.filter(test => test.userScore === null && !test.lastAttempt).length
})

const totalPages = computed(() => {
  return Math.ceil(filteredTests.value.length / itemsPerPage)
})

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > filteredTests.value.length ? filteredTests.value.length : end
})

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTests.value.slice(start, end)
})

const filteredTests = computed(() => {
  return tests.value.filter(test => {
    const query = searchQuery.value?.toLowerCase() || ''
    const matchesSearch = !query || 
      test.title?.toLowerCase().includes(query) || 
      test.subtitle?.toLowerCase().includes(query) ||
      test.description?.toLowerCase().includes(query)

    const matchesLevel = !selectedLevel.value || test.level === selectedLevel.value
    
    let matchesStatus = true
    if (selectedStatus.value === 'completed') {
      matchesStatus = test.userScore !== null
    } else if (selectedStatus.value === 'in_progress') {
      matchesStatus = test.userScore === null && test.lastAttempt
    } else if (selectedStatus.value === 'not_started') {
      matchesStatus = test.userScore === null && !test.lastAttempt
    }
    
    return matchesSearch && matchesLevel && matchesStatus
  })
})

const isAdmin = computed(() => {
  const user = userStore.user
  if (!user) return false
  return user.email && user.email.toLowerCase().includes('admin')
})

onMounted(async () => {
  userStore.loadUser()
  await loadTests()
})

const loadTests = async () => {
  try {
    loading.value = true
    
    const response = await axios.get('https://6937d58d4618a71d77cdc83e.mockapi.io/users')
    const mockapiData = response.data
    
    const mockapiItems = mockapiData.slice(0, 46)
    const jsonTests = testsData.tests
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
    
    const cards = []
    
    for (let i = 0; i < 46; i++) {
      const mockapiItem = mockapiItems[i] || {}
      const baseTestIndex = i % 6
      const baseTest = jsonTests[baseTestIndex]
      const variantNumber = Math.floor(i / 6) + 1
      const cardId = i + 1
      
      // Ищем результаты для этой карточки
      const cardResults = testResults.filter(result => 
        result.cardId == cardId || 
        (result.testId == baseTest.id && result.variantNumber == variantNumber)
      )
      
      // Берем последний результат для этой карточки
      const lastResult = cardResults.length > 0 ? cardResults[cardResults.length - 1] : null
      
      const uniqueTest = {
        id: cardId,
        uniqueId: `test-${baseTest.id}-${variantNumber}-${cardId}`,
        title: mockapiItem.title || `${baseTest.title} (Вариант ${variantNumber})`,
        subtitle: mockapiItem.description || getCardSubtitle(baseTest.title),
        questions: baseTest.questionsCount || 15,
        timeLimit: Math.floor((baseTest.timeLimit || 1800) / 60),
        level: mapLevel(baseTest.level),
        image: mockapiItem.avatar || getTestImage(i),
        description: mockapiItem.description || `Вариант ${variantNumber}. ${baseTest.description}`,
        externalUrl: '',
        isExternal: false,
        testId: baseTest.id,
        variantNumber: variantNumber,
        userScore: lastResult ? lastResult.percentage : null,
        userResult: lastResult || null,
        lastAttempt: lastResult?.timestamp || null,
        category: getTestCategory(baseTest.id),
        tags: getTestTags(baseTest.id),
        mockapiData: mockapiItem
      }
      
      cards.push(uniqueTest)
    }
    
    tests.value = cards
    
  } catch (error) {
    console.error('Ошибка загрузки тестов:', error)
    await createFallbackTests()
  } finally {
    loading.value = false
  }
}

const createFallbackTests = async () => {
  const jsonTests = testsData.tests
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  const cards = []
  
  for (let i = 0; i < 46; i++) {
    const baseTestIndex = i % 6
    const baseTest = jsonTests[baseTestIndex]
    const variantNumber = Math.floor(i / 6) + 1
    const cardId = i + 1
    
    const cardResults = testResults.filter(result => 
      result.cardId == cardId || 
      (result.testId == baseTest.id && result.variantNumber == variantNumber)
    )
    
    const lastResult = cardResults.length > 0 ? cardResults[cardResults.length - 1] : null
    
    const card = {
      id: cardId,
      uniqueId: `fallback-${baseTest.id}-${variantNumber}-${cardId}`,
      title: `${baseTest.title} (Вариант ${variantNumber})`,
      subtitle: getCardSubtitle(baseTest.title),
      questions: baseTest.questionsCount || 15,
      timeLimit: Math.floor((baseTest.timeLimit || 1800) / 60),
      level: mapLevel(baseTest.level),
      image: getTestImage(i),
      description: `Вариант ${variantNumber}. ${baseTest.description}`,
      externalUrl: '',
      isExternal: false,
      testId: baseTest.id,
      variantNumber: variantNumber,
      userScore: lastResult ? lastResult.percentage : null,
      userResult: lastResult || null,
      category: getTestCategory(baseTest.id),
      tags: getTestTags(baseTest.id)
    }
    
    cards.push(card)
  }
  
  tests.value = cards
}

const getCardSubtitle = (title) => {
  const subtitles = {
    'Python': 'Тест по основам Python',
    'JavaScript': 'Тест по веб-разработке',
    'HTML/CSS': 'Тест по верстке и стилям',
    'Алгоритмы': 'Тест по алгоритмам и структурам данных',
    'Базы данных': 'Тест по базам данных и SQL',
    'ЕГЭ': 'Симулятор ЕГЭ по информатике'
  }
  
  for (const [key, subtitle] of Object.entries(subtitles)) {
    if (title.includes(key)) return subtitle
  }
  
  return 'Тест по программированию'
}

const mapLevel = (jsonLevel) => {
  const mapping = {
    'новичок': 'easy',
    'средний': 'medium',
    'экзамен': 'hard'
  }
  return mapping[jsonLevel] || 'medium'
}

const getTestImage = (index) => {
  const images = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
  ]
  
  const imageIndex = (index % 6) * 7 + (Math.floor(index / 6) % 7)
  return images[imageIndex % images.length] || fallbackImage
}

const getUniqueCardImage = (test, index) => {
  if (test.image && test.image !== fallbackImage) {
    return test.image
  }
  
  const uniqueSeed = (test.testId * 100 + test.variantNumber) % 1000
  const images = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    'https://images.unsplash.com/photo-1547658719-da2b51169166',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4'
  ]
  
  const imageIndex = (uniqueSeed + index) % images.length
  return `${images[imageIndex]}?w=400&auto=format&fit=crop&q=80&t=${uniqueSeed}`
}

const getTestCategory = (testId) => {
  const categories = {
    1: 'programming',
    2: 'web',
    3: 'frontend',
    4: 'algorithms',
    5: 'databases',
    6: 'exam'
  }
  return categories[testId] || 'general'
}

const getTestTags = (testId) => {
  const tags = {
    1: ['python', 'programming', 'beginner'],
    2: ['javascript', 'web', 'frontend'],
    3: ['html', 'css', 'frontend'],
    4: ['algorithms', 'data-structures', 'advanced'],
    5: ['sql', 'databases', 'backend'],
    6: ['exam', 'ege', 'preparation']
  }
  return tags[testId] || ['programming']
}

const getStatusClass = (test) => {
  if (test.userScore !== null) return 'status-completed'
  if (test.lastAttempt) return 'status-in-progress'
  return 'status-not-started'
}

const getStatusIcon = (test) => {
  if (test.userScore !== null) return 'mdi-check-circle'
  if (test.lastAttempt) return 'mdi-progress-clock'
  return 'mdi-circle-outline'
}

const getStatusText = (test) => {
  if (test.userScore !== null) return 'Пройдено'
  if (test.lastAttempt) return 'В процессе'
  return 'Не начато'
}

const openTestModal = (test) => {
  selectedTest.value = test
  testModal.value = true
}

const closeTestModal = () => {
  testModal.value = false
  selectedTest.value = {}
}

const startRealTest = () => {
  const test = selectedTest.value
  
  if (!test.testId) {
    alert('Ошибка: не найден ID теста')
    return
  }
  
  closeTestModal()
  
  router.push({
    path: `/tests/${test.id}`,
    query: {
      title: test.title,
      timeLimit: test.timeLimit,
      testId: test.testId,
      variantNumber: test.variantNumber
    }
  })
}

const viewTestResults = (test) => {
  console.log('Просмотр результатов для теста:', test)
  
  // Ищем все результаты для этой карточки
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  console.log('Всего результатов в localStorage:', testResults.length)
  
  // Ищем результаты для этой карточки
  const cardResults = testResults.filter(result => 
    result.cardId == test.id || 
    (result.testId == test.testId && result.variantNumber == test.variantNumber)
  )
  
  if (cardResults.length > 0) {
    // Берем последний результат
    const lastResult = cardResults[cardResults.length - 1]
    console.log('Найден последний результат:', lastResult)
    
    // Переходим на страницу результатов
    router.push({
      path: `/test-results/card/${test.id}`,
      query: {
        testId: test.testId,
        variantNumber: test.variantNumber,
        title: test.title,
        subtitle: test.subtitle,
        resultId: lastResult.id || lastResult.timestamp
      }
    })
  } else {
    console.log('Результаты не найдены для карточки:', test.id)
    alert('Результаты теста не найдены. Возможно, вы еще не проходили этот тест.')
    openTestModal(test)
  }
}

const retryTest = (test) => {
  selectedTest.value = test
  testModal.value = true
}

const goToAdminPanel = () => {
  router.push('/admin/tests')
} 

const getLevelColor = (level) => {
  const colors = { 
    easy: 'success', 
    medium: 'warning', 
    hard: 'error' 
  }
  return colors[level] || 'grey'
}

const getScoreColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

const getScoreClass = (score) => {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
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

const reloadTests = async () => {
  await loadTests()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedLevel.value = null
  selectedStatus.value = null
  currentPage.value = 1
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const debouncedSearch = () => {
  currentPage.value = 1
}

watch([searchQuery, selectedLevel, selectedStatus], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.tests-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

.header-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px 40px;
  text-align: center;
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

.loading-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.header-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.back-btn, .admin-btn, .refresh-btn {
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: none;
}

.admin-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
}

.refresh-btn {
  background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
}

.stats-summary {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.stats-summary .v-chip {
  font-weight: 600;
}

.search-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.search-card {
  border-radius: 16px;
  padding: 24px;
  background: rgba(30, 41, 59, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 2;
  min-width: 300px;
}

.level-select, .status-select {
  flex: 1;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-message {
  margin-top: 20px;
  color: #94a3b8;
  font-size: 1.1rem;
}

.tests-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.test-card-wrapper {
  height: 100%;
  position: relative;
}

.test-card-dark {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border: 1px solid transparent;
  border-radius: 20px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.test-card-dark:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  border-color: rgba(59, 130, 246, 0.5);
}

.test-card-dark.completed-card {
  border-color: rgba(34, 197, 94, 0.3);
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.1))
      padding-box,
    linear-gradient(135deg, #3b82f6, #06b6d4) border-box;
  border: 1px solid transparent;
}

.test-number-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 3;
  backdrop-filter: blur(4px);
}

.card-image-container {
  position: relative;
  height: 140px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.test-card-dark:hover .card-image {
  transform: scale(1.05);
}

.level-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  backdrop-filter: blur(4px);
}

.result-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
}

.result-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  backdrop-filter: blur(4px);
  border: 2px solid white;
}

.score-high {
  background: linear-gradient(135deg, #10b981, #059669);
}

.score-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.score-low {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.card-content {
  padding: 20px;
}

.light-text {
  color: #f8fafc !important;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 50px;
}

.card-subtitle {
  font-size: 0.875rem;
  margin-bottom: 16px;
  line-height: 1.4;
  color: #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.variant-label {
  display: inline-block;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: 600;
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
  font-size: 0.875rem;
  color: #94a3b8;
}

.debug-info {
  font-size: 0.7rem;
  color: #64748b;
  padding: 4px;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 6px;
  margin-bottom: 12px;
  text-align: center;
}

.card-actions {
  margin-top: 16px;
}

.card-btn {
  border-radius: 16px;
  font-weight: 700;
  text-transform: none;
}

.results-buttons {
  width: 100%;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  margin-top: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #10b981;
}

.status-in-progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-not-started {
  background: rgba(100, 116, 139, 0.1);
  color: #94a3b8;
}

.pagination-section {
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  color: #94a3b8;
  font-size: 0.875rem;
}

.no-results {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}

.no-results h3 {
  font-size: 1.5rem;
  margin: 16px 0 8px;
  color: #f8fafc;
}

.no-results p {
  color: #94a3b8;
  margin-bottom: 24px;
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
  border-radius: 50%;
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
  align-items: center;
}

.modal-avatar {
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid #3b82f6;
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

.modal-progress {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #10b981;
  font-weight: 600;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.875rem;
  color: #94a3b8;
}

.modal-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.modal-btn-start {
  flex: 2;
  border-radius: 16px;
}

.modal-btn-later {
  flex: 1;
  border-radius: 16px;
}

@media (max-width: 1200px) {
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 900px) {
  .search-filters {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-input,
  .level-select,
  .status-select {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .header-section,
  .search-section,
  .tests-grid,
  .pagination-section {
    padding: 40px 16px;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .header-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .header-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
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
  .tests-grid,
  .pagination-section {
    padding: 32px 12px;
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
    padding: 20px;
  }
  
  .card-title {
    font-size: 1rem;
  }
}
</style>