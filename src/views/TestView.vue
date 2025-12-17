<template>
  <div class="test-page" v-if="test">
    <div class="test-header">
      <v-btn icon @click="goBack" class="back-button">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="header-info">
        <h1 class="test-title">{{ test.title }}</h1>
        <div class="test-meta">
          <v-chip size="small" :color="getLevelColor(test.level)" class="white--text">
            {{ capitalize(test.level) }}
          </v-chip>
          <span class="time-left">{{ formatTime(timeLeft) }}</span>
        </div>
      </div>
      <v-progress-linear
        :model-value="progress"
        height="8"
        color="primary"
        class="progress-bar"
      />
    </div>

    <div class="questions-container">
      <div v-for="(question, index) in questions" :key="question.id" class="question-card">
        <div class="question-header">
          <span class="question-number">Вопрос {{ index + 1 }}</span>
          <span class="question-points">+{{ question.points || 1 }} баллов</span>
        </div>
        
        <div class="question-text">{{ question.text }}</div>

        <div class="answers-container">
          <div
            v-for="(answer, ansIndex) in question.answers"
            :key="ansIndex"
            class="answer-item"
            :class="{
              'selected': selectedAnswers[question.id] === ansIndex,
              'correct': showResults && answer.isCorrect,
              'incorrect': showResults && selectedAnswers[question.id] === ansIndex && !answer.isCorrect
            }"
            @click="selectAnswer(question.id, ansIndex)"
          >
            <div class="answer-letter">{{ String.fromCharCode(65 + ansIndex) }}</div>
            <div class="answer-text">{{ answer.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <v-btn
        color="primary"
        size="large"
        @click="finishTest"
        :loading="loading"
        :disabled="!allQuestionsAnswered"
      >
        {{ showResults ? 'Посмотреть результаты' : 'Завершить тест' }}
      </v-btn>
    </div>

    <v-dialog v-model="resultsModal" max-width="500">
      <v-card class="results-card">
        <v-card-title class="results-title">
          <v-icon color="primary" class="mr-2">mdi-trophy</v-icon>
          Результаты теста
        </v-card-title>
        
        <v-card-text>
          <div class="results-stats">
            <div class="stat-item">
              <div class="stat-value">{{ correctAnswers }}</div>
              <div class="stat-label">Правильных ответов</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalPoints }}/{{ maxPoints }}</div>
              <div class="stat-label">Баллы</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ percentage }}%</div>
              <div class="stat-label">Процент выполнения</div>
            </div>
          </div>

          <div class="time-stat">
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            Время: {{ formatTime(test.timeLimit * 60 - timeLeft) }}
          </div>

          <v-btn
            block
            color="primary"
            class="mt-6"
            @click="goToResultsPage"
          >
            Подробная статистика
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const test = ref(null)
const questions = ref([])
const selectedAnswers = ref({})
const timeLeft = ref(0)
const timer = ref(null)
const showResults = ref(false)
const resultsModal = ref(false)
const loading = ref(false)

const progress = computed(() => {
  if (!questions.value.length) return 0
  return (Object.keys(selectedAnswers.value).length / questions.value.length) * 100
})

const allQuestionsAnswered = computed(() => {
  return questions.value.every(q => selectedAnswers.value[q.id] !== undefined)
})

const correctAnswers = computed(() => {
  return questions.value.filter(q => {
    const selected = selectedAnswers.value[q.id]
    return selected !== undefined && q.answers[selected]?.isCorrect
  }).length
})

const totalPoints = computed(() => {
  return questions.value.reduce((total, q) => {
    const selected = selectedAnswers.value[q.id]
    if (selected !== undefined && q.answers[selected]?.isCorrect) {
      return total + (q.points || 1)
    }
    return total
  }, 0)
})

const maxPoints = computed(() => {
  return questions.value.reduce((total, q) => total + (q.points || 1), 0)
})

const percentage = computed(() => {
  return Math.round((correctAnswers.value / questions.value.length) * 100)
})

onMounted(async () => {
  console.log(' TestView mounted')
  
  userStore.loadUser()
  
  const savedUser = localStorage.getItem('currentUser')
  const savedToken = localStorage.getItem('userToken')
  
  console.log(' Проверка авторизации в TestView:', {
    userInStore: userStore.user,
    localStorageUser: savedUser ? 'Есть' : 'Нет',
    token: savedToken ? 'Есть' : 'Нет'
  })
  
  await loadTest()
  startTimer()
})

onUnmounted(() => {
  clearInterval(timer.value)
})

