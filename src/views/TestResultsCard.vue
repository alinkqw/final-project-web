<template>
  <div class="test-page" v-if="test">
    <v-app-bar color="primary" prominent class="test-header">
      <v-btn icon @click="goBack" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <v-app-bar-title class="text-h6 white--text">
        {{ test.title }}
      </v-app-bar-title>
      
      <v-spacer />
      
      <div class="timer-container mr-4">
        <v-chip color="warning" size="large" class="font-weight-bold">
          <v-icon start>mdi-timer</v-icon>
          {{ formatTime(timeLeft) }}
        </v-chip>
      </div>
      
      <div class="progress-container mr-4">
        <div class="text-caption white--text text-center mb-1">
          Вопрос {{ currentQuestionNumber + 1 }} из {{ questions.length }}
        </div>
        <v-progress-linear
          :model-value="progressPercentage"
          height="8"
          color="success"
          rounded
        />
      </div>

      <!-- Кнопка отладки -->
      <div class="debug-actions" v-if="debugMode">
        <v-btn @click="showDebugInfo" color="warning" size="small">
          <v-icon left>mdi-bug</v-icon>
          Отладка
        </v-btn>
      </div>
    </v-app-bar>

    <v-container class="question-container">
      <div v-if="loading" class="text-center py-16">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        />
        <div class="text-h6 white--text mt-4">Загрузка теста...</div>
      </div>

      <div v-else-if="testCompleted" class="results-container">
        <v-card class="results-card mx-auto">
          <v-card-title class="text-center text-h4 primary--text pa-8">
          Тест завершён!
          </v-card-title>
          
          <v-card-text class="pa-6">
            <div class="score-display mb-8">
              <div class="score-circle">
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="#e0e0e0"
                    stroke-width="10"
                    fill="none"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    :stroke="scoreColor"
                    stroke-width="10"
                    fill="none"
                    stroke-dasharray="565.48"
                    :stroke-dashoffset="565.48 * (1 - scorePercentage / 100)"
                    transform="rotate(-90 100 100)"
                  />
                  <text
                    x="100"
                    y="100"
                    text-anchor="middle"
                    dy=".3em"
                    font-size="32"
                    font-weight="bold"
                    :fill="scoreColor"
                  >
                    {{ scorePercentage }}%
                  </text>
                </svg>
                <p class="text-h6 mt-6 white--text text-center">{{ correctAnswers }}/{{ questions.length }} правильных</p>
              </div>
            </div>
            
            <div class="results-stats mb-8">
              <v-row class="mb-4">
                <v-col cols="6" class="text-center">
                  <div class="stat-item">
                    <div class="stat-value primary--text text-h4 font-weight-bold">{{ correctAnswers }}</div>
                    <div class="stat-label white--text text-body-2">Правильно</div>
                  </div>
                </v-col>
                <v-col cols="6" class="text-center">
                  <div class="stat-item">
                    <div class="stat-value error--text text-h4 font-weight-bold">{{ questions.length - correctAnswers }}</div>
                    <div class="stat-label white--text text-body-2">Ошибок</div>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="text-center">
                  <div class="stat-item">
                    <div class="stat-value info--text text-h4 font-weight-bold">{{ formatTime(test.timeLimit - timeLeft) }}</div>
                    <div class="stat-label white--text text-body-2">Время</div>
                  </div>
                </v-col>
                <v-col cols="6" class="text-center">
                  <div class="stat-item">
                    <div class="stat-value" :class="scoreColor + '--text'" style="font-size: 1.75rem; font-weight: bold;">
                      {{ scorePercentage }}%
                    </div>
                    <div class="stat-label white--text text-body-2">Результат</div>
                  </div>
                </v-col>
              </v-row>
            </div>
            
            <v-alert
              :color="getScoreAlertColor()"
              class="mb-8"
              variant="tonal"
              density="comfortable"
            >
              <div class="text-center">
                <div class="text-h6 font-weight-bold mb-2">{{ getScoreMessage() }}</div>
                <div class="text-body-2">{{ getScoreDescription() }}</div>
              </div>
            </v-alert>
            
            <div class="results-actions mt-8">
              <v-btn
                color="primary"
                size="large"
                @click="reviewTest"
                block
                class="mb-4"
                height="56"
              >
                <v-icon start>mdi-eye</v-icon>
                Просмотреть ответы
              </v-btn>
              
              <v-btn
                color="secondary"
                @click="goToAllTests"
                block
                class="mb-4"
                height="56"
              >
                <v-icon start>mdi-format-list-bulleted</v-icon>
                К списку тестов
              </v-btn>
              
              <v-btn
                variant="outlined"
                color="grey-lighten-2"
                @click="restartTest"
                block
                height="56"
              >
                <v-icon start>mdi-restart</v-icon>
                Пройти заново
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <div v-else-if="reviewingAnswers" class="review-container">
        <div class="d-flex justify-space-between align-center mb-6">
          <h2 class="text-h4 white--text">Результаты теста</h2>
          <v-btn @click="reviewingAnswers = false" color="primary">
            <v-icon start>mdi-arrow-left</v-icon>
            Назад к результатам
          </v-btn>
        </div>
        
        <v-card class="review-summary-card mb-6">
          <v-card-text class="pa-6">
            <div class="d-flex justify-space-between align-center">
              <div>
                <h3 class="text-h5 white--text mb-2">{{ test.title }}</h3>
                <div class="d-flex align-center">
                  <v-chip :color="scoreColor" class="mr-3 white--text">
                    {{ correctAnswers }}/{{ questions.length }}
                  </v-chip>
                  <span class="white--text">{{ scorePercentage }}%</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-body-2 grey--text mb-1">Время выполнения</div>
                <div class="text-h6 white--text">{{ formatTime(test.timeLimit - timeLeft) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <div v-for="(question, qIndex) in questions" :key="qIndex" class="mb-6">
          <v-card class="review-question-card">
            <v-card-title class="pa-6 pb-3">
              <div class="d-flex align-start">
                <v-chip :color="isAnswerCorrect(qIndex) ? 'success' : 'error'" class="mr-3 white--text" size="small">
                  {{ qIndex + 1 }}
                </v-chip>
                <div>
                  <div class="text-h6 white--text">{{ question.text }}</div>
                  <div class="d-flex align-center mt-2">
                    <v-chip :color="isAnswerCorrect(qIndex) ? 'success' : 'error'" size="small" variant="tonal">
                      {{ isAnswerCorrect(qIndex) ? 'Правильно' : 'Неправильно' }}
                    </v-chip>
                    <v-chip v-if="question.type === 'single'" size="small" variant="outlined" class="ml-2">
                      Один ответ
                    </v-chip>
                    <v-chip v-else size="small" variant="outlined" class="ml-2">
                      Несколько ответов
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6 pt-0">
              <div class="answers-review">
                <div 
                  v-for="(option, oIndex) in question.options" 
                  :key="oIndex"
                  class="answer-review-item mb-3"
                  :class="{
                    'correct-answer': isCorrectAnswer(qIndex, oIndex),
                    'user-answer': isUserAnswer(qIndex, oIndex),
                    'wrong-answer': isWrongAnswer(qIndex, oIndex)
                  }"
                >
                  <div class="d-flex align-center">
                    <div class="answer-indicator mr-3">
                      <v-icon v-if="isCorrectAnswer(qIndex, oIndex)" color="success">mdi-check-circle</v-icon>
                      <v-icon v-else-if="isWrongAnswer(qIndex, oIndex)" color="error">mdi-close-circle</v-icon>
                      <div v-else class="empty-circle"></div>
                    </div>
                    
                    <div class="answer-letter-container mr-3">
                      <span class="answer-letter">{{ String.fromCharCode(65 + oIndex) }}</span>
                    </div>
                    
                    <div class="answer-text white--text flex-grow-1">{{ option }}</div>
                    
                    <div class="answer-status ml-3">
                      <v-chip v-if="isCorrectAnswer(qIndex, oIndex) && isUserAnswer(qIndex, oIndex)" 
                              size="x-small" color="success" class="white--text">
                        Ваш ответ
                      </v-chip>
                      <v-chip v-else-if="isCorrectAnswer(qIndex, oIndex)" 
                              size="x-small" color="success" variant="tonal">
                        Правильный
                      </v-chip>
                      <v-chip v-else-if="isWrongAnswer(qIndex, oIndex)" 
                              size="x-small" color="error" variant="tonal">
                        Ваш ответ
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
              
              <v-alert v-if="question.explanation" color="info" variant="tonal" class="mt-4">
                <div class="d-flex">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  <div>
                    <div class="font-weight-bold mb-1">Объяснение:</div>
                    <div class="text-body-2">{{ question.explanation }}</div>
                  </div>
                </div>
              </v-alert>
            </v-card-text>
          </v-card>
        </div>
        
        <v-card class="mt-6 pa-4">
          <div class="d-flex justify-center">
            <v-btn @click="restartTest" color="primary" class="mr-4">
              <v-icon start>mdi-restart</v-icon>
              Пройти тест заново
            </v-btn>
            <v-btn @click="goToAllTests" variant="outlined" color="grey-lighten-2">
              <v-icon start>mdi-format-list-bulleted</v-icon>
              К списку тестов
            </v-btn>
          </div>
        </v-card>
      </div>

      <div v-else-if="currentQuestion" class="current-question">
        <div class="progress-bar mb-6">
          <v-progress-linear
            :model-value="progressPercentage"
            height="10"
            color="primary"
            rounded
          />
          <div class="d-flex justify-space-between mt-2">
            <span class="text-caption grey--text">
              Вопрос {{ currentQuestionNumber + 1 }} из {{ questions.length }}
            </span>
            <span class="text-caption grey--text">
              {{ progressPercentage }}%
            </span>
          </div>
        </div>

        <v-alert
          :color="currentQuestion.type === 'single' ? 'info' : 'warning'"
          density="comfortable"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2">
              {{ currentQuestion.type === 'single' ? 'mdi-radiobox-marked' : 'mdi-checkbox-multiple-marked' }}
            </v-icon>
            <span class="font-weight-medium">
              {{ currentQuestion.type === 'single' ? 'Выберите один вариант' : 'Выберите один или несколько вариантов' }}
            </span>
          </div>
        </v-alert>


        <v-card class="question-card mb-4">
          <v-card-title class="text-h5 mb-4 white--text pa-5">
            {{ currentQuestion.text }}
          </v-card-title>

          <div class="answers-container pa-5 pt-0">
            <v-radio-group 
              v-if="currentQuestion.type === 'single'"
              v-model="selectedAnswers[currentQuestionNumber]"
              class="answers-list"
            >
              <v-radio
                v-for="(option, oIdx) in currentQuestion.options"
                :key="oIdx"
                :value="oIdx"
                class="answer-option mb-3"
              >
                <template v-slot:label>
                  <div class="answer-label">
                    <div class="answer-letter-container">
                      <span class="answer-letter">{{ String.fromCharCode(65 + oIdx) }}</span>
                    </div>
                    <span class="answer-text white--text ml-3">{{ option }}</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <div v-else-if="currentQuestion.type === 'multiple'" class="answers-list">
              <v-checkbox
                v-for="(option, oIdx) in currentQuestion.options"
                :key="oIdx"
                v-model="selectedAnswersMultiple[currentQuestionNumber]"
                :value="oIdx"
                class="answer-option mb-3"
              >
                <template v-slot:label>
                  <div class="answer-label">
                    <div class="answer-letter-container">
                      <span class="answer-letter">{{ String.fromCharCode(65 + oIdx) }}</span>
                    </div>
                    <span class="answer-text white--text ml-3">{{ option }}</span>
                  </div>
                </template>
              </v-checkbox>
            </div>
          </div>

          <v-card-actions class="px-5 pb-5 pt-0">
            <v-alert
              v-if="!isAnswerSelected"
              color="grey-darken-3"
              density="compact"
              variant="tonal"
              class="w-100"
            >
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-2">mdi-information</v-icon>
                <span class="text-caption">
                  {{ currentQuestion.type === 'single' 
                    ? 'Выберите один вариант' 
                    : 'Выберите один или несколько вариантов' }}
                </span>
              </div>
            </v-alert>
            <v-alert
              v-else
              color="success"
              density="compact"
              variant="tonal"
              class="w-100"
            >
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-2">mdi-check-circle</v-icon>
                <span class="text-caption">Ответ выбран</span>
              </div>
            </v-alert>
          </v-card-actions>
        </v-card>

        <v-card class="navigation-card pa-4">
          <div class="navigation-buttons">
            <v-btn
              v-if="currentQuestionNumber > 0"
              @click="prevQuestion"
              variant="tonal"
              color="grey-lighten-1"
              class="mr-3"
              min-width="120"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Назад
            </v-btn>
            
            <v-spacer />
            
            <v-btn
              v-if="currentQuestionNumber < questions.length - 1"
              @click="nextQuestion"
              color="primary"
              :disabled="!isAnswerSelected"
              min-width="120"
            >
              Далее
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
            
            <v-btn
              v-else
              @click="finishTest"
              color="success"
              :disabled="!isAnswerSelected"
              min-width="160"
            >
              <v-icon start>mdi-check-circle</v-icon>
              Завершить
            </v-btn>
          </div>
        </v-card>

        <v-card class="quick-nav-card mt-4 pa-4">
          <div class="quick-nav-buttons d-flex justify-center flex-wrap">
            <v-btn
              v-for="qNum in questions.length"
              :key="qNum"
              @click="goToQuestion(qNum - 1)"
              :color="getQuestionButtonColor(qNum - 1)"
              size="small"
              variant="tonal"
              class="ma-1"
              min-width="40"
              height="40"
            >
              {{ qNum }}
            </v-btn>
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import testsData from '@/data/tests.json'

const router = useRouter()
const route = useRoute()

const test = ref(null)
const questions = ref([])
const loading = ref(true)
const currentQuestionNumber = ref(0)
const selectedAnswers = ref([])
const selectedAnswersMultiple = ref([])
const timeLeft = ref(0)
const timerInterval = ref(null)
const testCompleted = ref(false)
const reviewingAnswers = ref(false)

// Переменные для отладки
const debugMode = ref(true)

onMounted(() => {
  loadTestData()
})

onUnmounted(() => {
  clearTimer()
})

watch(
  () => route.query,
  () => {
    if (route.query.testId) {
      restartTestWithNewId()
    }
  }
)

const restartTestWithNewId = () => {
  if (confirm('Начать новый тест? Текущий прогресс будет потерян.')) {
    loadTestData()
  }
}

const loadTestData = () => {
  let testId
  
  if (route.query.testId) {
    testId = parseInt(route.query.testId)
  }
  else if (route.query.originalTestId) {
    testId = parseInt(route.query.originalTestId)
  }
  else if (route.params.id) {
    const paramId = parseInt(route.params.id)
    if (paramId > 6) {
      testId = ((paramId - 1) % 6) + 1
    } else {
      testId = paramId
    }
  }
  
  if (!testId || testId < 1 || testId > 6) {
    testId = 1
  }
  
  const foundTest = testsData.tests.find(t => t.id === testId)
  
  if (!foundTest) {
    testId = 1
  }
  
  const targetTest = testsData.tests.find(t => t.id === testId) || testsData.tests[0]
  
  if (!targetTest) {
    alert('Ошибка загрузки тестов. Пожалуйста, вернитесь к списку тестов.')
    router.push('/tests')
    return
  }
  
  test.value = {
    ...targetTest,
    id: targetTest.id,
    title: route.query.title || targetTest.title,
    timeLimit: (parseInt(route.query.timeLimit) || Math.floor((targetTest.timeLimit || 1800) / 60)) * 60,
    description: targetTest.description
  }
  
  questions.value = targetTest.questions || []
  
  if (questions.value.length === 0) {
    alert('В этом тесте нет вопросов. Пожалуйста, выберите другой тест.')
    router.push('/tests')
    return
  }
  
  timeLeft.value = test.value.timeLimit || 1800
  selectedAnswers.value = new Array(questions.value.length).fill(null)
  selectedAnswersMultiple.value = new Array(questions.value.length).fill([])
  currentQuestionNumber.value = 0
  testCompleted.value = false
  reviewingAnswers.value = false
  
  startTimer()
  
  loading.value = false
}

const isAnswerCorrect = (questionIndex) => {
  const question = questions.value[questionIndex]
  if (!question) return false
  
  if (question.type === 'single') {
    return selectedAnswers.value[questionIndex] === question.correct
  } else if (question.type === 'multiple') {
    const userAnswer = selectedAnswersMultiple.value[questionIndex] || []
    const userSorted = [...userAnswer].sort()
    const correctSorted = [...question.correct].sort()
    return JSON.stringify(userSorted) === JSON.stringify(correctSorted)
  }
  return false
}

const isCorrectAnswer = (questionIndex, optionIndex) => {
  const question = questions.value[questionIndex]
  if (!question) return false
  
  if (question.type === 'single') {
    return question.correct === optionIndex
  } else if (question.type === 'multiple') {
    return question.correct.includes(optionIndex)
  }
  return false
}

const isUserAnswer = (questionIndex, optionIndex) => {
  const question = questions.value[questionIndex]
  if (!question) return false
  
  if (question.type === 'single') {
    return selectedAnswers.value[questionIndex] === optionIndex
  } else if (question.type === 'multiple') {
    return (selectedAnswersMultiple.value[questionIndex] || []).includes(optionIndex)
  }
  return false
}

const isWrongAnswer = (questionIndex, optionIndex) => {
  return isUserAnswer(questionIndex, optionIndex) && !isCorrectAnswer(questionIndex, optionIndex)
}

const nextQuestion = () => {
  if (currentQuestionNumber.value < questions.value.length - 1) {
    currentQuestionNumber.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionNumber.value > 0) {
    currentQuestionNumber.value--
  }
}

const goToQuestion = (index) => {
  if (index >= 0 && index < questions.value.length) {
    currentQuestionNumber.value = index
  }
}

const finishTest = () => {
  clearTimer()
  testCompleted.value = true
  saveTestResults()
}

const reviewTest = () => {
  reviewingAnswers.value = true
}

const startTimer = () => {
  clearTimer()
  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      finishTest()
    }
  }, 1000)
}

const clearTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const progressPercentage = computed(() => {
  if (!questions.value.length) return 0
  return Math.round(((currentQuestionNumber.value + 1) / questions.value.length) * 100)
})

const currentQuestion = computed(() => {
  return questions.value[currentQuestionNumber.value] || null
})

const isAnswerSelected = computed(() => {
  const question = currentQuestion.value
  if (!question) return false
  
  if (question.type === 'single') {
    return selectedAnswers.value[currentQuestionNumber.value] !== null
  } else if (question.type === 'multiple') {
    return selectedAnswersMultiple.value[currentQuestionNumber.value].length > 0
  }
  return false
})

const getQuestionButtonColor = (questionIndex) => {
  const question = questions.value[questionIndex]
  if (!question) return 'grey'
  
  let isAnswered = false
  if (question.type === 'single') {
    isAnswered = selectedAnswers.value[questionIndex] !== null
  } else if (question.type === 'multiple') {
    isAnswered = selectedAnswersMultiple.value[questionIndex].length > 0
  }
  
  if (questionIndex === currentQuestionNumber.value) return 'primary'
  if (isAnswered) return 'success'
  return 'grey'
}

const correctAnswers = computed(() => {
  let correct = 0
  questions.value.forEach((_, index) => {
    if (isAnswerCorrect(index)) correct++
  })
  return correct
})

