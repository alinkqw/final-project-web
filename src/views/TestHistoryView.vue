<template>
  <div class="test-history-page">
    <!-- Шапка -->
    <div class="header-section">
      <div class="header-actions">
        <v-btn 
          to="/dashboard" 
          variant="text" 
          color="grey" 
          class="back-btn"
          prepend-icon="mdi-arrow-left"
        >
          Назад к дашборду
        </v-btn>
      </div>
      
      <div class="header-content">
        <h1 class="page-title">История тестов</h1>
        <div class="page-subtitle">
          Все пройденные тесты и результаты
        </div>
      </div>
    </div>

    <div class="overall-stats-section" v-if="testResults.length > 0">
      <v-card class="overall-stats-card">
        <v-card-title class="stats-title">
          <v-icon left color="primary">mdi-chart-bar</v-icon>
          Общая статистика
        </v-card-title>
        <v-card-text>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="success">mdi-check-circle</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalTests }}</div>
                <div class="stat-label">Всего тестов</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="warning">mdi-chart-line</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ averageScore }}%</div>
                <div class="stat-label">Средний результат</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="info">mdi-trophy</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ bestScore }}%</div>
                <div class="stat-label">Лучший результат</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <v-icon color="primary">mdi-clock</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalTime }}</div>
                <div class="stat-label">Общее время</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section" v-if="testResults.length > 0">
      <v-card class="filters-card">
        <v-card-text>
          <div class="filters-row">
            <div class="search-filter">
              <v-text-field
                v-model="searchQuery"
                placeholder="Поиск по названию теста..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </div>
            
            <div class="sort-filter">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Сортировать по"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
            
            <div class="date-filter">
              <v-select
                v-model="dateFilter"
                :items="dateOptions"
                label="Период"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Основное содержимое -->
    <div class="content-section">
      <!-- Если есть результаты -->
      <template v-if="filteredResults.length > 0">
        <div class="results-header">
          <h3 class="results-title">
            Показано {{ filteredResults.length }} из {{ testResults.length }} результатов
          </h3>
          <div class="results-actions">
            <v-btn
              variant="text"
              color="grey"
              @click="clearFilters"
              v-if="hasActiveFilters"
            >
              <v-icon left>mdi-filter-off</v-icon>
              Сбросить фильтры
            </v-btn>
            <v-btn
              variant="tonal"
              color="primary"
              @click="exportAllResults"
            >
              <v-icon left>mdi-download</v-icon>
              Экспорт всех
            </v-btn>
          </div>
        </div>

        <!-- Карточки результатов -->
        <div class="results-grid">
          <v-card
            v-for="result in paginatedResults"
            :key="result.id"
            class="result-card"
            :class="{
              'excellent': result.percentage >= 80,
              'good': result.percentage >= 60 && result.percentage < 80,
              'poor': result.percentage < 60
            }"
          >
            <div class="result-card-header">
              <div class="result-card-title">
                <h4 class="test-title">{{ result.testTitle }}</h4>
                <div class="test-subtitle">
                  <v-chip size="x-small" variant="outlined" class="mr-2">
                    Вариант {{ result.variantNumber || 1 }}
                  </v-chip>
                  <span class="text-grey">{{ formatDate(result.date) }}</span>
                </div>
              </div>
              
              <div class="result-score">
                <div class="score-circle" :class="getScoreClass(result.percentage)">
                  {{ result.percentage }}%
                </div>
              </div>
            </div>
            
            <v-divider class="my-3" />
            
            <div class="result-card-content">
              <div class="result-stats">
                <div class="stat-row">
                  <div class="stat-label">Результат:</div>
                  <div class="stat-value">
                    <span class="correct">{{ result.correctAnswers }}</span>
                    <span class="separator">/</span>
                    <span class="total">{{ result.totalQuestions }}</span>
                    <span class="accuracy">({{ Math.round((result.correctAnswers / result.totalQuestions) * 100) }}%)</span>
                  </div>
                </div>
                
                <div class="stat-row">
                  <div class="stat-label">Время:</div>
                  <div class="stat-value">{{ formatTime(result.timeSpent) }}</div>
                </div>
                
                <div class="stat-row">
                  <div class="stat-label">Статус:</div>
                  <div class="stat-value">
                    <v-chip :color="getStatusColor(result.percentage)" size="x-small">
                      {{ getStatusText(result.percentage) }}
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <div class="result-actions">
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="viewResultDetails(result)"
                  block
                >
                  <v-icon left size="small">mdi-eye</v-icon>
                  Подробный разбор
                </v-btn>
                
                <v-btn
                  color="warning"
                  variant="outlined"
                  size="small"
                  @click="retryTest(result)"
                  block
                  class="mt-2"
                >
                  <v-icon left size="small">mdi-reload</v-icon>
                  Пройти снова
                </v-btn>
              </div>
            </div>
            
            <!-- Быстрый просмотр ошибок -->
            <div class="quick-errors" v-if="result.percentage < 100">
              <v-expansion-panels flat>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <template #default="{ expanded }">
                      <div class="errors-title">
                        <v-icon :color="result.percentage < 60 ? 'error' : 'warning'">
                          {{ result.percentage < 60 ? 'mdi-alert-circle' : 'mdi-information' }}
                        </v-icon>
                        <span class="ml-2">
                          {{ result.totalQuestions - result.correctAnswers }} ошибок
                          <span v-if="result.percentage < 60" class="text-error ml-1">(нужно повторить)</span>
                        </span>
                      </div>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="errors-content">
                      <p class="text-caption text-grey mb-2">
                        {{ getPerformanceMessage(result.percentage) }}
                      </p>
                      <v-btn
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="viewResultDetails(result)"
                      >
                        Посмотреть все ошибки
                      </v-btn>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-card>
        </div>

        <!-- Пагинация -->
        <div class="pagination-section" v-if="totalPages > 1">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            color="primary"
          />
          <div class="pagination-info">
            Страница {{ currentPage }} из {{ totalPages }}
          </div>
        </div>
      </template>

      <!-- Если нет результатов -->
      <div v-else-if="testResults.length === 0" class="no-results">
        <v-icon size="80" color="grey">mdi-file-question-outline</v-icon>
        <h3 class="no-results-title">История тестов пуста</h3>
        <p class="no-results-text">
          Вы еще не прошли ни одного теста. Начните обучение прямо сейчас!
        </p>
        <div class="no-results-actions">
          <v-btn
            color="primary"
            size="large"
            to="/tests"
            class="mr-3"
          >
            <v-icon left>mdi-play</v-icon>
            Пройти первый тест
          </v-btn>
          <v-btn
            variant="outlined"
            color="grey"
            @click="addDemoResults"
          >
            <v-icon left>mdi-test-tube</v-icon>
            Добавить демо-данные
          </v-btn>
        </div>
      </div>

      <!-- Если нет результатов после фильтрации -->
      <div v-else class="no-results-filtered">
        <v-icon size="64" color="grey">mdi-filter-off</v-icon>
        <h3 class="no-results-title">Ничего не найдено</h3>
        <p class="no-results-text">
          Попробуйте изменить параметры поиска или сбросить фильтры
        </p>
        <v-btn
          variant="outlined"
          color="primary"
          @click="clearFilters"
        >
          <v-icon left>mdi-filter-off</v-icon>
          Сбросить фильтры
        </v-btn>
      </div>
    </div>

    <!-- Диаграмма прогресса -->
    <div class="chart-section" v-if="testResults.length > 1">
      <v-card class="chart-card">
        <v-card-title class="chart-title">
          <v-icon left color="primary">mdi-chart-timeline</v-icon>
          Прогресс по времени
        </v-card-title>
        <v-card-text>
          <div class="progress-chart">
            <div class="chart-container">
              <div class="chart-y-axis">
                <div>100%</div>
                <div>75%</div>
                <div>50%</div>
                <div>25%</div>
                <div>0%</div>
              </div>
              <div class="chart-area">
                <div 
                  v-for="(result, index) in sortedResultsForChart" 
                  :key="result.id"
                  class="chart-point"
                  :style="{
                    left: (index * 100 / (sortedResultsForChart.length - 1)) + '%',
                    bottom: result.percentage + '%'
                  }"
                  :class="getScoreClass(result.percentage)"
                  @click="viewResultDetails(result)"
                  :title="`${result.testTitle}: ${result.percentage}%`"
                >
                  <div class="point-tooltip">{{ result.percentage }}%</div>
                </div>
                <div class="chart-line"></div>
              </div>
              <div class="chart-x-axis">
                <div 
                  v-for="(result, index) in sortedResultsForChart" 
                  :key="index"
                  class="x-label"
                  :style="{ left: (index * 100 / (sortedResultsForChart.length - 1)) + '%' }"
                >
                  {{ formatChartDate(result.date) }}
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item" @click="filterByScore('excellent')">
                <div class="legend-color excellent"></div>
                <span>80-100%</span>
              </div>
              <div class="legend-item" @click="filterByScore('good')">
                <div class="legend-color good"></div>
                <span>60-79%</span>
              </div>
              <div class="legend-item" @click="filterByScore('poor')">
                <div class="legend-color poor"></div>
                <span>0-59%</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Быстрые действия -->
    <div class="quick-actions-section">
      <v-card class="quick-actions-card">
        <v-card-title class="quick-actions-title">
          <v-icon left color="success">mdi-lightning-bolt</v-icon>
          Быстрые действия
        </v-card-title>
        <v-card-text>
          <div class="quick-actions-grid">
            <v-btn
              color="primary"
              variant="tonal"
              @click="goToDashboard"
              block
            >
              <v-icon left>mdi-chart-box</v-icon>
              К дашборду
            </v-btn>
            <v-btn
              color="warning"
              variant="tonal"
              @click="viewWeakTopics"
              block
              :disabled="!hasWeakResults"
            >
              <v-icon left>mdi-alert-circle</v-icon>
              Слабые темы
              <v-chip v-if="weakResultsCount > 0" size="x-small" color="error" class="ml-2">
                {{ weakResultsCount }}
              </v-chip>
            </v-btn>
            <v-btn
              color="success"
              variant="tonal"
              @click="shareHistory"
              block
              :disabled="testResults.length === 0"
            >
              <v-icon left>mdi-share</v-icon>
              Поделиться
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Состояние
const testResults = ref([])
const searchQuery = ref('')
const sortBy = ref('date-desc')
const dateFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(6)

