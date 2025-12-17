<template>
  <div class="test-results-page">
    <!-- ХЕДЕР -->
    <div class="header-section">
      <div class="header-content">
        <v-btn
          icon
          @click="goBack"
          class="back-btn"
          size="large"
          color="white"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="header-text">
          <h1 class="header-title gradient-text">📊 Результаты теста</h1>
          <p class="header-subtitle" v-if="test">
            {{ test.title }}
          </p>
        </div>
      </div>
    </div>

    <!-- ОСНОВНЫЕ РЕЗУЛЬТАТЫ -->
    <div class="main-results-section">
      <v-card class="results-card gradient-card">
        <!-- ОБЩАЯ СТАТИСТИКА -->
        <div class="overall-stats">
          <div class="stat-item primary">
            <div class="stat-icon"></div>
            <div class="stat-content">
              <div class="stat-value">{{ calculatePercentage() }}%</div>
              <div class="stat-label">Общий результат</div>
            </div>
          </div>
          
          <div class="stat-item success">
            <div class="stat-icon"></div>
            <div class="stat-content">
              <div class="stat-value">{{ correctAnswers }}/{{ totalQuestions }}</div>
              <div class="stat-label">Правильных ответов</div>
            </div>
          </div>
          
          <div class="stat-item warning">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatTime(timeSpent) }}</div>
              <div class="stat-label">Затраченное время</div>
            </div>
          </div>
          
          <div class="stat-item info">
            <div class="stat-icon"></div>
            <div class="stat-content">
              <div class="stat-value">{{ score }}/{{ maxScore }}</div>
              <div class="stat-label">Баллы</div>
            </div>
          </div>
        </div>

        <!-- ГРАФИК РЕЗУЛЬТАТОВ -->
        <div class="results-chart">
          <div class="chart-container">
            <div class="chart-circle">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <!-- Фон -->
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  stroke-width="12"
                />
                <!-- Прогресс -->
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="`${circleLength} ${circleLength}`"
                  :stroke-dashoffset="circleLength - (circleLength * calculatePercentage() / 100)"
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
                <!-- Текст в центре -->
                <text
                  x="100"
                  y="100"
                  text-anchor="middle"
                  dy="8"
                  fill="#ffffff"
                  font-size="32"
                  font-weight="700"
                >
                  {{ calculatePercentage() }}%
                </text>
                <text
                  x="100"
                  y="130"
                  text-anchor="middle"
                  fill="rgba(255, 255, 255, 0.7)"
                  font-size="14"
                >
                  результат
                </text>
              </svg>
            </div>
          </div>
        </div>

        <!-- РАЗБИВКА ПО ТЕМАМ -->
        <div class="topics-breakdown" v-if="topics.length > 0">
          <h3 class="breakdown-title">📚 Результаты по темам</h3>
          <div class="topics-list">
            <div
              v-for="(topic, index) in topics"
              :key="index"
              class="topic-item"
            >
              <div class="topic-info">
                <div class="topic-name">{{ topic.name }}</div>
                <div class="topic-stats">
                  <span class="topic-correct">{{ topic.correct }}/{{ topic.total }}</span>
                  <span class="topic-percentage">{{ Math.round((topic.correct / topic.total) * 100) }}%</span>
                </div>
              </div>
              <v-progress-linear
                :model-value="(topic.correct / topic.total) * 100"
                height="8"
                :color="getTopicColor(topic)"
                rounded
                class="topic-progress"
              />
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <!-- ДЕТАЛЬНЫЙ ОБЗОР -->
    <div class="detailed-review" v-if="questions.length > 0">
      <h2 class="review-title">📝 Детальный обзор ответов</h2>
      
      <div class="questions-review">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-review-card"
          :class="{
            'correct': isQuestionCorrect(question),
            'incorrect': !isQuestionCorrect(question)
          }"
        >
          <div class="question-header">
            <div class="question-number">
              Вопрос {{ index + 1 }}
              <v-chip
                size="x-small"
                :color="isQuestionCorrect(question) ? 'success' : 'error'"
                class="ml-2 white--text"
              >
                {{ isQuestionCorrect(question) ? '✅' : '❌' }}
              </v-chip>
            </div>
            <div class="question-points">
              {{ isQuestionCorrect(question) ? question.points || 1 : 0 }}/{{ question.points || 1 }} баллов
            </div>
          </div>
          
          <div class="question-text">{{ question.text }}</div>
          
          <!-- Варианты ответов -->
          <div class="answers-review">
            <div
              v-for="(answer, ansIndex) in question.answers"
              :key="ansIndex"
              class="answer-review-item"
              :class="{
                'selected': selectedAnswers[question.id] === ansIndex,
                'correct': answer.isCorrect,
                'incorrect-selected': selectedAnswers[question.id] === ansIndex && !answer.isCorrect
              }"
            >
              <div class="answer-letter">
                {{ String.fromCharCode(65 + ansIndex) }}
              </div>
              <div class="answer-text">{{ answer.text }}</div>
              <div class="answer-status">
                <v-icon
                  v-if="answer.isCorrect"
                  color="success"
                  size="20"
                >
                  mdi-check-circle
                </v-icon>
                <v-icon
                  v-else-if="selectedAnswers[question.id] === ansIndex"
                  color="error"
                  size="20"
                >
                  mdi-close-circle
                </v-icon>
              </div>
            </div>
          </div>
          
          <!-- Объяснение -->
          <div class="explanation" v-if="question.explanation">
            <div class="explanation-title">💡 Объяснение:</div>
            <div class="explanation-text">{{ question.explanation }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- КНОПКИ ДЕЙСТВИЙ -->
    <div class="action-buttons">
      <v-btn
        color="primary"
        class="action-btn font-weight-bold white--text"
        size="large"
        @click="retryTest"
        block
      >
        🔄 Пройти тест заново
      </v-btn>
      
      <div class="secondary-buttons">
        <v-btn
          variant="tonal"
          color="success"
          class="secondary-btn"
          @click="shareResults"
        >
          <v-icon left>mdi-share</v-icon>
          Поделиться
        </v-btn>
        
        <v-btn
          variant="tonal"
          color="info"
          class="secondary-btn"
          @click="goToTests"
        >
          <v-icon left>mdi-view-list</v-icon>
          Все тесты
        </v-btn>
        
        <v-btn
          variant="tonal"
          color="warning"
          class="secondary-btn"
          @click="goToLeaderboard"
        >
          <v-icon left>mdi-trophy</v-icon>
          Таблица лидеров
        </v-btn>
      </div>
    </div>

    <!-- МОДАЛКА ПОДЕЛИТЬСЯ -->
    <v-dialog v-model="shareModal" max-width="500">
      <v-card class="share-modal">
        <v-card-title class="share-title">
          <v-icon color="primary" class="mr-2">mdi-share</v-icon>
          Поделиться результатом
        </v-card-title>
        
        <v-card-text>
          <div class="share-text">
            Я прошел тест "{{ test?.title }}" с результатом {{ calculatePercentage() }}%!
            Попробуй и ты: {{ windowUrl }}
          </div>
          
          <div class="share-actions">
            <v-btn
              color="primary"
              @click="copyToClipboard"
              block
              class="mb-3"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Скопировать
            </v-btn>
            
            <div class="social-buttons" v-if="canShareNative">
              <v-btn
                icon
                color="blue-darken-1"
                @click="shareToTelegram"
                size="large"
              >
                <v-icon>mdi-telegram</v-icon>
              </v-btn>
              
              <v-btn
                icon
                color="black"
                @click="shareToWhatsApp"
                size="large"
              >
                <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
              
              <v-btn
                icon
                color="blue"
                @click="shareToVK"
                size="large"
              >
                <v-icon>mdi-vk</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-btn @click="shareModal = false" block>Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const test = ref(null)
const questions = ref([])
const selectedAnswers = ref({})
const timeSpent = ref(0)
const score = ref(0)
const maxScore = ref(0)
const topics = ref([])
const shareModal = ref(false)
const windowUrl = window.location.origin

const circleLength = computed(() => 2 * Math.PI * 90)

const totalQuestions = computed(() => questions.value.length)

const correctAnswers = computed(() => {
  return questions.value.filter(q => isQuestionCorrect(q)).length
})

onMounted(async () => {
  await loadResults()
})

const loadResults = async () => {
  try {
    const testId = route.params.testId
    
    // Загружаем тест
    const testRes = await axios.get(`https://6937d58d4618a71d77cdc83e.mockapi.io/tests/${testId}`)
    test.value = testRes.data
    
    // Загружаем вопросы (симулируем - в реальном приложении будет другой API)
    const questionsRes = await axios.get(`https://6937d58d4618a71d77cdc83e.mockapi.io/questions?testId=${testId}`)
    questions.value = questionsRes.data
    
    // Загружаем ответы пользователя из localStorage или API
    const savedAnswers = localStorage.getItem(`test_${testId}_answers`)
    if (savedAnswers) {
      selectedAnswers.value = JSON.parse(savedAnswers)
    }

    const savedTime = localStorage.getItem(`test_${testId}_time`)
    if (savedTime) {
      timeSpent.value = parseInt(savedTime)
    }
    
    calculateScores()
    

    groupByTopics()
    

    saveResultToHistory()
    
  } catch (error) {
    console.error('Ошибка загрузки результатов:', error)
    // Если нет интернета или API недоступно, используем демо данные
    loadDemoResults()
  }
}

const loadDemoResults = () => {
  // Демо данные для тестирования
  test.value = {
    id: route.params.testId,
    title: 'Демо тест',
    subtitle: 'Тест для примера'
  }
  
  questions.value = [
    {
      id: 1,
      text: 'Столица Франции?',
      answers: [
        { text: 'Лондон', isCorrect: false },
        { text: 'Париж', isCorrect: true },
        { text: 'Берлин', isCorrect: false },
        { text: 'Мадрид', isCorrect: false }
      ],
      topic: 'География',
      points: 2,
      explanation: 'Париж - столица и крупнейший город Франции.'
    },
    {
      id: 2,
      text: '2 + 2 = ?',
      answers: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false }
      ],
      topic: 'Математика',
      points: 1,
      explanation: 'Базовая арифметика: 2 + 2 = 4'
    }
  ]
  
  selectedAnswers.value = {
    1: 1, // Правильно выбрал Париж
    2: 0  // Неправильно выбрал 3
  }
  
  timeSpent.value = 300 // 5 минут
  calculateScores()
  groupByTopics()
}

