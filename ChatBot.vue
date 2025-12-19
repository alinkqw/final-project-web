<template>
  <v-btn
    v-if="!isMobile"
    fab
    dark
    color="primary"
    class="chatbot-fab"
    @click="toggleChatBot"
    size="56"
  >
    <v-icon size="24">mdi-robot</v-icon>
    <v-badge
      v-if="unreadMessages > 0"
      color="red"
      :content="unreadMessages"
      inline
      class="chatbot-badge"
    />
  </v-btn>

  <div v-else class="chatbot-mobile-fab">
    <v-btn
      fab
      dark
      color="primary"
      @click="toggleChatBot"
      size="48"
    >
      <v-icon>mdi-robot</v-icon>
    </v-btn>
  </div>

  <!-- Окно чат-бота -->
  <v-dialog
    v-model="chatBotOpen"
    :fullscreen="isMobile"
    :width="isMobile ? '100%' : '450'"
    transition="slide-y-transition"
    class="chatbot-dialog"
  >
    <v-card class="chatbot-card d-flex flex-column">
      <v-card-title class="chatbot-header pa-4">
        <div class="chatbot-title d-flex align-center">
          <v-avatar size="40" class="mr-3" color="primary">
            <v-icon color="white">mdi-robot</v-icon>
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="chatbot-name text-h6">AI Помощник</div>
            <div class="chatbot-status d-flex align-center mt-1">
              <v-chip size="x-small" color="green" class="mr-2">
                Онлайн
              </v-chip>
              <span class="text-caption text-grey-lighten-1">Готов помочь!</span>
            </div>
          </div>
        </div>
        <v-spacer />
        <v-btn icon @click="toggleChatBot" size="small" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="chatbot-messages flex-grow-1 pa-0" ref="messagesContainer">
        <div class="messages-wrapper pa-4">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message-wrapper', message.role]"
          >
            <div class="message-bubble" :class="message.role">
              <div class="message-header d-flex align-center mb-2">
                <v-icon v-if="message.role === 'bot'" size="16" class="mr-2" color="primary">
                  mdi-robot
                </v-icon>
                <v-icon v-else size="16" class="mr-2" color="blue">
                  mdi-account
                </v-icon>
                <span class="message-sender text-body-2 font-weight-medium">
                  {{ message.role === 'bot' ? 'AI Помощник' : userName }}
                </span>
                <span class="message-time text-caption text-medium-emphasis ml-auto">
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
              <div class="message-content text-body-1">
                {{ message.content }}
              </div>
              
              <!-- Кнопка копирования для сообщений бота -->
              <div v-if="message.role === 'bot' && message.id !== 'welcome'" class="d-flex justify-end mt-2">
                <v-btn
                  size="x-small"
                  variant="text"
                  color="info"
                  @click="copyMessage(message.content)"
                  class="copy-btn"
                  prepend-icon="mdi-content-copy"
                >
                  Копировать
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Индикатор печати -->
          <div v-if="isTyping" class="typing-indicator d-flex align-center">
            <div class="typing-dots d-flex mr-2">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text text-caption text-medium-emphasis">
              AI помощник печатает...
            </span>
          </div>
        </div>

        <!-- Быстрые вопросы -->
        <div v-if="showQuickQuestions" class="quick-questions pa-4 pt-0">
          <div class="quick-questions-title text-caption text-medium-emphasis mb-2">
            Частые вопросы:
          </div>
          <div class="quick-questions-grid d-flex flex-wrap gap-2">
            <v-chip
              v-for="question in quickQuestions"
              :key="question.id"
              @click="sendQuickQuestion(question.text)"
              class="quick-question-chip"
              size="small"
              variant="outlined"
            >
              {{ question.text }}
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <!-- Область ввода -->
      <v-card-text class="chatbot-input-area pa-4 pt-0">
        <div class="input-wrapper d-flex align-end gap-2">
          <v-textarea
            v-model="userInput"
            placeholder="Задайте вопрос о тестах..."
            variant="outlined"
            rows="1"
            auto-grow
            hide-details
            class="chatbot-textarea flex-grow-1"
            @keydown.enter.exact.prevent="sendMessage"
            ref="inputField"
            density="compact"
          />
          <v-btn
            color="primary"
            @click="sendMessage"
            :disabled="!userInput.trim() || isTyping"
            class="send-btn ml-auto"
            size="40"
            icon
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
        <div class="input-hints text-center mt-2">
          <span class="text-caption text-disabled">
            Enter для отправки • Shift+Enter для новой строки
          </span>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const userStore = useUserStore()

