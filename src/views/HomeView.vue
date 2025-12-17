<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <p class="hero-kicker">Онлайн‑платформа для студентов</p>
          <h1 class="hero-title">Подготовься к госэкзамену уверенно</h1>
          <p class="hero-description">
            Решай билеты в тренажёре, отслеживай статистику по темам и смотри,
            какие вопросы вызывают больше всего сложностей.
          </p>
          <div class="hero-buttons">
            <v-btn color="primary" class="text-none font-weight-bold rounded-xl" size="large" @click="$router.push('/tests')">
              Начать тест
            </v-btn>
            <v-btn v-if="isLoggedIn" color="primary" class="text-none font-weight-bold rounded-xl" size="large" @click="goToDashboard">
              {{ isAdmin ? ' Админ панель' : 'Личный кабинет' }}
            </v-btn>
            <v-btn v-if="!isLoggedIn" variant="outlined" color="primary" class="text-none font-weight-bold rounded-xl" size="large" @click="$router.push('/login')">
              Войти в аккаунт
            </v-btn>
            <v-btn v-else color="error" class="text-none font-weight-bold rounded-xl" size="large" @click="logout">
              Выйти ({{ user?.name }})
            </v-btn>
          </div>
        </div>
        
        <div class="hero-carousel">
          <v-carousel height="300" cycle interval="4000" show-arrows="hover">
            <v-carousel-item v-for="item in carouselItems" :key="item.id">
              <v-card class="hero-card">
                <v-img :src="item.image || fallbackImage" height="180" cover @error="onImageError" />
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ item.title }}</v-card-title>
                <v-card-subtitle class="text-body-2">{{ item.subtitle }}</v-card-subtitle>
                <v-card-text class="text-caption">
                  Вопросов: {{ item.questions }} • Уровень: {{ item.level }}
                </v-card-text>
              </v-card>
            </v-carousel-item>
          </v-carousel>
        </div>
      </div>
    </div>

    <div class="nav-section">
      <h2 class="section-title">Выберите раздел</h2>
      <div class="nav-cards">
        <v-card class="nav-card" @click="$router.push('/state-exams')">
          <div class="nav-icon"></div>
          <h3 class="nav-title">Госэкзамены</h3>
          <p class="nav-description">Официальные билеты и тренажеры</p>
        </v-card>
        
        <v-card v-if="isAdmin" class="nav-card" @click="$router.push('/admin')">
          <div class="nav-icon"></div>
          <h3 class="nav-title">Админ панель</h3>
          <p class="nav-description">Управление контентом и пользователями</p>
        </v-card>
        
        <v-card class="nav-card" @click="$router.push('/tests')">
          <div class="nav-icon"></div>
          <h3 class="nav-title">Все тесты</h3>
          <p class="nav-description">{{ allTests.length }} тестов всех уровней</p>
        </v-card>
        
        <v-card class="nav-card" @click="goToDashboard">
          <div class="nav-icon"></div>
          <h3 class="nav-title">Личный кабинет</h3>
          <p class="nav-description">{{ isLoggedIn ? `Статистика, ${user?.name}` : 'Войдите для доступа' }}</p>
        </v-card>
      </div>
    </div>

    <div class="benefits-section">
      <h2 class="section-title">Что даёт платформа «ГосЭкзамен»</h2>
      <p class="section-subtitle">Всё, что нужно для системной подготовки: от тренажёров до аналитики.</p>
      <div class="benefits-grid">
        <v-card v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
          <div class="benefit-number">{{ benefit.number }}</div>
          <div class="benefit-title">{{ benefit.title }}</div>
          <div class="benefit-text">{{ benefit.text }}</div>
        </v-card>
      </div>
    </div>

    <div class="search-section">
      <v-card class="search-card">
        <div class="search-filters">
          <v-text-field
            v-model="searchQuery"
            label="🔍 Поиск по названию или описанию"
            variant="solo"
            density="compact"
            hide-details
            class="search-input"
            clearable
            bg-color="white"
            color="grey-darken-4"
          />
          <v-select
            v-model="selectedLevel"
            :items="levelOptions"
            label="Все уровни"
            variant="solo"
            density="compact"
            hide-details
            clearable
            class="level-select"
            bg-color="white"
            color="grey-darken-4"
          />
        </div>
      </v-card>
    </div>

    <div class="tests-section">
      <h2 class="section-title">Популярные тесты</h2>
      <p class="section-subtitle">
        Начни с этих или
        <v-btn variant="text" color="primary" to="/tests" class="inline-btn">посмотри все ({{ allTests.length }})</v-btn>
      </p>
      <div class="tests-grid">
        <div
          v-for="test in filteredTests.slice(0, 8)"
          :key="test.id"
          class="test-card-wrapper"
        >
          <v-card
            class="test-card-dark gradient-border"
            @click="openTestModal(test)"
          >
            <div class="card-image-container">
              <v-img
                :src="test.image || fallbackImage"
                height="140"
                cover
                class="card-image"
                @error="onImageError"
              />
              <v-chip
                size="small"
                :color="getLevelColor(test.level)"
                class="level-badge white--text font-weight-bold"
              >
                {{ capitalize(test.level) }}
              </v-chip>
              <v-chip
                v-if="test.isExternal"
                size="x-small"
                color="info"
                class="external-badge white--text font-weight-bold"
              >
                Внешний
              </v-chip>
            </div>

            <div class="card-content">
              <h3 class="card-title">
                {{ test.title }}
              </h3>
              <p class="card-subtitle">
                {{ test.subtitle }}
              </p>

              <div class="card-info">
                <v-chip
                  size="x-small"
                  color="primary"
                  class="font-weight-medium white--text"
                >
                  {{ test.questions }} q
                </v-chip>
                <span class="card-time">
                  {{ test.timeLimit }} мин
                </span>
              </div>

              <v-btn
                block
                color="primary"
                class="card-btn font-weight-bold white--text"
                size="small"
                @click.stop="openTestModal(test)"
              >
                Пройти тест
              </v-btn>
            </div>
          </v-card>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <v-card class="stats-card">
        <div class="stats-title">{{ isLoggedIn ? `Привет, ${user?.name}!` : 'Твой прогресс' }}</div>
        <div v-if="isLoggedIn" class="stats-subtitle">
          Группа: {{ user?.group || 'Не указана' }} • 
          <v-chip :color="isAdmin ? 'error' : 'primary'" size="x-small">{{ isAdmin ? 'АДМИН' : 'СТУДЕНТ' }}</v-chip>
        </div>
        <div v-else class="stats-subtitle">После входа ты увидишь здесь количество попыток и слабые темы.</div>
        <v-progress-linear :model-value="isLoggedIn ? 65 : 45" height="8" color="primary" rounded />
        <div class="stats-progress">Пройдено: {{ isLoggedIn ? '65%' : '45%' }} учебного плана</div>
      </v-card>
      
      <v-card class="stats-card">
        <div class="stats-title">Как работает тренажёр</div>
        <ul class="stats-list">
          <li>Выбираешь тест и запускаешь.</li>
          <li>Переходишь на внешний сайт для прохождения.</li>
          <li>Результаты сохраняются в твоём профиле.</li>
          <li>Отслеживаешь прогресс по всем тестам.</li>
        </ul>
      </v-card>
    </div>

    <v-dialog
      v-model="testModal"
      max-width="580"
      max-height="85vh"
      persistent
    >
      <v-card class="test-modal-dark" elevation="24">
        <v-card-title class="modal-title">
          <div class="modal-header">
            <h2 class="modal-title-text">
              {{ selectedTest.title }}
            </h2>
            <v-btn
              icon
              color="grey-darken-3"
              size="small"
              density="comfortable"
              @click="closeTestModal"
              class="modal-close-btn"
            >
              ✕
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="modal-content">
          <!-- ВЕРХНИЙ БЛОК: АВАТАРКА + ТЕКСТ -->
          <div class="modal-top">
            <v-avatar size="72" class="modal-avatar">
              <v-img
                :src="selectedTest.image || fallbackImage"
                cover
                @error="onImageError"
              />
            </v-avatar>
            <div class="modal-top-text">
              <div class="modal-subtitle">
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
              </div>
            </div>
          </div>

          <div class="modal-description-title">
            Описание теста
          </div>
          <p class="modal-description-text">
            {{ selectedTest.description || 'Подготовьтесь к госэкзамену с этим тестом. Вопросы подобраны по программе и соответствуют формату реального экзамена.' }}
          </p>

          <div class="modal-buttons">
            <v-btn
              v-if="selectedTest.externalUrl"
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="small"
              height="40"
              :href="selectedTest.externalUrl"
              target="_blank"
              @click="closeTestModal"
            >
              Пройти тест онлайн
            </v-btn>
            <v-btn
              v-else
              color="primary"
              class="modal-btn-start font-weight-bold white--text"
              size="small"
              height="40"
              @click="startRealTest"
            >
              Начать тест сейчас
            </v-btn>
            <v-btn
              variant="tonal"
              color="grey-darken-2"
              class="modal-btn-later font-weight-bold"
              size="small"
              height="40"
              min-width="90"
              @click="closeTestModal"
            >
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
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated())
const isAdmin = computed(() => {
  return userStore.isAdmin && userStore.isAdmin()
})