const calculateScores = () => {
  score.value = 0
  maxScore.value = 0
  
  questions.value.forEach(question => {
    const selected = selectedAnswers.value[question.id]
    const isCorrect = selected !== undefined && question.answers[selected]?.isCorrect
    
    maxScore.value += question.points || 1
    
    if (isCorrect) {
      score.value += question.points || 1
    }
  })
}

const groupByTopics = () => {
  const topicsMap = {}
  
  questions.value.forEach(question => {
    const topic = question.topic || 'Общие знания'
    const selected = selectedAnswers.value[question.id]
    const isCorrect = selected !== undefined && question.answers[selected]?.isCorrect
    
    if (!topicsMap[topic]) {
      topicsMap[topic] = {
        name: topic,
        correct: 0,
        total: 0
      }
    }
    
    topicsMap[topic].total++
    if (isCorrect) {
      topicsMap[topic].correct++
    }
  })
  
  topics.value = Object.values(topicsMap)
}

const saveResultToHistory = () => {
  const result = {
    testId: test.value.id,
    testTitle: test.value.title,
    score: score.value,
    maxScore: maxScore.value,
    percentage: calculatePercentage(),
    correctAnswers: correctAnswers.value,
    totalQuestions: totalQuestions.value,
    timeSpent: timeSpent.value,
    completedAt: new Date().toISOString()
  }
  
  // Сохраняем в localStorage
  const history = JSON.parse(localStorage.getItem('testHistory') || '[]')
  history.unshift(result)
  localStorage.setItem('testHistory', JSON.stringify(history.slice(0, 50))) // Храним последние 50 результатов
}

