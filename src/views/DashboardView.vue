<template>
  <div class="dashboard-page">
    <!-- Заголовок -->
    <div class="header-section">
      <h1 class="header-title gradient-text">📊 Личный кабинет</h1>
      <div class="user-info">
        <v-avatar size="64" class="mr-3">
          <v-icon color="white" size="32">mdi-account-circle</v-icon>
        </v-avatar>
        <div>
          <h2 class="user-name">{{ userName }}</h2>
          <div class="user-meta">
            <span class="user-role">Студент</span>
            <span class="user-email">student@example.com</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Общая статистика -->
    <div class="stats-section">
      <h3 class="section-title">📈 Ваша статистика</h3>
      <div class="stats-grid">
        <v-card class="stat-card">
          <div class="stat-icon">
            <v-icon color="success">mdi-check-circle</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalTestsCompleted }}</div>
            <div class="stat-label">Пройдено тестов</div>
          </div>
        </v-card>

        <v-card class="stat-card">
          <div class="stat-icon">
            <v-icon color="warning">mdi-chart-line</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ averageScore }}%</div>
            <div class="stat-label">Средний результат</div>
          </div>
        </v-card>

        <v-card class="stat-card">
          <div class="stat-icon">
            <v-icon color="info">mdi-trophy</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ bestScore }}%</div>
            <div class="stat-label">Лучший результат</div>
            <div v-if="bestScoreTest" class="stat-subtitle">
              {{ bestScoreTest.testTitle }}
            </div>
          </div>
        </v-card>

        <v-card class="stat-card">
          <div class="stat-icon">
            <v-icon color="primary">mdi-timer-sand</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalTimeSpent }}</div>
            <div class="stat-label">Времени потрачено</div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Последние результаты тестов -->
    <div class="results-section" id="results-section">
      <div class="section-header">
        <h3 class="section-title">📝 Последние результаты тестов</h3>
        <div class="section-actions">
          <v-btn 
            color="primary" 
            variant="outlined" 
            @click="goToAllTests"
            class="action-btn"
          >
            <v-icon left>mdi-play</v-icon>
            Все тесты
          </v-btn>
          <v-btn 
            color="grey" 
            variant="text" 
            @click="refreshResults"
            class="action-btn"
            :loading="refreshing"
          >
            <v-icon left>mdi-refresh</v-icon>
            Обновить
          </v-btn>
          <v-btn 
            color="success" 
            variant="tonal" 
            @click="addDemoResults"
            class="action-btn"
            v-if="testResults.length === 0"
          >
            <v-icon left>mdi-test-tube</v-icon>
            Демо данные
          </v-btn>
        </div>
      </div>

      <v-card class="results-card">
        <div class="table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th class="text-left">Тест</th>
                <th class="text-left">Дата</th>
                <th class="text-left">Время</th>
                <th class="text-left">Результат</th>
                <th class="text-left">Статус</th>
                <th class="text-left">Детали</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="result in recentResults" 
                :key="result.id"
                class="result-row"
              >
                <td>
                  <div class="test-info">
                    <div class="test-title">{{ result.testTitle }}</div>
                    <div class="test-subtitle">
                      {{ result.variantNumber ? `Вариант ${result.variantNumber}` : 'Базовый тест' }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    {{ formatDate(result.date) }}
                  </div>
                </td>
                <td>
                  <div class="time-info">
                    {{ formatTime(result.timeSpent) }}
                  </div>
                </td>
                <td>
                  <div class="score-info">
                    <div class="score-circle" :class="getScoreClass(result.percentage)">
                      {{ result.percentage }}%
                    </div>
                    <div class="score-details">
                      <span class="correct">{{ result.correctAnswers }}/{{ result.totalQuestions }}</span>
                      <span class="accuracy">{{ Math.round((result.correctAnswers / result.totalQuestions) * 100) }}% точность</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="status-chip" :class="getStatusClass(result.percentage)">
                    {{ getStatusText(result.percentage) }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      size="small"
                      @click="viewTestDetails(result)"
                      class="details-btn"
                    >
                      <v-icon left size="small">mdi-chart-bar</v-icon>
                      Подробно
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Если нет результатов -->
        <div v-if="recentResults.length === 0" class="no-results">
          <v-icon size="64" color="grey">mdi-file-question</v-icon>
          <h3>Результатов пока нет</h3>
          <p>Пройдите первый тест, чтобы увидеть здесь статистику</p>
          <v-btn color="primary" @click="goToAllTests" class="mt-4">
            <v-icon left>mdi-play</v-icon>
            Начать тест
          </v-btn>
        </div>

        <!-- Пагинация -->
        <div v-if="testResults.length > 5" class="pagination">
          <div class="results-count">
            Всего результатов: {{ testResults.length }}
          </div>
        </div>
      </v-card>
    </div>

    <!-- Рекомендации для улучшения -->
    <div class="recommendations-section" v-if="recommendations.length > 0">
      <v-card class="recommendations-card">
        <v-card-title class="recommendations-title">
          <v-icon left color="info">mdi-lightbulb</v-icon>
          Рекомендации для улучшения
        </v-card-title>
        <v-card-text>
          <div class="recommendations-list">
            <div 
              v-for="(rec, index) in recommendations" 
              :key="index" 
              class="recommendation-item"
            >
              <v-icon :color="rec.color" class="mr-3">{{ rec.icon }}</v-icon>
              <div>
                <div class="recommendation-title">{{ rec.title }}</div>
                <div class="recommendation-text">{{ rec.text }}</div>
              </div>
              <v-btn 
                v-if="rec.action"
                size="small"
                color="primary"
                variant="tonal"
                @click="rec.action"
                class="recommendation-btn"
              >
                {{ rec.actionText }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Быстрые действия -->
    <div class="quick-actions-section">
      <v-card class="quick-actions-card">
        <v-card-title class="quick-actions-title">
          <v-icon left color="success">mdi-rocket-launch</v-icon>
          Быстрые действия
        </v-card-title>
        <v-card-text>
          <div class="quick-actions-grid">
            <v-btn
              color="primary"
              class="quick-action-btn"
              @click="startQuickTest"
              block
            >
              <v-icon left>mdi-lightning-bolt</v-icon>
              Быстрый тест
            </v-btn>
            <v-btn
              color="warning"
              class="quick-action-btn"
              @click="viewWeakTopics"
              block
              v-if="weakTopics.length > 0"
            >
              <v-icon left>mdi-alert-circle</v-icon>
              Слабые темы ({{ weakTopics.length }})
            </v-btn>
            <v-btn
              color="success"
              class="quick-action-btn"
              @click="shareProgress"
              block
              v-if="testResults.length > 0"
            >
              <v-icon left>mdi-share</v-icon>
              Поделиться
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Диалог статистики -->
    <v-dialog v-model="statsDialog" max-width="500">
      <v-card>
        <v-card-title class="stats-dialog-title">
          <v-icon left color="primary">mdi-chart-box</v-icon>
          Подробная статистика
        </v-card-title>
        <v-card-text>
          <div class="stats-dialog-content">
            <div class="stat-detail">
              <div class="stat-detail-label">Всего тестов:</div>
              <div class="stat-detail-value">{{ totalTestsCompleted }}</div>
            </div>
            <div class="stat-detail">
              <div class="stat-detail-label">Средний результат:</div>
              <div class="stat-detail-value">{{ averageScore }}%</div>
            </div>
            <div class="stat-detail">
              <div class="stat-detail-label">Лучший результат:</div>
              <div class="stat-detail-value">{{ bestScore }}%</div>
            </div>
            <div class="stat-detail">
              <div class="stat-detail-label">Общее время:</div>
              <div class="stat-detail-value">{{ totalTimeSpent }}</div>
            </div>
            <div class="stat-detail">
              <div class="stat-detail-label">Правильных ответов:</div>
              <div class="stat-detail-value">{{ totalCorrectAnswers }}/{{ totalQuestions }}</div>
            </div>
            <div class="stat-detail">
              <div class="stat-detail-label">Процент точности:</div>
              <div class="stat-detail-value">{{ Math.round((totalCorrectAnswers / totalQuestions) * 100) }}%</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="statsDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Состояние
const testResults = ref([])
const refreshing = ref(false)
const statsDialog = ref(false)

// Жизненный цикл
onMounted(async () => {
  console.log('🔄 Dashboard mounted - загружаю результаты...')
  await loadTestResults()
  window.addEventListener('storage', handleStorageChange)
  console.log('✅ Dashboard загружен. Результатов:', testResults.value.length)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// Обработчик изменения localStorage
const handleStorageChange = (e) => {
  console.log('📦 Изменение в localStorage:', e.key)
  if (e.key === 'testResults') {
    loadTestResults()
  }
}

// Функция загрузки результатов
const loadTestResults = async () => {
  try {
    refreshing.value = true
    console.log('🔄 Начинаю загрузку результатов из localStorage...')
    
    // Пробуем загрузить результаты
    const savedResults = localStorage.getItem('testResults')
    console.log('📁 Содержимое localStorage (testResults):', savedResults)
    
    if (savedResults && savedResults !== 'undefined' && savedResults !== 'null') {
      try {
        const results = JSON.parse(savedResults)
        console.log('✅ Успешно распарсил результаты:', results)
        
        if (Array.isArray(results)) {
          // Обрабатываем каждый результат
          const processedResults = results.map((result, index) => {
            console.log(`📊 Обрабатываю результат ${index}:`, result)
            
            // Рассчитываем проценты, если их нет
            let percentage = result.percentage
            if (!percentage && result.correctAnswers !== undefined && result.totalQuestions !== undefined) {
              percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100)
            } else if (!percentage) {
              percentage = 50 // Значение по умолчанию
            }
            
            // Рассчитываем правильные ответы, если их нет
            let correctAnswers = result.correctAnswers
            if (!correctAnswers && percentage !== undefined && result.totalQuestions !== undefined) {
              correctAnswers = Math.round((percentage / 100) * result.totalQuestions)
            } else if (!correctAnswers) {
              correctAnswers = Math.round((percentage / 100) * 15) // 15 вопросов по умолчанию
            }
            
            // Рассчитываем общее количество вопросов
            let totalQuestions = result.totalQuestions
            if (!totalQuestions && correctAnswers !== undefined && percentage !== undefined) {
              totalQuestions = Math.round((correctAnswers * 100) / percentage)
            } else if (!totalQuestions) {
              totalQuestions = 15
            }
            
            // Форматируем время
            let timeSpent = result.timeSpent
            if (typeof timeSpent === 'number') {
              timeSpent = formatTime(timeSpent)
            } else if (!timeSpent) {
              timeSpent = '25 мин'
            }
            
            return {
              id: result.id || result.cardId || `result_${Date.now()}_${index}`,
              testId: result.testId || 1,
              testTitle: result.testTitle || `Тест #${result.testId || '1'}`,
              date: result.date || new Date().toISOString(),
              correctAnswers,
              totalQuestions,
              percentage,
              timeSpent,
              variantNumber: result.variantNumber || 1,
              cardId: result.cardId
            }
          })
          
          // Сортируем по дате (новые сверху)
          processedResults.sort((a, b) => new Date(b.date) - new Date(a.date))
          
          testResults.value = processedResults
          console.log('🎯 Обработано результатов:', testResults.value.length)
          console.log('📊 Статистика:', {
            total: totalTestsCompleted.value,
            average: averageScore.value,
            best: bestScore.value,
            time: totalTimeSpent.value
          })
        } else {
          console.warn('⚠️ Результаты не являются массивом:', typeof results)
          testResults.value = []
        }
      } catch (parseError) {
        console.error('❌ Ошибка парсинга результатов:', parseError)
        testResults.value = []
      }
    } else {
      console.log('📭 Нет сохраненных результатов в localStorage')
      testResults.value = []
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки результатов:', error)
    testResults.value = []
  } finally {
    refreshing.value = false
  }
}

// Данные пользователя
const userName = computed(() => {
  return 'Студент'
})

// Статистика
const totalTestsCompleted = computed(() => {
  return testResults.value.length
})

const totalCorrectAnswers = computed(() => {
  return testResults.value.reduce((sum, result) => sum + (result.correctAnswers || 0), 0)
})

const totalQuestions = computed(() => {
  return testResults.value.reduce((sum, result) => sum + (result.totalQuestions || 0), 0)
})

const averageScore = computed(() => {
  if (testResults.value.length === 0) return 0
  const sum = testResults.value.reduce((acc, result) => acc + (result.percentage || 0), 0)
  return Math.round(sum / testResults.value.length)
})

const bestScore = computed(() => {
  if (testResults.value.length === 0) return 0
  return Math.max(...testResults.value.map(r => r.percentage || 0))
})

const bestScoreTest = computed(() => {
  if (testResults.value.length === 0) return null
  return testResults.value.reduce((best, current) => 
    (current.percentage || 0) > (best.percentage || 0) ? current : best
  )
})

const totalTimeSpent = computed(() => {
  if (testResults.value.length === 0) return '0 мин'
  
  const totalMinutes = testResults.value.reduce((acc, result) => {
    if (result.timeSpent) {
      // Парсим время вида "XX мин" или "ХХ:ХХ"
      const match = result.timeSpent.match(/(\d+)\s*мин/)
      if (match) {
        return acc + parseInt(match[1])
      }
      
      // Пробуем парсить как число (секунды)
      if (!isNaN(result.timeSpent)) {
        return acc + Math.floor(parseInt(result.timeSpent) / 60)
      }
    }
    return acc + 25 // По умолчанию 25 минут
  }, 0)
  
  if (totalMinutes < 60) {
    return `${totalMinutes} мин`
  } else {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}ч ${minutes}мин` : `${hours}ч`
  }
})

// Слабые темы (тесты с результатом < 60%)
const weakTopics = computed(() => {
  return testResults.value.filter(result => (result.percentage || 0) < 60)
})

// Недавние результаты (последние 5)
const recentResults = computed(() => {
  return testResults.value.slice(0, 5)
})

// Рекомендации
const recommendations = computed(() => {
  const recs = []
  
  if (testResults.value.length === 0) {
    recs.push({
      icon: 'mdi-play-circle',
      color: 'primary',
      title: 'Начните с первого теста',
      text: 'Пройдите базовый тест, чтобы оценить свой уровень',
      action: () => router.push('/tests'),
      actionText: 'Начать тест'
    })
  }
  
  if (averageScore.value < 60 && testResults.value.length > 0) {
    recs.push({
      icon: 'mdi-alert-circle',
      color: 'warning',
      title: 'Повысить средний результат',
      text: 'Ваш средний балл ниже 60%. Попробуйте пройти тесты еще раз',
      action: () => router.push('/tests'),
      actionText: 'Тренироваться'
    })
  }
  
  if (weakTopics.value.length > 0) {
    recs.push({
      icon: 'mdi-book-alert',
      color: 'error',
      title: 'Улучшить слабые результаты',
      text: `У вас ${weakTopics.value.length} тестов с результатом ниже 60%`,
      action: () => {
        if (weakTopics.value[0]) {
          viewTestDetails(weakTopics.value[0])
        }
      },
      actionText: 'Разобрать'
    })
  }
  
  if (testResults.value.length > 0 && bestScore.value >= 90) {
    recs.push({
      icon: 'mdi-trophy',
      color: 'success',
      title: 'Отличный результат!',
      text: `Поздравляем с высоким результатом (${bestScore.value}%)`,
      action: () => {
        if (bestScoreTest.value) {
          viewTestDetails(bestScoreTest.value)
        }
      },
      actionText: 'Посмотреть'
    })
  }
  
  return recs.slice(0, 3)
})

// Вспомогательные функции
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    console.error('Ошибка форматирования даты:', e)
    return '—'
  }
}

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '—'
  
  if (typeof seconds === 'string') {
    // Если это уже отформатированное время
    if (seconds.includes('мин') || seconds.includes(':')) {
      return seconds
    }
    // Пробуем распарсить как число
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

const getScoreClass = (score) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  return 'score-poor'
}

const getStatusClass = (score) => {
  if (score >= 80) return 'status-excellent'
  if (score >= 60) return 'status-good'
  return 'status-poor'
}

const getStatusText = (score) => {
  if (score >= 80) return 'Отлично'
  if (score >= 60) return 'Хорошо'
  return 'Повторить'
}

// Функции взаимодействия
const refreshResults = async () => {
  console.log('🔄 Ручное обновление результатов...')
  await loadTestResults()
}

const viewTestDetails = (result) => {
  console.log('Переход к деталям результата:', result)
  
  // Проверяем, есть ли cardId
  const cardId = result.cardId || 1
  
  router.push({
    name: 'TestResultDetails',
    params: { 
      id: cardId || result.id || 'demo'
    },
    query: {
      title: result.testTitle,
      testId: result.testId,
      variantNumber: result.variantNumber,
      date: result.date
    }
  })
}

const goToAllTests = () => {
  router.push('/tests')
}

const startQuickTest = () => {
  router.push({
    path: '/tests',
    query: { quick: 'true' }
  })
}

const viewWeakTopics = () => {
  if (weakTopics.value.length > 0) {
    viewTestDetails(weakTopics.value[0])
  }
}

const shareProgress = () => {
  const text = `Мой прогресс в тестах:
📊 Всего тестов: ${totalTestsCompleted.value}
🎯 Средний результат: ${averageScore.value}%
🏆 Лучший результат: ${bestScore.value}%
⏱️ Время потрачено: ${totalTimeSpent.value}

#Тестирование #Прогресс`
  
  if (navigator.share) {
    navigator.share({
      title: 'Мои результаты тестов',
      text: text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text)
    alert('Результаты скопированы в буфер обмена!')
  }
}

// Функция для добавления демо-данных
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
  
  // Добавляем демо-результаты
  const currentResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  const updatedResults = [...currentResults, ...demoResults]
  localStorage.setItem('testResults', JSON.stringify(updatedResults))
  
  // Обновляем отображение
  loadTestResults()
  
  console.log('✅ Добавлены демо-результаты')
}

// Проверяем данные в localStorage
const checkStorage = () => {
  console.log('🔍 Проверка localStorage:')
  console.log('- testResults:', localStorage.getItem('testResults'))
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff;
}

/* Заголовок */
.header-section {
  margin-bottom: 40px;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-role {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.user-email {
  font-size: 0.85rem;
  color: #64748b;
}

/* Статистика */
.stats-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  margin-bottom: 16px;
}

.stat-icon .v-icon {
  font-size: 32px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 4px;
}

/* Результаты тестов */
.results-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
}

.results-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.table-container {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.results-table th {
  background: rgba(15, 23, 42, 0.9);
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 16px 20px;
  text-align: left;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.results-table td {
  color: #ffffff;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.result-row {
  transition: all 0.2s ease;
}

.result-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.test-info {
  min-width: 200px;
}

.test-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.95rem;
  color: #ffffff;
}

.test-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
}

.date-info,
.time-info {
  font-size: 0.9rem;
  color: #cbd5e1;
  white-space: nowrap;
}

.score-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.score-excellent {
  background: rgba(16, 185, 129, 0.15);
  border: 3px solid #10b981;
  color: #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.score-good {
  background: rgba(245, 158, 11, 0.15);
  border: 3px solid #f59e0b;
  color: #f59e0b;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.score-poor {
  background: rgba(239, 68, 68, 0.15);
  border: 3px solid #ef4444;
  color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.score-details {
  display: flex;
  flex-direction: column;
}

.correct {
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
}

.accuracy {
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 100px;
}

.status-excellent {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-good {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-poor {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.details-btn {
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  white-space: nowrap;
}

.details-btn:hover {
  background: rgba(59, 130, 246, 0.2) !important;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results h3 {
  font-size: 1.5rem;
  margin: 20px 0 10px;
  color: #ffffff;
}

.no-results p {
  color: #94a3b8;
  margin-bottom: 30px;
}

.pagination {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.results-count {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
}

/* Рекомендации */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.recommendations-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
  gap: 16px;
}

.recommendation-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.recommendation-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.recommendation-text {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
}

.recommendation-btn {
  margin-left: auto;
  flex-shrink: 0;
  border-radius: 10px !important;
}

/* Быстрые действия */
.quick-actions-section {
  margin-bottom: 40px;
}

.quick-actions-card {
  background: rgba(30, 41, 59, 0.8);
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

.quick-action-btn {
  height: 60px !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}

/* Диалог статистики */
.stats-dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.stat-detail-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.stat-detail-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-actions {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .recommendation-btn {
    margin-left: 0;
    align-self: stretch;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.75rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .results-table {
    font-size: 0.85rem;
  }
  
  .results-table th,
  .results-table td {
    padding: 12px 8px;
  }
  
  .score-circle {
    width: 40px;
    height: 40px;
    font-size: 0.8rem;
  }
}
</style>