const allTests = ref([]) // Все тесты
const searchQuery = ref('')
const selectedLevel = ref(null)
const testModal = ref(false)
const selectedTest = ref({})

const levelOptions = [
  { title: 'Все уровни', value: null },
  { title: 'Легкие', value: 'easy' },
  { title: 'Средние', value: 'medium' },
  { title: 'Сложные', value: 'hard' }
]

const fallbackImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'

const filteredTests = computed(() => {
  return allTests.value.filter(test => {
    const q = searchQuery.value?.toLowerCase() || ''
    const matchesSearch = !q || test.title?.toLowerCase().includes(q) || test.subtitle?.toLowerCase().includes(q)
    const matchesLevel = !selectedLevel.value || test.level === selectedLevel.value
    return matchesSearch && matchesLevel
  })
})

const goToDashboard = () => {
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/dashboard')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

onMounted(async () => {
  userStore.loadUser()
  
  try {
    const res = await axios.get('https://6937d58d4618a71d77cdc83e.mockapi.io/users')
    allTests.value = res.data.map((test, index) => {
      // Создаем реальные ссылки на тесты (как в AllTests.vue)
      const externalUrls = [
        'https://learn.javascript.ru/quiz',
        'https://spacelab-academy.com/ru/tests/test-javascript/',
        'https://spacelab-academy.com/ru/tests/test-react-js/',
        'https://onlinetestpad.com/ru/tests/python',
        'https://use-web.ru/tests.php',
        'https://math100.ru/oge-2025/',
        'https://silvertests.ru/',
        'https://stepik.org/course/219443/promo',
        'https://gordeevaln.ru/ege_test',
        'https://proforientator.ru/tests/',
        'https://www.123test.com/iq-test/',
        'https://www.cambridgeenglish.org/test-your-english/'
      ]
      
      const levelDescriptions = {
        easy: 'Базовый тест для начинающих. Поможет проверить фундаментальные знания.',
        medium: 'Тест средней сложности. Подходит для подготовки к экзаменам.',
        hard: 'Сложный тест для продвинутых пользователей. Проверяет глубокие знания.'
      }
      
      return {
        id: test.id,
        title: test.title,
        subtitle: test.subtitle,
        questions: parseInt(test.questionCount) || 10,
        timeLimit: parseInt(test.timeLimit) || 30,
        level: test.level || 'medium',
        image: getTestImage(index),
        description: levelDescriptions[test.level] || 'Подготовьтесь к госэкзамену с этим тестом.',
        externalUrl: externalUrls[index % externalUrls.length],
        isExternal: true
      }
    })
  } catch (e) {
    console.error('Ошибка загрузки тестов:', e)
    // Если API не работает, создаем демо тесты
    createDemoTests()
  }
})

const createDemoTests = () => {
  const externalUrls = [
    'https://learn.javascript.ru/quiz',
    'https://spacelab-academy.com/ru/tests/test-javascript/',
    'https://spacelab-academy.com/ru/tests/test-react-js/',
    'https://onlinetestpad.com/ru/tests/python',
    'https://use-web.ru/tests.php',
    'https://math100.ru/oge-2025/',
    'https://stepik.org/course/219443/promo',
    'https://gordeevaln.ru/ege_test',
    'https://proforientator.ru/tests/',
    'https://www.123test.com/iq-test/',
    'https://www.cambridgeenglish.org/test-your-english/',
    'https://silvertests.ru/'
  ]

  for (let i = 1; i <= 46; i++) {
    const levelIndex = i % 3
    const level = ['easy', 'medium', 'hard'][levelIndex]
    
    const levelDescriptions = {
      easy: 'Базовый тест для начинающих. Поможет проверить фундаментальные знания.',
      medium: 'Тест средней сложности. Подходит для подготовки к экзаменам.',
      hard: 'Сложный тест для продвинутых пользователей. Проверяет глубокие знания.'
    }
    
    allTests.value.push({
      id: i,
      title: `Тест по программированию ${i}`,
      subtitle: `Подготовка к экзамену по информатике ${i}`,
      questions: 10 + (i % 20),
      timeLimit: 30 + (i % 30),
      level: level,
      image: getTestImage(i),
      description: levelDescriptions[level] || 'Подготовьтесь к госэкзамену с этим тестом.',
      externalUrl: externalUrls[i % externalUrls.length],
      isExternal: true
    })
  }
}

const openTestModal = test => {
  selectedTest.value = test
  testModal.value = true
}

const closeTestModal = () => {
  testModal.value = false
}

const startRealTest = () => {
  closeTestModal()
  router.push(`/tests/${selectedTest.value.id}`)
}

const getTestImage = index => {
  const images = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80'
  ]
  const url = images[index % images.length]
  return url || fallbackImage
}