const isQuestionCorrect = (question) => {
  const selected = selectedAnswers.value[question.id]
  return selected !== undefined && question.answers[selected]?.isCorrect
}

const calculatePercentage = () => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctAnswers.value / totalQuestions.value) * 100)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getTopicColor = (topic) => {
  const percentage = (topic.correct / topic.total) * 100
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
}

const goBack = () => {
  router.push('/tests')
}

const goToTests = () => {
  router.push('/tests')
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

const retryTest = () => {
  router.push(`/tests/${test.value.id}`)
}

const shareResults = () => {
  shareModal.value = true
}

const canShareNative = computed(() => {
  return navigator.share && navigator.canShare
})

const copyToClipboard = async () => {
  const text = `Я прошел тест "${test.value.title}" с результатом ${calculatePercentage()}%! Попробуй и ты: ${window.location.href}`
  
  try {
    await navigator.clipboard.writeText(text)
    alert('Результат скопирован в буфер обмена!')
  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Результат скопирован в буфер обмена!')
  }
}

const shareToTelegram = () => {
  const text = encodeURIComponent(`Я прошел тест "${test.value.title}" с результатом ${calculatePercentage()}%!`)
  const url = `https://t.me/share/url?url=${window.location.href}&text=${text}`
  window.open(url, '_blank')
}

const shareToWhatsApp = () => {
  const text = encodeURIComponent(`Я прошел тест "${test.value.title}" с результатом ${calculatePercentage()}%! ${window.location.href}`)
  const url = `https://wa.me/?text=${text}`
  window.open(url, '_blank')
}

const shareToVK = () => {
  const url = `https://vk.com/share.php?url=${window.location.href}&title=Результат теста&description=Я прошел тест "${test.value.title}" с результатом ${calculatePercentage()}%!`
  window.open(url, '_blank')
}
</script>

<style scoped>
.test-results-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 0;
  position: relative;
}

