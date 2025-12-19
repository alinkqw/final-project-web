<template>
  <div class="test-results-details">
    <!-- Заголовок -->
    <div class="header-section">
      <v-btn 
        to="/dashboard" 
        variant="text" 
        color="grey" 
        class="back-btn"
      >
        <v-icon left>mdi-arrow-left</v-icon>
        Назад к дашборду
      </v-btn>
      
      <h1 class="header-title">Детальные результаты теста</h1>
      
      <div class="test-info">
        <div class="test-title">{{ testResult.testTitle }}</div>
        <div class="test-subtitle">{{ testResult.subtitle }}</div>
        <div class="test-meta">
          <span>Вариант {{ testResult.variantNumber }}</span>
          <span>•</span>
          <span>{{ formatDate(testResult.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- Основные метрики -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <v-card class="metric-card">
          <div class="metric-icon">
            <v-icon color="success" size="48">mdi-check-circle</v-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ testResult.percentage }}%</div>
            <div class="metric-label">Общий результат</div>
          </div>
        </v-card>

        <v-card class="metric-card">
          <div class="metric-icon">
            <v-icon color="primary" size="48">mdi-check</v-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">
              {{ testResult.correctAnswers }}/{{ testResult.totalQuestions }}
            </div>
            <div class="metric-label">Правильных ответов</div>
          </div>
        </v-card>

        <v-card class="metric-card">
          <div class="metric-icon">
            <v-icon color="warning" size="48">mdi-clock</v-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ testResult.timeSpent || '—' }}</div>
            <div class="metric-label">Время выполнения</div>
          </div>
        </v-card>

        <v-card class="metric-card">
          <div class="metric-icon">
            <v-icon color="info" size="48">mdi-speedometer</v-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ calculateAccuracy() }}%</div>
            <div class="metric-label">Точность</div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- График результатов -->
    <div class="chart-section">
      <v-card class="chart-card">
        <v-card-title class="chart-title">
          <v-icon left color="primary">mdi-chart-pie</v-icon>
          Распределение ответов
        </v-card-title>
        <v-card-text>
          <div class="chart-container">
            <div class="pie-chart">
              <div class="pie-chart-svg">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <!-- Правильные ответы -->
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="#10b981" 
                    stroke-width="20" 
                    :stroke-dasharray="`${correctPercentage * 565} 565`"
                    stroke-dashoffset="0"
                    transform="rotate(-90 100 100)"
                  />
                  <!-- Неправильные ответы -->
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="none" 
                    stroke="#ef4444" 
                    stroke-width="20" 
                    :stroke-dasharray="`${incorrectPercentage * 565} 565`"
                    :stroke-dashoffset="565 - (correctPercentage * 565)"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color correct"></div>
                  <div class="legend-text">
                    <span class="legend-percentage">{{ correctPercentage * 100 }}%</span>
                    <span class="legend-label">Правильные ({{ testResult.correctAnswers }})</span>
                  </div>
                </div>
                <div class="legend-item">
                  <div class="legend-color incorrect"></div>
                  <div class="legend-text">
                    <span class="legend-percentage">{{ incorrectPercentage * 100 }}%</span>
                    <span class="legend-label">Неправильные ({{ incorrectAnswers }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="questions-section">
      <v-card class="questions-card">
        <v-card-title class="questions-title">
          <v-icon left color="primary">mdi-help-circle</v-icon>
          Разбор вопросов
        </v-card-title>
        <v-card-text>
          <div class="questions-list">
            <div 
              v-for="question in questionsWithAnswers" 
              :key="question.id" 
              class="question-item"
              :class="{ 'correct': question.isCorrect, 'incorrect': !question.isCorrect }"
            >
              <div class="question-header">
                <div class="question-number">
                  Вопрос {{ question.number }}
                  <v-icon 
                    :color="question.isCorrect ? 'success' : 'error'" 
                    size="small"
                    class="ml-2"
                  >
                    {{ question.isCorrect ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </div>
                <div class="question-status">
                  <v-chip 
                    :color="question.isCorrect ? 'success' : 'error'" 
                    size="x-small"
                  >
                    {{ question.isCorrect ? 'Верно' : 'Неверно' }}
                  </v-chip>
                </div>
              </div>
              
              <div class="question-text">
                {{ question.text }}
              </div>
              
              <div class="question-answers">
                <div class="answer-section">
                  <div class="answer-label">Ваш ответ:</div>
                  <div class="user-answer" :class="{ 'correct': question.isCorrect }">
                    {{ question.userAnswer }}
                  </div>
                </div>
                
                <div v-if="!question.isCorrect" class="answer-section">
                  <div class="answer-label">Правильный ответ:</div>
                  <div class="correct-answer">
                    {{ question.correctAnswer }}
                  </div>
                </div>
                
                <div v-if="question.explanation" class="explanation-section">
                  <div class="explanation-label">Объяснение:</div>
                  <div class="explanation-text">
                    {{ question.explanation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="actions-section">
      <v-card class="actions-card">
        <v-card-text>
          <div class="actions-buttons">
            <v-btn 
              color="primary" 
              size="large" 
              @click="retryTest"
              class="action-btn"
            >
              <v-icon left>mdi-reload</v-icon>
              Пройти тест снова
            </v-btn>
            
            <v-btn 
              color="info" 
              variant="outlined" 
              size="large" 
              @click="downloadResults"
              class="action-btn"
            >
              <v-icon left>mdi-download</v-icon>
              Скачать результаты
            </v-btn>
            
            <v-btn 
              color="grey" 
              variant="text" 
              size="large" 
              to="/dashboard"
              class="action-btn"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Вернуться в кабинет
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const testResult = ref({})
const questionsWithAnswers = ref([])

onMounted(() => {
  loadTestResult()
})

const loadTestResult = () => {
  const savedResults = localStorage.getItem('testResults')
  if (savedResults) {
    const results = JSON.parse(savedResults)
    
    const result = results.find(r => 
      r.cardId == route.params.id || 
      (r.testId == route.query.testId && r.variantNumber == route.query.variantNumber)
    )
    
    if (result) {
      testResult.value = {
        ...result,
        testTitle: route.query.title || `Тест #${result.testId}`,
        subtitle: `Вариант ${result.variantNumber}`,
        totalQuestions: 15, // По умолчанию
        timestamp: result.timestamp || new Date().toISOString()
      }
      
      generateQuestions()
    } else {
      createDemoResult()
    }
  } else {
    createDemoResult()
  }
}

const createDemoResult = () => {
  testResult.value = {
    testTitle: route.query.title || 'Демо тест',
    subtitle: 'Демонстрация результатов',
    percentage: 73,
    correctAnswers: 11,
    totalQuestions: 15,
    timeSpent: '25 мин',
    timestamp: new Date().toISOString(),
    variantNumber: 1,
    testId: 1
  }
  generateQuestions()
}

const generateQuestions = () => {
  const questions = []
  const total = testResult.value.totalQuestions || 15
  const correct = testResult.value.correctAnswers || Math.floor(total * testResult.value.percentage / 100)
  
  for (let i = 1; i <= total; i++) {
    const isCorrect = i <= correct
    questions.push({
      id: i,
      number: i,
      text: `Пример вопроса ${i}: Какой результат будет у выражения?`,
      userAnswer: isCorrect ? 'Правильный ответ' : 'Неправильный ответ',
      correctAnswer: 'Правильный ответ',
      isCorrect: isCorrect,
      explanation: isCorrect 
        ? 'Вы правильно поняли концепцию.' 
        : 'Нужно внимательнее изучить материал.'
    })
  }
  
  questionsWithAnswers.value = questions
}

const correctPercentage = computed(() => {
  if (!testResult.value.totalQuestions) return 0
  return testResult.value.correctAnswers / testResult.value.totalQuestions
})

const incorrectPercentage = computed(() => {
  return 1 - correctPercentage.value
})

const incorrectAnswers = computed(() => {
  return testResult.value.totalQuestions - testResult.value.correctAnswers
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateAccuracy = () => {
  if (!testResult.value.totalQuestions) return 0
  return Math.round((testResult.value.correctAnswers / testResult.value.totalQuestions) * 100)
}

const retryTest = () => {
  router.push({
    path: `/tests/${testResult.value.cardId || 1}`,
    query: {
      title: testResult.value.testTitle,
      testId: testResult.value.testId,
      variantNumber: testResult.value.variantNumber
    }
  })
}

const downloadResults = () => {
  const content = `
    Результаты теста: ${testResult.value.testTitle}
    Дата: ${formatDate(testResult.value.timestamp)}
    Общий результат: ${testResult.value.percentage}%
    Правильных ответов: ${testResult.value.correctAnswers}/${testResult.value.totalQuestions}
    Время: ${testResult.value.timeSpent || '—'}
    
    Детальный разбор вопросов:
    ${questionsWithAnswers.value.map(q => `
    Вопрос ${q.number}: ${q.isCorrect ? '✓' : '✗'}
      Ваш ответ: ${q.userAnswer}
      ${!q.isCorrect ? `Правильный ответ: ${q.correctAnswer}` : ''}
      Объяснение: ${q.explanation}
    `).join('')}
  `
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `результаты-теста-${testResult.value.testTitle.toLowerCase().replace(/\s+/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.test-results-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff;
}

.header-section {
  margin-bottom: 40px;
}

.back-btn {
  margin-bottom: 20px;
}

.header-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 20px;
  color: #ffffff;
}

.test-info {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.test-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.test-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.test-meta {
  font-size: 0.9rem;
  color: #64748b;
  display: flex;
  gap: 8px;
}

/* Метрики */
.metrics-section {
  margin-bottom: 40px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metric-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.metric-icon {
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

/* График */
.chart-section {
  margin-bottom: 40px;
}

.chart-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-container {
  padding: 20px;
}

.pie-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
}

.pie-chart-svg {
  position: relative;
}

.pie-chart-svg svg {
  transform: rotate(90deg);
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 200px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-color.correct {
  background: #10b981;
}

.legend-color.incorrect {
  background: #ef4444;
}

.legend-text {
  display: flex;
  flex-direction: column;
}

.legend-percentage {
  font-weight: 600;
  color: #ffffff;
  font-size: 1.1rem;
}

.legend-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

.questions-section {
  margin-bottom: 40px;
}

.questions-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.questions-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.question-item.correct {
  border-left-color: #10b981;
}

.question-item.incorrect {
  border-left-color: #ef4444;
}

.question-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  font-weight: 600;
  color: #ffffff;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.question-text {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #e2e8f0;
}

.question-answers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.answer-label {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.user-answer {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #ffffff;
}

.user-answer.correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.correct-answer {
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-weight: 500;
}

.explanation-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.explanation-label {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 4px;
}

.explanation-text {
  color: #cbd5e1;
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Кнопки действий */
.actions-section {
  margin-bottom: 40px;
}

.actions-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.actions-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-btn {
  flex: 1;
}

@media (max-width: 768px) {
  .test-results-details {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .pie-chart {
    flex-direction: column;
    gap: 30px;
  }
  
  .actions-buttons {
    gap: 12px;
  }
}
</style>