const scorePercentage = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((correctAnswers.value / questions.value.length) * 100)
})

const scoreColor = computed(() => {
  if (scorePercentage.value >= 80) return '#10b981'
  if (scorePercentage.value >= 50) return '#f59e0b'
  return '#ef4444'
})

const getScoreAlertColor = () => {
  if (scorePercentage.value >= 80) return 'success'
  if (scorePercentage.value >= 50) return 'warning'
  return 'error'
}

const getScoreMessage = () => {
  if (scorePercentage.value >= 90) return 'Отлично!'
  if (scorePercentage.value >= 75) return 'Хорошо!'
  if (scorePercentage.value >= 60) return 'Неплохо'
  if (scorePercentage.value >= 40) return 'Можно лучше'
  return 'Нужно повторить'
}

const getScoreDescription = () => {
  if (scorePercentage.value >= 90) return 'Вы отлично знаете материал!'
  if (scorePercentage.value >= 75) return 'Вы хорошо разбираетесь в теме.'
  if (scorePercentage.value >= 60) return 'Некоторые темы требуют повторения.'
  if (scorePercentage.value >= 40) return 'Рекомендуется пройти тест еще раз.'
  return 'Не расстраивайтесь! Практика приведет к успеху.'
}

const saveTestResults = () => {
  const result = {
    id: Date.now().toString(),
    testId: test.value.id,
    testTitle: test.value.title,
    date: new Date().toISOString(),
    correctAnswers: correctAnswers.value,
    totalQuestions: questions.value.length,
    percentage: scorePercentage.value,
    timeSpent: (test.value.timeLimit || 1800) - timeLeft.value,
    answers: selectedAnswers.value,
    multipleAnswers: selectedAnswersMultiple.value,
    cardId: route.params.id,
    variantNumber: route.query.variantNumber || 1
  }
  
  const results = JSON.parse(localStorage.getItem('testResults') || '[]')
  results.push(result)
  localStorage.setItem('testResults', JSON.stringify(results))
}