// Параметры сортировки
const sortOptions = [
  { title: 'Дата (новые)', value: 'date-desc' },
  { title: 'Дата (старые)', value: 'date-asc' },
  { title: 'Результат (высокие)', value: 'score-desc' },
  { title: 'Результат (низкие)', value: 'score-asc' },
  { title: 'Название (А-Я)', value: 'title-asc' },
  { title: 'Время (быстрые)', value: 'time-asc' }
]

const dateOptions = [
  { title: 'Все время', value: 'all' },
  { title: 'Сегодня', value: 'today' },
  { title: 'Неделя', value: 'week' },
  { title: 'Месяц', value: 'month' },
  { title: '3 месяца', value: '3months' },
  { title: 'Год', value: 'year' }
]

onMounted(() => {
  loadTestResults()
})

const loadTestResults = () => {
  try {
    const savedResults = localStorage.getItem('testResults')
    if (savedResults && savedResults !== 'undefined' && savedResults !== 'null') {
      const results = JSON.parse(savedResults)
      
      if (Array.isArray(results)) {
        const processedResults = results.map((result, index) => {
          let percentage = result.percentage
          if (!percentage && result.correctAnswers !== undefined && result.totalQuestions !== undefined) {
            percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100)
          } else if (!percentage) {
            percentage = 50
          }
          
          let correctAnswers = result.correctAnswers
          if (!correctAnswers && percentage !== undefined && result.totalQuestions !== undefined) {
            correctAnswers = Math.round((percentage / 100) * result.totalQuestions)
          } else if (!correctAnswers) {
            correctAnswers = Math.round((percentage / 100) * 15)
          }

          let totalQuestions = result.totalQuestions
          if (!totalQuestions && correctAnswers !== undefined && percentage !== undefined) {
            totalQuestions = Math.round((correctAnswers * 100) / percentage)
          } else if (!totalQuestions) {
            totalQuestions = 15
          }
          
          return {
            id: result.id || result.cardId || `result_${Date.now()}_${index}`,
            testId: result.testId || 1,
            testTitle: result.testTitle || `Тест #${result.testId || '1'}`,
            date: result.date || new Date().toISOString(),
            correctAnswers,
            totalQuestions,
            percentage,
            timeSpent: result.timeSpent || 1500,
            variantNumber: result.variantNumber || 1,
            cardId: result.cardId
          }
        })
        
        testResults.value = processedResults
        console.log('Загружено результатов:', testResults.value.length)
      }
    } else {
      testResults.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки результатов:', error)
    testResults.value = []
  }
}

