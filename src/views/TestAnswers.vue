<template>
  <div class="answers-page">
    <!-- Шапка -->
    <v-app-bar color="primary" prominent class="answers-header">
      <v-btn icon @click="goBack" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <v-app-bar-title class="text-h6 white--text">
        📚 Ответы к тесту
      </v-app-bar-title>
      
      <v-spacer />
      
      <!-- Информация о тесте -->
      <div class="test-info">
        <v-chip color="primary" class="mr-2">
          {{ test?.title }}
        </v-chip>
        <span class="white--text mr-4">{{ questions.length }} вопросов</span>
      </div>
    </v-app-bar>

    <!-- Контент -->
    <v-container class="answers-container">
      <!-- Загрузка -->
      <div v-if="loading" class="text-center py-16">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        />
        <div class="text-h6 white--text mt-4">Загрузка ответов...</div>
      </div>

      <!-- Основной контент -->
      <div v-else-if="test" class="answers-content">
        <!-- Информация о тесте -->
        <v-card class="test-summary-card mb-6">
          <v-card-title class="pa-6">
            <div class="d-flex align-center justify-space-between w-100">
              <div>
                <h2 class="text-h4 white--text">{{ test.title }}</h2>
                <div class="d-flex align-center mt-2">
                  <v-chip :color="getLevelColor(test.level)" class="mr-2 white--text">
                    {{ capitalize(test.level) }}
                  </v-chip>
                  <span class="white--text text-body-2">{{ test.description }}</span>
                </div>
              </div>
              <div class="text-right">
                <v-btn color="primary" @click="goToTest">
                  <v-icon start>mdi-play</v-icon>
                  Пройти тест
                </v-btn>
              </div>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-6 pt-0">
            <div class="d-flex justify-space-between">
              <div class="stat-item">
                <div class="stat-value text-h4 primary--text">{{ questions.length }}</div>
                <div class="stat-label white--text">Всего вопросов</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 success--text">{{ getSingleChoiceCount }}</div>
                <div class="stat-label white--text">Один ответ</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 warning--text">{{ getMultipleChoiceCount }}</div>
                <div class="stat-label white--text">Несколько ответов</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4">{{ formatTime(test.timeLimit) }}</div>
                <div class="stat-label white--text">Время</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Список вопросов с ответами -->
        <div class="questions-list">
          <div v-for="(question, index) in questions" :key="index" class="question-item">
            <v-card class="question-card">
              <!-- Заголовок вопроса -->
              <v-card-title class="question-header pa-6 pb-3">
                <div class="d-flex align-start w-100">
                  <!-- Номер вопроса -->
                  <div class="question-number mr-4">
                    <v-chip color="primary" size="large" class="white--text">
                      {{ index + 1 }}
                    </v-chip>
                  </div>
                  
                  <!-- Текст вопроса -->
                  <div class="question-text flex-grow-1">
                    <h3 class="text-h6 white--text mb-2">{{ question.text }}</h3>
                    
                    <!-- Тип вопроса -->
                    <div class="d-flex align-center mt-2">
                      <v-chip 
                        :color="question.type === 'single' ? 'info' : 'warning'" 
                        size="small" 
                        class="mr-2 white--text"
                      >
                        {{ question.type === 'single' ? 'Один правильный ответ' : 'Несколько правильных ответов' }}
                      </v-chip>
                      <v-chip v-if="question.explanation" size="small" variant="tonal" color="grey">
                        <v-icon size="small" class="mr-1">mdi-information</v-icon>
                        Есть объяснение
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card-title>

              <!-- Варианты ответов -->
              <v-card-text class="answers-list pa-6 pt-0">
                <div 
                  v-for="(option, optionIndex) in question.options" 
                  :key="optionIndex"
                  class="answer-item mb-3"
                  :class="{ 'correct-answer': isCorrectAnswer(question, optionIndex) }"
                >
                  <div class="d-flex align-center">
                    <!-- Индикатор правильности -->
                    <div class="answer-indicator mr-3">
                      <v-icon 
                        v-if="isCorrectAnswer(question, optionIndex)" 
                        color="success"
                        size="24"
                      >
                        mdi-check-circle
                      </v-icon>
                      <v-icon 
                        v-else 
                        color="grey-darken-2"
                        size="24"
                      >
                        mdi-circle-outline
                      </v-icon>
                    </div>
                    
                    <!-- Буква варианта -->
                    <div class="answer-letter mr-3">
                      <v-chip size="small" variant="tonal" color="grey">
                        {{ String.fromCharCode(65 + optionIndex) }}
                      </v-chip>
                    </div>
                    
                    <!-- Текст варианта -->
                    <div class="answer-text flex-grow-1">
                      <span class="white--text">{{ option }}</span>
                    </div>
                    
                    <!-- Метка правильного ответа -->
                    <div v-if="isCorrectAnswer(question, optionIndex)" class="correct-label ml-3">
                      <v-chip size="x-small" color="success" class="white--text">
                        Правильный
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card-text>

              <!-- Объяснение (если есть) -->
              <v-card-text v-if="question.explanation" class="explanation pa-6 pt-0">
                <v-alert color="info" variant="tonal" class="mt-3">
                  <div class="d-flex align-start">
                    <v-icon class="mr-2 mt-1">mdi-lightbulb-on</v-icon>
                    <div>
                      <div class="font-weight-bold mb-1">Объяснение:</div>
                      <div class="text-body-2">{{ question.explanation }}</div>
                    </div>
                  </div>
                </v-alert>
              </v-card-text>

              <!-- Статистика по вопросу -->
              <v-card-actions class="pa-6 pt-0">
                <div class="question-stats d-flex align-center w-100">
                  <div class="text-caption grey--text">
                    Вопрос {{ index + 1 }} из {{ questions.length }}
                  </div>
                  <v-spacer />
                  <v-chip v-if="question.type === 'single'" size="small" variant="outlined" color="grey">
                    Правильный ответ: {{ String.fromCharCode(65 + getCorrectAnswerIndex(question)) }}
                  </v-chip>
                  <v-chip v-else size="small" variant="outlined" color="grey">
                    Правильных ответов: {{ getCorrectAnswersCount(question) }}
                  </v-chip>
                </div>
              </v-card-actions>
            </v-card>
          </div>
        </div>

        <!-- Кнопки внизу страницы -->
        <v-card class="actions-card mt-6 pa-4">
          <div class="d-flex justify-center">
            <v-btn @click="goToTest" color="primary" class="mr-4" size="large">
              <v-icon start>mdi-play-circle</v-icon>
              Пройти этот тест
            </v-btn>
            <v-btn @click="goToAllTests" variant="outlined" color="grey-lighten-2" size="large">
              <v-icon start>mdi-format-list-bulleted</v-icon>
              К списку тестов
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Если тест не найден -->
      <div v-else class="not-found text-center py-16">
        <v-icon size="96" color="grey" class="mb-4">mdi-help-circle</v-icon>
        <h2 class="text-h4 white--text mb-4">Тест не найден</h2>
        <p class="text-body-1 grey--text mb-6">
          Извините, не удалось загрузить ответы для этого теста.
        </p>
        <v-btn @click="goToAllTests" color="primary" size="large">
          <v-icon start>mdi-arrow-left</v-icon>
          Вернуться к списку тестов
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import testsData from '@/data/tests.json'