const goBack = () => {
  if (testCompleted.value || confirm('Вы уверены? Прогресс будет потерян.')) {
    router.push('/tests')
  }
}

const goToAllTests = () => {
  router.push('/tests')
}

const restartTest = () => {
  if (confirm('Начать тест заново?')) {
    currentQuestionNumber.value = 0
    selectedAnswers.value = new Array(questions.value.length).fill(null)
    selectedAnswersMultiple.value = new Array(questions.value.length).fill([])
    timeLeft.value = test.value.timeLimit || 1800
    testCompleted.value = false
    reviewingAnswers.value = false
    startTimer()
  }
}

// Функция для отладки
const showDebugInfo = () => {
  const allResults = JSON.parse(localStorage.getItem('testResults') || '[]')
  const testResult = {
    id: Date.now().toString(),
    testId: test.value.id,
    testTitle: test.value.title,
    date: new Date().toISOString(),
    correctAnswers: correctAnswers.value,
    totalQuestions: questions.value.length,
    percentage: scorePercentage.value,
    timeSpent: (test.value.timeLimit || 1800) - timeLeft.value,
    answers: selectedAnswers.value,
    multipleAnswers: selectedAnswersMultiple.value,
    cardId: route.params.id,
    variantNumber: route.query.variantNumber || 1
  }
  
  console.log('=== ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ===')
  console.log('Текущий результат:', testResult)
  console.log('Всего результатов в localStorage:', allResults.length)
  console.log('Все результаты:', allResults)
  console.log('Route params:', route.params)
  console.log('Route query:', route.query)
  console.log('Текущий тест:', test.value)
  console.log('Всего вопросов:', questions.value.length)
  console.log('Текущий вопрос:', currentQuestionNumber.value + 1)
  console.log('Выбранные ответы (single):', selectedAnswers.value)
  console.log('Выбранные ответы (multiple):', selectedAnswersMultiple.value)
  console.log('Время осталось:', timeLeft.value, 'секунд')
  console.log('Тест завершен:', testCompleted.value)
  console.log('Режим просмотра:', reviewingAnswers.value)
  
  alert(`Всего результатов в localStorage: ${allResults.length}\n\nПосмотрите консоль браузера для деталей`)
}
</script>