const filteredResults = computed(() => {
  let results = [...testResults.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(result => 
      result.testTitle.toLowerCase().includes(query)
    )
  }
  
  // Фильтрация по дате
  if (dateFilter.value !== 'all') {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (dateFilter.value) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    results = results.filter(result => {
      const resultDate = new Date(result.date)
      return resultDate >= cutoffDate
    })
  }
  
  // Сортировка
  results.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'score-desc':
        return b.percentage - a.percentage
      case 'score-asc':
        return a.percentage - b.percentage
      case 'title-asc':
        return a.testTitle.localeCompare(b.testTitle)
      case 'time-asc':
        return (a.timeSpent || 0) - (b.timeSpent || 0)
      default:
        return 0
    }
  })
  
  return results
})

// Пагинация
const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / itemsPerPage.value)
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredResults.value.slice(start, end)
})

// Общая статистика
const totalTests = computed(() => testResults.value.length)

const averageScore = computed(() => {
  if (testResults.value.length === 0) return 0
  const sum = testResults.value.reduce((acc, result) => acc + (result.percentage || 0), 0)
  return Math.round(sum / testResults.value.length)
})

const bestScore = computed(() => {
  if (testResults.value.length === 0) return 0
  return Math.max(...testResults.value.map(r => r.percentage || 0))
})