const router = useRouter()
const route = useRoute()

const test = ref(null)
const questions = ref([])
const loading = ref(true)

onMounted(() => {
  loadTestData()
})

const loadTestData = () => {
  console.log('TestAnswers: Загружаем ответы...')
  console.log('Route params:', route.params)
  console.log('Route query:', route.query)
  
  // Получаем ID теста
  const testId = parseInt(route.query.testId) || parseInt(route.params.id) || 1
  
  console.log('Ищем тест с ID:', testId)
  
  // Ищем тест в базе
  const foundTest = testsData.tests.find(t => t.id === testId)
  
  if (!foundTest) {
    console.error('Тест не найден:', testId)
    loading.value = false
    return
  }
  
  test.value = {
    ...foundTest,
    title: route.query.title || foundTest.title,
    timeLimit: foundTest.timeLimit || 1800,
    level: foundTest.level || 'medium'
  }
  
  questions.value = foundTest.questions || []
  loading.value = false
  
  console.log('✅ Ответы загружены:', {
    title: test.value.title,
    questionsCount: questions.value.length
  })
}

// Вспомогательные функции
const isCorrectAnswer = (question, optionIndex) => {
  if (question.type === 'single') {
    return question.correct === optionIndex
  } else if (question.type === 'multiple') {
    return question.correct.includes(optionIndex)
  }
  return false
}