const chatBotOpen = ref(false)
const userInput = ref('')
const messages = ref([])
const isTyping = ref(false)
const unreadMessages = ref(0)
const messagesContainer = ref(null)
const inputField = ref(null)

const isMobile = computed(() => mobile.value)

const quickQuestions = ref([
  { id: 1, text: 'Как улучшить результаты?' },
  { id: 2, text: 'Какие темы повторить?' },
  { id: 3, text: 'Как работает оценка?' },
  { id: 4, text: 'Сколько времени на тест?' }
])

const showQuickQuestions = computed(() => {
  return messages.value.length <= 2
})

const userName = computed(() => {
  if (userStore.user?.name) return userStore.user.name
  
  try {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      return parsedUser.name || 'Пользователь'
    }
  } catch (e) {
    return 'Пользователь'
  }
  return 'Гость'
})

const testHistory = computed(() => {
  try {
    const results = localStorage.getItem('testResults')
    if (results && results !== '[]' && results !== 'null') {
      return JSON.parse(results)
    }
  } catch (e) {
    console.error('Ошибка загрузки истории тестов:', e)
  }
  return []
})

const testStats = computed(() => {
  const history = testHistory.value
  if (history.length === 0) return null
  
  const stats = {
    totalTests: history.length,
    averageScore: 0,
    bestScore: 0,
    worstScore: 100,
    weakTopics: [],
    recentTests: history.slice(0, 3)
  }
  
  let totalScore = 0
  history.forEach(test => {
    const score = test.percentage || 0
    totalScore += score
    stats.bestScore = Math.max(stats.bestScore, score)
    stats.worstScore = Math.min(stats.worstScore, score)
    
    if (score < 60) {
      stats.weakTopics.push(test.testTitle || `Тест #${test.testId}`)
    }
  })
  
  stats.averageScore = Math.round(totalScore / history.length)
  stats.weakTopics = [...new Set(stats.weakTopics)]
  
  return stats
})

onMounted(() => {
  loadMessages()
  
  if (messages.value.length === 0) {
    addWelcomeMessage()
  }

  checkUnreadMessages()
  
  // Открываем чат при первом посещении
  const firstVisit = !localStorage.getItem('chatbot_first_visit')
  if (firstVisit) {
    localStorage.setItem('chatbot_first_visit', 'true')
    setTimeout(() => {
      chatBotOpen.value = true
    }, 2000)
  }
})

const toggleChatBot = () => {
  chatBotOpen.value = !chatBotOpen.value
  if (chatBotOpen.value) {
    unreadMessages.value = 0
    saveMessages()
    nextTick(() => {
      scrollToBottom()
      inputField.value?.focus()
    })
  }
}

const addWelcomeMessage = () => {
  const welcomeText = testStats.value 
    ? generatePersonalizedWelcome() 
    : `👋 Привет, ${userName.value}! Я AI-помощник по подготовке к тестам. Задавайте вопросы о тестах, программировании или подготовке к экзаменам!`
  
  messages.value.push({
    id: 'welcome',
    role: 'bot',
    content: welcomeText,
    timestamp: Date.now()
  })
  saveMessages()
}

const generatePersonalizedWelcome = () => {
  const stats = testStats.value
  
  if (stats.totalTests === 0) {
    return `👋 Привет, ${userName.value}! Я помогу вам подготовиться к тестам по программированию. Начните с первого теста!`
  }
  
  let welcome = `👋 Привет, ${userName.value}! Рад видеть вас снова! `
  
  if (stats.averageScore >= 80) {
    welcome += `Отличные результаты! Средний балл: ${stats.averageScore}%. `
  } else if (stats.averageScore >= 60) {
    welcome += `Хорошая работа! Средний балл: ${stats.averageScore}%. `
  } else {
    welcome += `Есть куда расти! Средний балл: ${stats.averageScore}%. `
  }
  
  if (stats.weakTopics.length > 0) {
    welcome += `Стоит повторить: ${stats.weakTopics.slice(0, 3).join(', ')}. `
  }
  
  welcome += `Чем могу помочь?`
  
  return welcome
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isTyping.value) return
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: Date.now()
  }
  
  messages.value.push(userMessage)
  userInput.value = ''
  saveMessages()
  scrollToBottom()
  
  isTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const botResponse = await getBotResponse(text)
  
  messages.value.push({
    id: (Date.now() + 1).toString(),
    role: 'bot',
    content: botResponse,
    timestamp: Date.now()
  })
  
  isTyping.value = false
  saveMessages()
  scrollToBottom()
}