const totalTime = computed(() => {
  if (testResults.value.length === 0) return '0 мин'
  
  const totalSeconds = testResults.value.reduce((acc, result) => {
    return acc + (result.timeSpent || 0)
  }, 0)
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}ч ${minutes}мин` : `${hours}ч`
  } else {
    return `${minutes} мин`
  }
})

// Слабые результаты (< 60%)
const hasWeakResults = computed(() => {
  return testResults.value.some(result => (result.percentage || 0) < 60)
})

const weakResultsCount = computed(() => {
  return testResults.value.filter(result => (result.percentage || 0) < 60).length
})

// Активные фильтры
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || dateFilter.value !== 'all'
})

// Данные для графика
const sortedResultsForChart = computed(() => {
  return [...testResults.value]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10)
})

// Вспомогательные функции
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (e) {
    return '—'
  }
}

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '—'
  
  if (typeof seconds === 'string') {
    if (seconds.includes('мин') || seconds.includes(':')) {
      return seconds
    }
    seconds = parseInt(seconds)
  }
  
  if (isNaN(seconds)) return '—'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 1) {
    return `${remainingSeconds} сек`
  } else if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes} мин ${remainingSeconds} сек` : `${minutes} мин`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}мин` : `${hours}ч`
  }
}

const formatChartDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.getDate() + '/' + (date.getMonth() + 1)
  } catch (e) {
    return ''
  }
}

const getScoreClass = (score) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  return 'score-poor'
}

const getStatusColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

const getStatusText = (score) => {
  if (score >= 80) return 'Отлично'
  if (score >= 60) return 'Хорошо'
  return 'Повторить'
}

const getPerformanceMessage = (score) => {
  if (score >= 90) return 'Превосходный результат!'
  if (score >= 80) return 'Отличная работа!'
  if (score >= 70) return 'Хорошо, но есть куда расти'
  if (score >= 60) return 'Неплохо, но нужна практика'
  if (score >= 50) return 'Нужно повторить материал'
  return 'Требуется серьезная работа над темой'
}

// Действия
const viewResultDetails = (result) => {
  router.push({
    name: 'TestResultDetails',
    params: { 
      id: result.cardId || result.id || 'demo'
    },
    query: {
      title: result.testTitle,
      testId: result.testId,
      variantNumber: result.variantNumber
    }
  })
}

const retryTest = (result) => {
  router.push({
    path: `/tests/${result.cardId || result.testId}`,
    query: {
      title: result.testTitle,
      testId: result.testId,
      variantNumber: result.variantNumber
    }
  })
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const viewWeakTopics = () => {
  const weakResult = testResults.value.find(result => (result.percentage || 0) < 60)
  if (weakResult) {
    viewResultDetails(weakResult)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  dateFilter.value = 'all'
  currentPage.value = 1
}

const filterByScore = (range) => {
  searchQuery.value = ''
  dateFilter.value = 'all'
  sortBy.value = range === 'poor' ? 'score-asc' : 'score-desc'
}

const exportAllResults = () => {
  const data = {
    exportedAt: new Date().toISOString(),
    totalTests: totalTests.value,
    averageScore: averageScore.value,
    bestScore: bestScore.value,
    results: testResults.value
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', `test-history-${new Date().toISOString().slice(0,10)}.json`)
  linkElement.click()
}

const shareHistory = () => {
  const text = `Моя история тестов:
Всего тестов: ${totalTests.value}
Средний результат: ${averageScore.value}%
Лучший результат: ${bestScore.value}%
Общее время: ${totalTime.value}

#ГосЭкзамен #Тестирование #История`
  
  if (navigator.share) {
    navigator.share({
      title: 'Моя история тестов',
      text: text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text)
    alert('История скопирована в буфер обмена!')
  }
}

const addDemoResults = () => {
  const demoResults = [
    {
      id: 'demo_1',
      testId: 1,
      testTitle: 'Python Basics',
      date: new Date(Date.now() - 86400000).toISOString(),
      correctAnswers: 12,
      totalQuestions: 15,
      percentage: 80,
      timeSpent: 1200,
      variantNumber: 1,
      cardId: 1
    },
    {
      id: 'demo_2',
      testId: 2,
      testTitle: 'JavaScript Fundamentals',
      date: new Date(Date.now() - 172800000).toISOString(),
      correctAnswers: 10,
      totalQuestions: 15,
      percentage: 67,
      timeSpent: 1500,
      variantNumber: 1,
      cardId: 2
    },
    {
      id: 'demo_3',
      testId: 3,
      testTitle: 'Algorithms and Data Structures',
      date: new Date(Date.now() - 259200000).toISOString(),
      correctAnswers: 13,
      totalQuestions: 15,
      percentage: 87,
      timeSpent: 1800,
      variantNumber: 1,
      cardId: 3
    }
  ]
  
  const currentResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  const updatedResults = [...currentResults, ...demoResults]
  localStorage.setItem('testResults', JSON.stringify(updatedResults))
  
  loadTestResults()
}
</script>

<style scoped>
.test-history-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff;
}

/* Заголовок */
.header-section {
  margin-bottom: 30px;
}