const onImageError = event => {
  const img = event?.target
  if (!img) return
  if (img.dataset.fallbackApplied === 'true') return
  img.src = fallbackImage
  img.dataset.fallbackApplied = 'true'
}

const getLevelColor = level => {
  const colors = { easy: 'success', medium: 'warning', hard: 'error' }
  return colors[level] || 'grey'
}

const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const carouselItems = [
  {
    id: 1,
    title: 'Основы программирования',
    subtitle: 'Переменные, типы данных, циклы и функции.',
    questions: 20,
    level: 'easy',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Базы данных SQL',
    subtitle: 'Запросы SELECT, JOIN, нормализация таблиц.',
    questions: 18,
    level: 'medium',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Алгоритмы и структуры',
    subtitle: 'Сортировки, поиск, графы и деревья.',
    questions: 22,
    level: 'hard',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  }
]

const benefits = [
  { id: 1, number: '01', title: 'Экзаменационные форматы', text: 'Вопросы максимально близки к реальному госэкзамену.' },
  { id: 2, number: '02', title: 'Умная аналитика', text: 'Система подсвечивает темы для повторения.' },
  { id: 3, number: '03', title: 'Гибкий режим', text: 'Короткие тренировки или полный экзамен.' },
  { id: 4, number: '04', title: 'История попыток', text: 'Все результаты сохраняются автоматически.' },
  { id: 5, number: '05', title: 'Мобильная версия', text: 'Работает на всех устройствах.' },
  { id: 6, number: '06', title: 'Пояснения к ответам', text: 'Подробно разбираем каждую ошибку.' }
]
</script>