<style scoped>

.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding-bottom: 40px;
}

.test-header {
  background: rgba(30, 41, 59, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.timer-container {
  min-width: 120px;
}

.progress-container {
  min-width: 150px;
}

.debug-actions {
  margin-left: 10px;
}

.question-container {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 32px;
}

.question-card,
.navigation-card,
.quick-nav-card,
.results-card,
.review-summary-card,
.review-question-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.results-card {
  max-width: 700px;
  margin: 40px auto;
}

.progress-bar {
  margin-bottom: 32px;
}

.answer-label {
  display: flex;
  align-items: center;
  width: 100%;
}

.answer-letter-container {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.answer-letter {
  font-weight: bold;
  color: #3b82f6;
  font-size: 1rem;
}

.answer-text {
  flex: 1;
  word-break: break-word;
  line-height: 1.5;
  margin-left: 12px;
}

.navigation-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-nav-buttons {
  gap: 8px;
}

.score-circle {
  position: relative;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}

.score-circle svg {
  width: 100%;
  height: 100%;
}

.stat-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  margin-bottom: 4px;
}

.results-actions {
  max-width: 400px;
  margin: 0 auto;
}

.review-question-card {
  margin-bottom: 16px;
}

.answers-review {
  margin-top: 8px;
}

.answer-review-item {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.correct-answer {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.user-answer {
  border: 2px solid rgba(59, 130, 246, 0.5);
}

.wrong-answer {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.answer-indicator {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.answer-status {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .test-header :deep(.v-toolbar__content) {
    flex-wrap: wrap;
    padding: 8px 16px;
  }
  
  .timer-container,
  .progress-container,
  .debug-actions {
    min-width: auto;
    margin-top: 8px;
    width: 100%;
  }
  
  .debug-actions {
    display: flex;
    justify-content: center;
  }
  
  .question-container {
    padding: 20px 16px;
  }
  
  .question-card,
  .navigation-card,
  .review-question-card {
    padding: 20px;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .navigation-buttons .v-btn {
    width: 100%;
  }
  
  .review-question-card .v-card-title {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .answer-review-item .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .answer-review-item .answer-status {
    margin-top: 8px;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .question-container {
    padding: 16px 12px;
  }
  
  .answer-letter-container {
    width: 32px;
    height: 32px;
  }
  
  .stat-item {
    padding: 12px;
  }
}
</style>