.header-section {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  padding: 40px 20px 30px;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.header-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #cbd5e1;
  opacity: 0.9;
}

/* ОСНОВНЫЕ РЕЗУЛЬТАТЫ */
.main-results-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.results-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
}

.overall-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-item.primary {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
}

.stat-item.success {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
}

.stat-item.warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
}

.stat-item.info {
  border-color: rgba(6, 182, 212, 0.3);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05));
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ГРАФИК */
.results-chart {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.chart-container {
  position: relative;
}

.chart-circle {
  animation: circleAppear 1s ease-out;
}

@keyframes circleAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* РАЗБИВКА ПО ТЕМАМ */
.breakdown-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topics-list {
  display: grid;
  gap: 16px;
}

.topic-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.topic-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.topic-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 1.125rem;
}

.topic-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topic-correct {
  color: #10b981;
  font-weight: 600;
}

.topic-percentage {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.125rem;
}

.topic-progress {
  border-radius: 4px;
  overflow: hidden;
}

/* ДЕТАЛЬНЫЙ ОБЗОР */
.detailed-review {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.review-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.questions-review {
  display: grid;
  gap: 24px;
}

.question-review-card {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 20px;
  padding: 28px;
  border: 2px solid transparent;
  transition: transform 0.3s ease;
}

.question-review-card:hover {
  transform: translateY(-2px);
}

.question-review-card.correct {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(30, 41, 59, 0.7));
}

.question-review-card.incorrect {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(30, 41, 59, 0.7));
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.question-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-points {
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
}

.question-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 24px;
  word-break: break-word;
}

.answers-review {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.answer-review-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.answer-review-item.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.answer-review-item.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.answer-review-item.incorrect-selected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.answer-letter {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #ffffff;
  font-weight: 700;
  flex-shrink: 0;
}

.answer-review-item.selected .answer-letter {
  background: #3b82f6;
}

.answer-review-item.correct .answer-letter {
  background: #10b981;
}

.answer-review-item.incorrect-selected .answer-letter {
  background: #ef4444;
}

.answer-text {
  flex: 1;
  color: #ffffff;
  word-break: break-word;
}

.answer-status {
  flex-shrink: 0;
}

.explanation {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #3b82f6;
}

.explanation-title {
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
  font-size: 1rem;
}

.explanation-text {
  color: #cbd5e1;
  line-height: 1.6;
}

/* КНОПКИ ДЕЙСТВИЙ */
.action-buttons {
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.action-btn {
  border-radius: 16px;
  height: 56px;
  font-size: 1.125rem;
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.secondary-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.secondary-btn {
  border-radius: 12px;
  min-width: 140px;
}

.share-modal {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  color: white;
  border-radius: 20px;
}

.share-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.share-text {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  color: #cbd5e1;
  line-height: 1.6;
  word-break: break-word;
}

.share-actions {
  margin: 24px 0;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

/* АДАПТИВНОСТЬ */
@media (max-width: 768px) {
  .header-section {
    padding: 30px 16px 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .results-card {
    padding: 24px 16px;
    border-radius: 20px;
  }
  
  .overall-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .detailed-review,
  .action-buttons {
    padding: 0 16px;
  }
  
  .question-review-card {
    padding: 20px 16px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .secondary-buttons {
    flex-direction: column;
  }
  
  .secondary-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .chart-circle svg {
    width: 150px;
    height: 150px;
  }
  
  .answer-review-item {
    padding: 12px;
    gap: 12px;
  }
  
  .answer-letter {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}

/* Анимация появления */
.question-review-card,
.stat-item,
.topic-item {
  animation: slideUp 0.5s ease-out;
  animation-fill-mode: both;
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

/* Задержки для последовательной анимации */
.question-review-card:nth-child(1) { animation-delay: 0.1s; }
.question-review-card:nth-child(2) { animation-delay: 0.2s; }
.question-review-card:nth-child(3) { animation-delay: 0.3s; }
.question-review-card:nth-child(4) { animation-delay: 0.4s; }
.question-review-card:nth-child(5) { animation-delay: 0.5s; }
.question-review-card:nth-child(n+6) { animation-delay: 0.6s; }
</style>