const loadTest = async () => {
  try {
    const testId = route.params.id
    
    if (!testId) {
      console.error('ID теста не указан')
      router.push('/tests')
      return
    }
    
    console.log(` Загружаю тест ${testId}...`)
    

    try {
      const testRes = await axios.get(`https://6937d58d4618a71d77cdc83e.mockapi.io/users/${testId}`)
      test.value = testRes.data
      console.log('Тест загружен из MockAPI:', test.value.title)
    } catch (apiError) {
      console.log(' MockAPI недоступен, создаю демо тест')
      
      test.value = {
        id: testId,
        title: `Тест по программированию ${testId}`,
        timeLimit: 30,
        level: 'medium'
      }
    }
    
    await loadQuestions(testId)
    
    // Устанавливаем таймер
    timeLeft.value = (test.value.timeLimit || 30) * 60
  } catch (error) {
    console.error(' Ошибка загрузки теста:', error)
    
    test.value = {
      id: 'error',
      title: 'Тест временно недоступен',
      timeLimit: 0,
      level: 'easy'
    }
    
    questions.value = [{
      id: 1,
      text: 'Тест временно недоступен. Попробуйте позже.',
      answers: [
        { text: 'OK', isCorrect: true }
      ]
    }]
  }
}

const loadQuestions = async (testId) => {
  try {
    const questionsRes = await axios.get(`https://6937d58d4618a71d77cdc83e.mockapi.io/tests/${testId}/questions`)
    questions.value = questionsRes.data
    console.log(` Загружено ${questions.value.length} вопросов`)
  } catch (error) {
    console.log('Вопросы не найдены, создаю демо вопросы')
    
    questions.value = [
      {
        id: 1,
        text: 'Что такое Vue.js?',
        points: 1,
        answers: [
          { text: 'Фреймворк для JavaScript', isCorrect: true },
          { text: 'Язык программирования', isCorrect: false },
          { text: 'База данных', isCorrect: false },
          { text: 'Операционная система', isCorrect: false }
        ]
      },
      {
        id: 2,
        text: 'Какой метод используется для создания реактивных данных в Composition API?',
        points: 2,
        answers: [
          { text: 'ref()', isCorrect: true },
          { text: 'create()', isCorrect: false },
          { text: 'reactive()', isCorrect: true },
          { text: 'data()', isCorrect: false }
        ]
      }
    ]
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      finishTest()
    }
  }, 1000)
}

const selectAnswer = (questionId, answerIndex) => {
  if (showResults.value) return
  selectedAnswers.value[questionId] = answerIndex
}

const finishTest = async () => {
  showResults.value = true
  loading.value = true
  
  try {
    const user = userStore.user || JSON.parse(localStorage.getItem('currentUser'))
    
    if (user) {
      const result = {
        testId: test.value.id,
        userId: user.id,
        answers: selectedAnswers.value,
        score: totalPoints.value,
        percentage: percentage.value,
        timeSpent: (test.value.timeLimit * 60) - timeLeft.value,
        completedAt: new Date().toISOString()
      }
      
      await axios.post('https://6937d58d4618a71d77cdc83e.mockapi.io/results', result)
      console.log(' Результаты сохранены')
    } else {
      console.log('Пользователь не авторизован, результаты не сохранены')
    }
    
    resultsModal.value = true
  } catch (error) {
    console.error('Ошибка сохранения результатов:', error)
    
    resultsModal.value = true
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/tests')
}

const goToResultsPage = () => {
  router.push(`/results/${test.value.id}`)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getLevelColor = level => {
  const colors = { easy: 'success', medium: 'warning', hard: 'error' }
  return colors[level] || 'grey'
}

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
</script>

<style scoped>
/* Стили остаются без изменений */
.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 0;
}

.test-header {
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  margin-right: 16px;
}

.header-info {
  flex: 1;
}

.test-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word;
}

.test-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.time-left {
  color: #3b82f6;
  font-weight: 600;
  font-size: 1.125rem;
}

.progress-bar {
  margin-top: 16px;
  border-radius: 4px;
}

.questions-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.question-card {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.125rem;
}

.question-points {
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.question-text {
  color: white;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 24px;
  word-break: break-word;
}

.answers-container {
  display: grid;
  gap: 12px;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.answer-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.answer-item.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.answer-item.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.answer-item.incorrect {
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
  color: white;
  font-weight: 700;
  flex-shrink: 0;
}

.answer-item.selected .answer-letter {
  background: #3b82f6;
}

.answer-item.correct .answer-letter {
  background: #10b981;
}

.answer-item.incorrect .answer-letter {
  background: #ef4444;
}

.answer-text {
  color: white;
  flex: 1;
  word-break: break-word;
}

.action-buttons {
  position: sticky;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.results-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  color: white;
  border-radius: 20px;
}

.results-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 24px 0;
  text-align: center;
}

.stat-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

.time-stat {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 16px 0;
}

@media (max-width: 768px) {
  .test-header {
    padding: 16px;
  }
  
  .test-title {
    font-size: 1.25rem;
  }
  
  .questions-container {
    padding: 16px 12px;
  }
  
  .question-card {
    padding: 20px 16px;
  }
  
  .question-text {
    font-size: 1rem;
  }
  
  .results-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .action-buttons {
    padding: 16px;
  }
  
  .answer-item {
    padding: 12px;
  }
  
  .answer-letter {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .test-title {
    font-size: 1.125rem;
  }
  
  .time-left {
    font-size: 1rem;
  }
  
  .question-card {
    padding: 16px 12px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .answers-container {
    gap: 8px;
  }
}
</style>