.header-actions {
  margin-bottom: 20px;
}

.back-btn {
  border-radius: 10px;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 20px;
}

/* Общая статистика */
.overall-stats-section {
  margin-bottom: 30px;
}

.overall-stats-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.stats-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon .v-icon {
  font-size: 32px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Фильтры */
.filters-section {
  margin-bottom: 30px;
}

.filters-card {
  background: rgba(30, 41, 59, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: center;
}

/* Заголовок результатов */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.results-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.results-actions {
  display: flex;
  gap: 12px;
}

/* Карточки результатов */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.result-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Цветовые классы для карточек */
.result-card.excellent {
  border-left: 4px solid #10b981;
}

.result-card.good {
  border-left: 4px solid #f59e0b;
}

.result-card.poor {
  border-left: 4px solid #ef4444;
}

.result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
}

.result-card-title {
  flex: 1;
}

.test-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.test-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.result-score {
  flex-shrink: 0;
  margin-left: 16px;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.score-excellent {
  background: rgba(16, 185, 129, 0.15);
  border: 3px solid #10b981;
  color: #10b981;
}

.score-good {
  background: rgba(245, 158, 11, 0.15);
  border: 3px solid #f59e0b;
  color: #f59e0b;
}

.score-poor {
  background: rgba(239, 68, 68, 0.15);
  border: 3px solid #ef4444;
  color: #ef4444;
}

.result-card-content {
  padding: 0 20px 20px;
}

.result-stats {
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-value .correct {
  color: #10b981;
}

.stat-value .separator {
  color: #94a3b8;
}

.stat-value .total {
  color: #ffffff;
}

.stat-value .accuracy {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-left: 4px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Быстрый просмотр ошибок */
.quick-errors {
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.errors-title {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.errors-content {
  padding: 8px 0;
}

/* Пагинация */
.pagination-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 40px 0;
}

.pagination-info {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Состояние "нет результатов" */
.no-results,
.no-results-filtered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.no-results-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 20px 0 10px;
}

.no-results-text {
  color: #94a3b8;
  max-width: 400px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.no-results-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Диаграмма прогресса */
.chart-section {
  margin: 40px 0;
}

.chart-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-chart {
  padding: 20px 0;
}

.chart-container {
  position: relative;
  height: 200px;
  margin-bottom: 30px;
}

.chart-y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 40px;
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 10px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.chart-area {
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 40px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}

.chart-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.chart-point:hover {
  transform: translate(-50%, 50%) scale(1.5);
  z-index: 3;
}

.chart-point::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: -1;
}

.chart-point.score-excellent {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.chart-point.score-good {
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.chart-point.score-poor {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.point-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.chart-point:hover .point-tooltip {
  opacity: 1;
}

.chart-x-axis {
  position: absolute;
  left: 40px;
  right: 0;
  bottom: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
}

.x-label {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.excellent {
  background: #10b981;
}

.legend-color.good {
  background: #f59e0b;
}

.legend-color.poor {
  background: #ef4444;
}

/* Быстрые действия */
.quick-actions-section {
  margin: 40px 0 20px;
}

.quick-actions-card {
  background: rgba(30, 41, 59, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.quick-actions-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .test-history-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-actions {
    justify-content: center;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .result-card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .result-score {
    margin-left: 0;
    align-self: center;
  }
  
  .chart-container {
    height: 150px;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .no-results-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .result-card-header {
    padding: 16px;
  }
  
  .result-card-content {
    padding: 0 16px 16px;
  }
  
  .no-results-title {
    font-size: 1.25rem;
  }
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  animation: fadeIn 0.3s ease-out;
}

/* Текстовые стили */
.text-grey {
  color: #94a3b8;
}

.text-error {
  color: #ef4444;
}

.text-caption {
  font-size: 0.85rem;
}

/* Отступы */
.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.my-3 {
  margin-top: 12px;
  margin-bottom: 12px;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>