const sendQuickQuestion = (text) => {
  userInput.value = text
  sendMessage()
}

const getBotResponse = async (question) => {
  const lowerQuestion = question.toLowerCase()
  
  const hasKeywords = {
    result: ['результат', 'оценка', 'балл', 'счет', 'процент'],
    test: ['тест', 'экзамен', 'проверка', 'опрос'],
    topic: ['тема', 'раздел', 'предмет', 'курс'],
    time: ['время', 'длительность', 'минут', 'час'],
    help: ['помощь', 'помоги', 'подсказка', 'совет'],
    repeat: ['повторить', 'слабый', 'плохой', 'ошибк'],
    good: ['хорош', 'отличн', 'улучши', 'повыси']
  }
  
  let category = 'general'
  
  for (const [cat, keywords] of Object.entries(hasKeywords)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      category = cat
      break
    }
  }
  
  switch (category) {
    case 'result':
      return generateResultResponse()
    case 'test':
      return generateTestResponse()
    case 'topic':
      return generateTopicResponse(lowerQuestion)
    case 'time':
      return generateTimeResponse()
    case 'help':
      return generateHelpResponse()
    case 'repeat':
      return generateRepeatResponse()
    case 'good':
      return generateGoodResponse()
    default:
      return generateGeneralResponse()
  }
}

const generateResultResponse = () => {
  const stats = testStats.value
  
  if (!stats || stats.totalTests === 0) {
    return 'Вы еще не проходили тесты. Начните с первого теста, чтобы увидеть свои результаты!'
  }
  
  return `📊 Ваша статистика:
• Всего тестов: ${stats.totalTests}
• Средний результат: ${stats.averageScore}%
• Лучший результат: ${stats.bestScore}%
• Худший результат: ${stats.worstScore}%

${stats.averageScore >= 80 
  ? '🎉 Отличные результаты!' 
  : stats.averageScore >= 60 
    ? '👍 Хорошие результаты!' 
    : '📚 Нужно больше практики.'}`
}

const generateTestResponse = () => {
  const history = testHistory.value
  
  if (history.length === 0) {
    return 'У вас пока нет истории тестов. Перейдите в раздел "Все тесты" и начните подготовку!'
  }
  
  const recent = history.slice(0, 3)
  let response = '📝 Ваши последние тесты:\n'
  
  recent.forEach((test, index) => {
    const date = new Date(test.date).toLocaleDateString('ru-RU')
    response += `${index + 1}. "${test.testTitle}" - ${test.percentage}% (${date})\n`
  })
  
  response += '\nХотите пройти тест заново?'
  
  return response
}

const generateTopicResponse = (question) => {
  const stats = testStats.value
  
  if (!stats || stats.weakTopics.length === 0) {
    return 'Судя по вашим результатам, все темы усвоены хорошо! Можете переходить к более сложным заданиям.'
  }
  
  if (question.includes('слаб') || question.includes('плох')) {
    return `📚 Требуют внимания: ${stats.weakTopics.join(', ')}`
  }
  
  return 'Для подготовки рекомендую сосредоточиться на практических заданиях и регулярно проходить тесты.'
}

const generateTimeResponse = () => {
  const history = testHistory.value
  
  if (history.length === 0) {
    return '⏱️ Обычно на тест дается 15-30 минут.'
  }
  
  const totalTime = history.reduce((sum, test) => sum + (test.timeSpent || 0), 0)
  const avgTime = Math.round(totalTime / history.length / 60)
  
  return `⏱️ Среднее время: ${avgTime} минут\n\nСоветы:\n1. Читайте вопрос внимательно\n2. Пропускайте сложные вопросы\n3. Оставляйте время на проверку`
}

const generateHelpResponse = () => {
  return `🤖 Я могу помочь вам с:
• Анализом результатов
• Рекомендациями по темам
• Советами по подготовке
• Ответами на вопросы

Задайте конкретный вопрос!`
}

const generateRepeatResponse = () => {
  const stats = testStats.value
  
  if (!stats || stats.weakTopics.length === 0) {
    return 'Все темы усвоены хорошо! Можете переходить к продвинутым заданиям.'
  }
  
  return `📋 План повторения:
1. ${stats.weakTopics[0]} - теория
2. Практические задачи
3. Тест по теме
4. Анализ ошибок

Рекомендую 30 минут в день.`
}