<style scoped>

.home-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}


.hero-section,
.nav-section,
.benefits-section,
.search-section,
.tests-section,
.stats-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-kicker {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #93c5fd;
  margin-bottom: 8px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.125rem;
  color: #cbd5f5;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-card {
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(30, 64, 175, 0.9), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.7);
  backdrop-filter: blur(18px);
  height: 100%;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f9fafb;
  text-align: center;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1rem;
  color: #cbd5f5;
  text-align: center;
  margin-bottom: 40px;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.nav-card {
  background: linear-gradient(145deg, rgba(30, 64, 175, 0.25), rgba(15, 23, 42, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.7);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
  border-color: rgba(96, 165, 250, 0.95);
}

.nav-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #60a5fa, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 8px;
}

.nav-description {
  font-size: 0.875rem;
  color: #cbd5f5;
  opacity: 0.8;
}

/* ПРЕИМУЩЕСТВА */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.benefit-card {
  background: linear-gradient(145deg, rgba(30, 64, 175, 0.25), rgba(15, 23, 42, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.7);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
  border-color: rgba(96, 165, 250, 0.95);
}

.benefit-number {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.benefit-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 8px;
}

.benefit-text {
  font-size: 0.875rem;
  color: #cbd5f5;
  line-height: 1.5;
}

.search-card {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.search-filters {
  display: flex;
  gap: 20px;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.search-input :deep(.v-field) {
  background-color: white !important;
  color: #1f2937 !important;
}

.search-input :deep(.v-field__input) {
  color: #1f2937 !important;
}

.search-input :deep(.v-label) {
  color: #6b7280 !important;
}

.search-input :deep(.v-field__outline) {
  border-color: #d1d5db !important;
}

.search-input :deep(.v-field:hover .v-field__outline) {
  border-color: #3b82f6 !important;
}

.level-select {
  min-width: 180px;
}

.level-select :deep(.v-field) {
  background-color: white !important;
  color: #1f2937 !important;
}

.level-select :deep(.v-field__input) {
  color: #1f2937 !important;
}

.level-select :deep(.v-label) {
  color: #6b7280 !important;
}

.level-select :deep(.v-field__outline) {
  border-color: #d1d5db !important;
}

.level-select :deep(.v-field:hover .v-field__outline) {
  border-color: #3b82f6 !important;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 40px;
  padding-bottom: 40px;
}

.test-card-wrapper {
  height: 100%;
}

.test-card-dark {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border: 1px solid transparent;
  border-radius: 24px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.gradient-border {
  background:
    linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.1))
      padding-box,
    linear-gradient(135deg, #3b82f6, #06b6d4) border-box;
  border: 1px solid transparent;
}

.test-card-dark:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.card-image-container {
  position: relative;
  height: 140px;
}

.card-image {
  border-radius: 20px 20px 0 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.level-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.external-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(37, 99, 235, 0.9);
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.card-subtitle {
  font-size: 0.75rem;
  color: #cbd5f5;
  margin-bottom: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 34px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-time {
  font-size: 0.75rem;
  font-weight: 500;
  color: #cbd5f5;
}

.card-btn {
  border-radius: 16px;
  font-weight: 700;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.stats-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.97), rgba(17, 24, 39, 0.99));
  border: 1px solid rgba(148, 163, 184, 0.7);
  backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 24px;
}

.stats-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 8px;
}

.stats-subtitle {
  font-size: 0.875rem;
  color: #cbd5f5;
  margin-bottom: 16px;
}

.stats-progress {
  font-size: 0.75rem;
  color: #cbd5f5;
  margin-top: 8px;
}

.stats-list {
  padding-left: 20px;
  color: #cbd5f5;
  font-size: 0.875rem;
  line-height: 1.6;
}

.stats-list li {
  margin-bottom: 8px;
}

/* МОДАЛКА ТЕСТА */
.test-modal-dark {
  background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin: 24px auto;
  color: #e5e7eb;
}

.modal-title {
  padding: 20px 24px 12px !important;
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
  color: #f9fafb;
  margin: 0;
  flex: 1;
}

.modal-close-btn {
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
  transition: transform 0.15s ease, background 0.15s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: rgba(15, 23, 42, 1);
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
}

.modal-avatar {
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.modal-top-text {
  flex: 1;
  min-width: 0;
}

.modal-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f9fafb;
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
  color: #f9fafb;
  margin-bottom: 12px;
}

.modal-description-text {
  font-size: 0.875rem;
  color: #cbd5f5;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 32px;
}

.modal-buttons {
  display: flex;
  gap: 16px;
}

.modal-btn-start {
  flex: 1;
  border-radius: 20px;
}

.modal-btn-later {
  border-radius: 20px;
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .nav-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section,
  .nav-section,
  .benefits-section,
  .search-section,
  .tests-section,
  .stats-section {
    padding: 32px 16px;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .nav-cards,
  .benefits-grid,
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-input,
  .level-select {
    width: 100%;
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
  .hero-section,
  .nav-section,
  .benefits-section,
  .search-section,
  .tests-section,
  .stats-section {
    padding: 24px 12px;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-buttons .v-btn {
    width: 100%;
  }
}
</style>