const getCorrectAnswerIndex = (question) => {
  if (question.type === 'single') {
    return question.correct
  }
  return -1
}

const getCorrectAnswersCount = (question) => {
  if (question.type === 'multiple') {
    return question.correct.length
  }
  return 1
}

const getSingleChoiceCount = computed(() => {
  return questions.value.filter(q => q.type === 'single').length
})

const getMultipleChoiceCount = computed(() => {
  return questions.value.filter(q => q.type === 'multiple').length
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes} мин`
}

const getLevelColor = (level) => {
  const mapping = { 'новичок': 'success', 'средний': 'warning', 'экзамен': 'error' }
  return mapping[level] || 'grey'
}

const capitalize = (str) => {
  if (!str) return ''
  const mapping = {
    'новичок': 'Начинающий',
    'средний': 'Средний',
    'экзамен': 'Экзамен'
  }
  return mapping[str] || str.charAt(0).toUpperCase() + str.slice(1)
}

// Навигация
const goBack = () => {
  router.back()
}

const goToTest = () => {
  if (test.value) {
    router.push({
      path: `/tests/${route.params.id || '1'}`,
      query: {
        title: test.value.title,
        timeLimit: Math.floor(test.value.timeLimit / 60),
        testId: test.value.id
      }
    })
  }
}

const goToAllTests = () => {
  router.push('/tests')
}
</script>

<style scoped>
.answers-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

.answers-header {
  background: rgba(30, 41, 59, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.test-info {
  display: flex;
  align-items: center;
}

.answers-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
}

.test-summary-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  min-width: 120px;
}

.stat-value {
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.questions-list {
  margin-top: 24px;
}

.question-item {
  margin-bottom: 24px;
}

.question-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.question-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.question-number {
  flex-shrink: 0;
}

.answers-list {
  padding-top: 0;
}

.answer-item {
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.answer-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.correct-answer {
  background: rgba(16, 185, 129, 0.1) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
}

.answer-indicator {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-letter {
  flex-shrink: 0;
}

.answer-text {
  flex: 1;
  word-break: break-word;
  line-height: 1.5;
}

.correct-label {
  flex-shrink: 0;
}

.explanation {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px !important;
}

.question-stats {
  font-size: 0.875rem;
}

.actions-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.not-found {
  text-align: center;
  padding: 80px 20px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .answers-container {
    padding: 20px 16px;
  }
  
  .test-summary-card .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .test-summary-card .text-right {
    text-align: left;
    margin-top: 16px;
    width: 100%;
  }
  
  .stat-item {
    min-width: auto;
    padding: 8px;
  }
  
  .question-header .d-flex {
    flex-direction: column;
  }
  
  .question-number {
    margin-bottom: 12px;
  }
  
  .answer-item .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .answer-indicator,
  .answer-letter,
  .correct-label {
    margin-bottom: 8px;
  }
  
  .actions-card .d-flex {
    flex-direction: column;
    gap: 12px;
  }
  
  .actions-card .v-btn {
    width: 100%;
  }
}
</style>