const generateGoodResponse = () => {
  return `🎯 Для улучшения результатов:
1. Регулярная практика
2. Анализ ошибок
3. Фокус на слабых темах
4. Тренировка тайм-менеджмента

Помните: постоянство важнее интенсивности!`
}

const generateGeneralResponse = () => {
  const responses = [
    'Интересный вопрос! Можете уточнить, что именно вас интересует?',
    'Я специализируюсь на подготовке к тестам по программированию.',
    'Попробуйте задать вопрос о конкретном тесте или теме программирования.',
    'Для лучшего ответа, уточните ваш вопрос о тестах или подготовке.'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      const container = messagesContainer.value
      container.scrollTop = container.scrollHeight
    }
  })
}

const copyMessage = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Можно добавить уведомление об успешном копировании
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const checkUnreadMessages = () => {
  const lastVisit = localStorage.getItem('chatbot_last_visit')
  if (!lastVisit) return
  
  const savedMessages = JSON.parse(localStorage.getItem('chatbot_messages') || '[]')
  const unread = savedMessages.filter(msg => 
    msg.role === 'bot' && msg.timestamp > parseInt(lastVisit)
  ).length
  
  unreadMessages.value = unread
}

const saveMessages = () => {
  localStorage.setItem('chatbot_messages', JSON.stringify(messages.value))
  localStorage.setItem('chatbot_last_visit', Date.now().toString())
}

const loadMessages = () => {
  try {
    const saved = localStorage.getItem('chatbot_messages')
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Ошибка загрузки сообщений:', e)
    messages.value = []
  }
}

watch(chatBotOpen, (newVal) => {
  if (newVal) {
    unreadMessages.value = 0
    nextTick(() => {
      scrollToBottom()
    })
  }
})
</script>

<style scoped>
.chatbot-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.chatbot-fab:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.chatbot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.chatbot-mobile-fab {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 999;
}

.chatbot-dialog {
  border-radius: 12px !important;
  overflow: hidden;
}

.chatbot-card {
  height: 600px;
  display: flex;
  flex-direction: column;
  background: #1e293b !important;
}

.chatbot-header {
  background: #0f172a;
  color: white;
  flex-shrink: 0;
  border-bottom: 1px solid #334155;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.message-wrapper {
  display: flex;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper.user {
  margin-left: auto;
}

.message-wrapper.bot {
  margin-right: auto;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
}

.message-bubble.bot {
  background: rgba(30, 136, 229, 0.1);
  border: 1px solid rgba(30, 136, 229, 0.2);
  border-top-left-radius: 4px;
}

.message-bubble.user {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-top-right-radius: 4px;
}

.message-content {
  line-height: 1.5;
  white-space: pre-line;
}

.typing-indicator {
  padding: 12px 16px;
  background: rgba(30, 136, 229, 0.1);
  border-radius: 18px;
  border-top-left-radius: 4px;
  width: fit-content;
  margin-top: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #1e88e5;
  border-radius: 50%;
  display: inline-block;
  margin: 0 1px;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
}

.copy-btn {
  height: 28px !important;
  min-width: auto !important;
  padding: 0 12px !important;
}

.copy-btn :deep(.v-btn__content) {
  font-size: 0.75rem;
}

.quick-questions {
  border-top: 1px solid #334155;
  background: rgba(255, 255, 255, 0.03);
  flex-shrink: 0;
  margin-top: auto;
}

.quick-question-chip {
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05) !important;
}

.quick-question-chip:hover {
  background: rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px);
}

.chatbot-input-area {
  border-top: 1px solid #334155;
  background: #0f172a;
  flex-shrink: 0;
  padding-top: 16px !important;
}

.chatbot-textarea :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-color: #475569;
}

.chatbot-textarea :deep(.v-field__input) {
  color: white !important;
  font-size: 0.9rem;
}

.chatbot-textarea :deep(.v-field__input::placeholder) {
  color: #94a3b8 !important;
}

.send-btn {
  flex-shrink: 0;
}

/* Полноэкранный режим для мобильных */
:deep(.v-dialog--fullscreen) .chatbot-card {
  height: 100vh;
  border-radius: 0 !important;
}

/* Для мобильных */
@media (max-width: 600px) {
  .chatbot-fab {
    bottom: 16px;
    right: 16px;
  }
  
  .message-wrapper {
    max-width: 90%;
  }
  
  .chatbot-textarea :deep(.v-field) {
    font-size: 16px; /* Предотвращает масштабирование на iOS */
  }
}
</style>