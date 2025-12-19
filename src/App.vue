<template>
  <v-app>
    <!-- Верхняя панель -->
    <v-app-bar 
      color="grey-darken-4" 
      elevation="0"
      class="app-bar"
      height="64"
    >
      <!-- Мобильное меню -->
      <v-app-bar-nav-icon 
        @click="drawer = true" 
        class="d-md-none"
      />

      <!-- Десктопная навигация - по центру -->
      <v-container class="nav-container d-none d-md-flex">
        <div class="desktop-nav">
          <div class="logo" @click="$router.push('/')">
            <v-icon color="blue-lighten-2" size="28" class="mr-2">mdi-certificate</v-icon>
            <span class="app-name">ГосЭкзамен</span>
          </div>

          <div class="nav-links">
            <v-btn
              to="/"
              variant="text"
              class="nav-link"
              :class="{ 'active': $route.path === '/' }"
            >
             
            Главная
            </v-btn>
            
            <v-btn
              to="/dashboard"
              variant="text"
              class="nav-link"
              :class="{ 'active': $route.path === '/dashboard' }"
            >
              Личный кабинет
            </v-btn>
            
            <v-btn
              to="/tests"
              variant="text"
              class="nav-link"
              :class="{ 'active': $route.path === '/tests' }"
            >
              Все тесты
            </v-btn>

            <v-btn
              to="/test-history"
              variant="text"
              class="nav-link"
              :class="{ 'active': $route.path === '/test-history' }"
            >
              История тестов
              <v-chip 
                v-if="hasTestResults && recentResultsCount > 0" 
                size="x-small" 
                color="info" 
                class="ml-2 chip-counter"
              >
                {{ recentResultsCount }}
              </v-chip>
            </v-btn>

            <v-menu
              v-if="isAdmin"
              :close-on-content-click="true"
              offset="8"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  class="nav-link admin-btn"
                  :class="{ 'active': $route.path.startsWith('/admin') }"
                >
                  Админ
                  <v-chip 
                    v-if="pendingTestsCount > 0" 
                    size="x-small" 
                    color="orange" 
                    class="ml-2 chip-counter"
                  >
                    {{ pendingTestsCount }}
                  </v-chip>
                </v-btn>
              </template>

              <v-card class="admin-menu">
                <v-list density="compact">
                  <v-list-subheader class="admin-header">

                    Администрирование
                  </v-list-subheader>
                  
                  <v-list-item
                    to="/admin"
                    @click="drawer = false"
                  >
                    <v-list-item-title>
                      <v-icon left size="18" color="blue">mdi-view-dashboard</v-icon>
                      Панель управления
                    </v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item
                    to="/admin/tests"
                    @click="drawer = false"
                  >
                    <v-list-item-title>
                      <v-icon left size="18" color="green">mdi-pencil-box-multiple</v-icon>
                      Управление тестами
                      <v-chip 
                        v-if="pendingTestsCount > 0" 
                        size="x-small" 
                        color="orange" 
                        class="ml-2 chip-counter"
                      >
                        {{ pendingTestsCount }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item
                    to="/admin/users"
                    @click="drawer = false"
                  >
                    <v-list-item-title>
                      <v-icon left size="18" color="purple">mdi-account-group</v-icon>
                      Пользователи
                    </v-list-item-title>
                  </v-list-item>

                  <v-divider class="my-1" />

                  <v-list-item
                    to="/admin/profile"
                    @click="drawer = false"
                  >
                    <v-list-item-title>
                      <v-icon left size="18" color="grey">mdi-account-key</v-icon>
                      Админ-профиль
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </div>

          <!-- Пользовательская часть справа -->
          <div class="user-nav">
            <template v-if="isLoggedIn">
              <v-menu location="bottom end" offset="8">
                <template #activator="{ props }">
                  <div class="user-btn" v-bind="props">
                    <v-avatar size="36" class="mr-2 user-avatar">
                      <v-icon color="white">mdi-account-circle</v-icon>
                    </v-avatar>
                    <span class="user-name">{{ shortName }}</span>
                    <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
                  </div>
                </template>

                <v-card class="user-menu">
                  <v-list density="compact">
                    <v-list-item
                      :to="profileLink"
                      @click="drawer = false"
                      class="user-menu-item"
                    >
                      <v-list-item-title>
                        <v-icon left size="18">mdi-account</v-icon>
                        Мой профиль
                      </v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item
                      to="/dashboard"
                      @click="drawer = false"
                      class="user-menu-item"
                    >
                      <v-list-item-title>
                        <v-icon left size="18">mdi-chart-box</v-icon>
                        Личный кабинет
                      </v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      to="/test-history"
                      @click="drawer = false"
                      class="user-menu-item"
                    >
                      <v-list-item-title>
                        <v-icon left size="18" color="info">mdi-history</v-icon>
                        История тестов
                        <v-chip v-if="recentResultsCount > 0" size="x-small" color="info" class="ml-2 chip-counter">
                          {{ recentResultsCount }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>

                    <v-divider v-if="isAdmin" class="my-1" />
                    
                    <template v-if="isAdmin">
                      <v-list-item
                        to="/admin/tests"
                        @click="drawer = false"
                        class="user-menu-item"
                      >
                        <v-list-item-title>
                          <v-icon left size="18" color="green">mdi-pencil-box-multiple</v-icon>
                          Управление тестами
                        </v-list-item-title>
                      </v-list-item>
                    </template>

                    <v-divider class="my-1" />

                    <v-list-item 
                      @click="logout" 
                      class="user-menu-item logout-item"
                    >
                      <v-list-item-title>
                        <v-icon left size="18" color="red-lighten-2">mdi-logout</v-icon>
                        Выйти
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>

            <template v-else>
              <v-btn
                to="/login"
                variant="text"
                class="auth-btn"
              >
                <v-icon left size="18">mdi-login</v-icon>
                Войти
              </v-btn>
            </template>
          </div>
        </div>
      </v-container>

      <!-- Мобильный заголовок -->
      <div class="d-md-none mobile-title">
        <span class="mobile-app-name">ГосЭкзамен</span>
      </div>
    </v-app-bar>

    <!-- Мобильное меню -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      width="280"
      class="mobile-menu"
    >
      <!-- Заголовок меню -->
      <div class="mobile-header">
        <div class="mobile-logo">
          <v-icon color="blue-lighten-2" size="32">mdi-certificate</v-icon>
          <div class="mobile-logo-text">
            <h3>ГосЭкзамен</h3>
            <span class="text-grey">платформа подготовки</span>
          </div>
        </div>
      </div>

      <!-- Профиль -->
      <div v-if="isLoggedIn" class="mobile-profile">
        <div class="profile-header">
          <v-avatar size="48" class="profile-avatar">
            <v-icon size="24" color="grey">mdi-account-circle</v-icon>
          </v-avatar>
          <div class="profile-info">
            <h4 class="profile-name">{{ userName }}</h4>
            <div class="profile-role">
              <span class="text-caption text-grey">
                {{ isAdmin ? 'Администратор' : 'Студент' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <v-divider class="my-3" />

      <!-- Навигация -->
      <v-list class="mobile-list">
        <v-list-item
          to="/"
          @click="drawer = false"
          class="mobile-nav-item"
          :class="{ 'active': $route.path === '/' }"
        >
          <template #prepend>
            <v-icon color="blue-lighten-2">mdi-home</v-icon>
          </template>
          <v-list-item-title>Главная</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/dashboard"
          @click="drawer = false"
          class="mobile-nav-item"
          :class="{ 'active': $route.path === '/dashboard' }"
        >
          <template #prepend>
            <v-icon color="orange-lighten-2">mdi-chart-box</v-icon>
          </template>
          <v-list-item-title>Личный кабинет</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/tests"
          @click="drawer = false"
          class="mobile-nav-item"
          :class="{ 'active': $route.path === '/tests' }"
        >
          <template #prepend>
            <v-icon color="green-lighten-2">mdi-book-open-page-variant</v-icon>
          </template>
          <v-list-item-title>Все тесты</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/test-history"
          @click="drawer = false"
          class="mobile-nav-item"
          :class="{ 'active': $route.path === '/test-history' }"
        >
          <template #prepend>
            <v-icon color="info">mdi-history</v-icon>
          </template>
          <v-list-item-title>
            История тестов
            <v-chip 
              v-if="hasTestResults && recentResultsCount > 0" 
              size="x-small" 
              color="info" 
              class="ml-2 chip-counter"
            >
              {{ recentResultsCount }}
            </v-chip>
          </v-list-item-title>
        </v-list-item>

        <template v-if="isAdmin">
          <v-divider class="my-2" />
          
          <v-list-subheader class="mobile-admin-header">
            <v-icon left color="cyan">mdi-shield-account</v-icon>
            Администрирование
          </v-list-subheader>
          
          <v-list-item
            to="/admin"
            @click="drawer = false"
            class="mobile-nav-item"
          >
            <template #prepend>
              <v-icon color="blue">mdi-view-dashboard</v-icon>
            </template>
            <v-list-item-title>Панель управления</v-list-item-title>
          </v-list-item>
          
          <v-list-item
            to="/admin/tests"
            @click="drawer = false"
            class="mobile-nav-item"
          >
            <template #prepend>
              <v-icon color="green">mdi-pencil-box-multiple</v-icon>
            </template>
            <v-list-item-title>Управление тестами</v-list-item-title>
          </v-list-item>

          <v-list-item
            to="/admin/users"
            @click="drawer = false"
            class="mobile-nav-item"
          >
            <template #prepend>
              <v-icon color="purple">mdi-account-group</v-icon>
            </template>
            <v-list-item-title>Пользователи</v-list-item-title>
          </v-list-item>
          
          <v-list-item
            to="/admin/profile"
            @click="drawer = false"
            class="mobile-nav-item"
          >
            <template #prepend>
              <v-icon color="grey">mdi-account-key</v-icon>
            </template>
            <v-list-item-title>Админ-профиль</v-list-item-title>
          </v-list-item>
        </template>

        <template v-if="isLoggedIn">
          <v-divider class="my-2" />
          
          <v-list-item
            :to="profileLink"
            @click="drawer = false"
            class="mobile-nav-item"
          >
            <template #prepend>
              <v-icon color="purple-lighten-2">mdi-account-cog</v-icon>
            </template>
            <v-list-item-title>Настройки профиля</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <template #append>
        <div class="mobile-footer">
          <v-divider />
          <div class="auth-buttons-mobile">
            <template v-if="isLoggedIn">
              <v-btn
                block
                variant="text"
                class="mobile-logout-btn mt-3"
                @click="logout"
              >
                <v-icon left color="red-lighten-2">mdi-logout</v-icon>
                Выйти
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                to="/login"
                block
                variant="outlined"
                class="mobile-login-btn mt-3"
                @click="drawer = false"
              >
                <v-icon left>mdi-login</v-icon>
                Войти
              </v-btn>
            </template>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Основное содержимое -->
    <v-main class="app-main">
      <router-view />
      
      <!-- AI Помощник - ПЛАВАЮЩАЯ ПАНЕЛЬ -->
      <div 
        v-if="showChatPanel && !isChatFullscreen"
        class="ai-chat-panel"
        :class="{ minimized: isChatMinimized }"
      >
        <!-- Заголовок панели -->
        <div class="chat-panel-header" @click="toggleChatMinimize">
          <div class="panel-header-title">
            <v-icon size="20" class="mr-2">mdi-robot</v-icon>
            <span>AI Помощник</span>
            <v-chip 
              v-if="unreadMessages > 0" 
              size="x-small" 
              color="green" 
              class="ml-2 chip-counter"
            >
              {{ unreadMessages }}
            </v-chip>
          </div>
          <div class="panel-header-actions">
            <v-btn 
              icon 
              size="x-small" 
              @click.stop="toggleChatMinimize"
              class="mr-1"
            >
              <v-icon v-if="isChatMinimized">mdi-chevron-up</v-icon>
              <v-icon v-else>mdi-chevron-down</v-icon>
            </v-btn>
            
            <v-btn 
              icon 
              size="x-small" 
              @click.stop="openChatFullscreen"
              class="mr-1"
            >
              <v-icon>mdi-fullscreen</v-icon>
            </v-btn>
            
            <v-btn 
              icon 
              size="x-small" 
              @click.stop="hideChatPanel"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Содержимое панели -->
        <div v-if="!isChatMinimized" class="chat-panel-content">
          <div class="quick-questions-panel">
            <div class="quick-questions-title">
              <v-icon size="16" class="mr-1">mdi-lightbulb-on</v-icon>
              Быстрые вопросы:
            </div>
            <div class="quick-questions-grid">
              <v-chip
                v-for="question in quickQuestions"
                :key="question.id"
                @click="sendQuickQuestion(question.text)"
                class="quick-question-chip"
                size="small"
                variant="outlined"
                :prepend-icon="question.icon"
              >
                {{ question.text }}
              </v-chip>
            </div>
          </div>

          <div v-if="recentMessages.length > 0" class="mini-chat">
            <div class="mini-chat-title">
              <v-icon size="14" class="mr-1">mdi-message-text</v-icon>
              Недавние сообщения:
            </div>
            <div class="mini-chat-messages">
              <div 
                v-for="message in recentMessages" 
                :key="message.id"
                class="mini-message"
                :class="message.role"
              >
                <v-icon 
                  size="14" 
                  class="mini-message-icon"
                  :color="message.role === 'bot' ? 'green' : 'blue'"
                >
                  {{ message.role === 'bot' ? 'mdi-robot' : 'mdi-account' }}
                </v-icon>
                <span class="mini-message-text">{{ getMessagePreview(message.content) }}</span>
              </div>
            </div>
          </div>

          <div class="open-full-chat">
            <v-btn
              block
              color="primary"
              @click="openChatDialog"
              prepend-icon="mdi-forum"
              size="small"
              class="open-full-btn"
            >
              Открыть полный чат
            </v-btn>
          </div>
        </div>
      </div>
    </v-main>

    <!-- AI Чат бот - ПОЛНЫЙ ДИАЛОГ -->
    <v-dialog
      v-model="chatDialogOpen"
      :fullscreen="isMobile || isChatFullscreen"
      :width="chatDialogWidth"
      :height="chatDialogHeight"
      transition="slide-y-transition"
      class="chatbot-dialog-full"
      @click:outside="closeChatDialog"
    >
      <v-card class="chatbot-card-full">
        <v-card-title class="chatbot-header-full">
          <div class="chatbot-title-full">
            <v-avatar size="44" class="mr-3 chatbot-avatar-full">
              <v-icon color="white">mdi-robot</v-icon>
            </v-avatar>
            <div>
              <div class="chatbot-name-full">AI Помощник по тестам</div>
              <div class="chatbot-status-full">
                <v-chip size="x-small" color="green" class="mr-2">
                  Онлайн
                </v-chip>
                <span class="text-caption text-grey">Готов помочь с тестами</span>
              </div>
            </div>
          </div>
          <v-spacer />
          <div class="chatbot-actions">
            <v-btn 
              icon 
              @click="showHelp" 
              size="small"
              class="mr-1"
            >
              <v-icon>mdi-help-circle</v-icon>
            </v-btn>
            
            <v-btn 
              icon 
              @click="clearChat" 
              size="small"
              class="mr-1"
            >
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
            
            <v-btn 
              icon 
              @click="toggleFullscreen" 
              size="small"
              class="mr-1"
            >
              <v-icon>
                {{ isChatFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
              </v-icon>
            </v-btn>
            
            <v-btn 
              icon 
              @click="closeChatDialog" 
              size="small"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <div class="chatbot-main-content">
          <div class="chatbot-sidebar" v-if="!isMobile">
            <div class="sidebar-section">
              <div class="sidebar-section-title">
                <v-icon size="18" class="mr-2">mdi-lightning-bolt</v-icon>
                Популярные вопросы
              </div>
              <div class="sidebar-questions">
                <div 
                  v-for="question in extendedQuickQuestions"
                  :key="question.id"
                  class="sidebar-question-item"
                  @click="sendQuickQuestion(question.text)"
                >
                  <v-icon size="16" class="mr-2" :color="question.color || 'primary'">
                    {{ question.icon }}
                  </v-icon>
                  <span>{{ question.text }}</span>
                </div>
              </div>
            </div>

            <div class="sidebar-section" v-if="testStats">
              <div class="sidebar-section-title">
                <v-icon size="18" class="mr-2">mdi-chart-bar</v-icon>
                Ваша статистика
              </div>
              <div class="sidebar-stats">
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="16" color="blue">mdi-test-tube</v-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Пройдено тестов:</span>
                    <span class="stat-value">{{ testStats.totalTests }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="16" color="green">mdi-trophy</v-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Успешность:</span>
                    <span class="stat-value">{{ testStats.averageScore }}%</span>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <v-icon size="16" color="amber">mdi-clock</v-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Время обучения:</span>
                    <span class="stat-value">{{ testStats.totalTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chatbot-messages-full" ref="messagesContainer">
            <div class="welcome-message" v-if="chatMessages.length === 0">
              <div class="welcome-avatar">
                <v-icon size="48" color="green">mdi-robot-happy</v-icon>
              </div>
              <div class="welcome-content">
                <h3>Привет, {{ userName }}! 👋</h3>
                <p>Я ваш AI-помощник по подготовке к тестам. Могу помочь с:</p>
                <ul class="welcome-features">
                  <li>📊 Анализом результатов тестов</li>
                  <li>📚 Рекомендациями по темам</li>
                  <li>⏱️ Советами по тайм-менеджменту</li>
                  <li>❓ Ответами на вопросы по программированию</li>
                </ul>
                <p class="welcome-hint">Выберите вопрос из списка или задайте свой!</p>
              </div>
            </div>

            <div 
              v-for="message in chatMessages" 
              :key="message.id"
              :class="['message-wrapper-full', message.role]"
            >
              <div class="message-avatar">
                <v-avatar size="36" :color="message.role === 'bot' ? 'green' : 'blue'">
                  <v-icon color="white">
                    {{ message.role === 'bot' ? 'mdi-robot' : 'mdi-account' }}
                  </v-icon>
                </v-avatar>
              </div>
              <div class="message-content-full">
                <div class="message-header-full">
                  <span class="message-sender-full">
                    {{ message.role === 'bot' ? 'AI Помощник' : userName }}
                  </span>
                  <span class="message-time-full">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text" v-html="formatMessage(message.content)"></div>
              </div>
            </div>

            <div v-if="isTyping" class="typing-indicator-full">
              <div class="typing-avatar">
                <v-avatar size="36" color="green">
                  <v-icon color="white">mdi-robot</v-icon>
                </v-avatar>
              </div>
              <div class="typing-content">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="typing-text">AI помощник печатает...</span>
              </div>
            </div>
          </div>
        </div>

        <v-card-text class="chatbot-input-area-full">
          <div class="input-wrapper-full">
            <v-textarea
              v-model="userInput"
              placeholder="Задайте вопрос о тестах, программировании или подготовке..."
              variant="outlined"
              rows="1"
              auto-grow
              hide-details
              class="chatbot-textarea-full"
              @keydown.enter.exact.prevent="sendChatMessage"
              ref="chatInputField"
            />
            <v-btn
              color="primary"
              @click="sendChatMessage"
              :disabled="!userInput.trim() || isTyping"
              class="send-btn-full"
              size="44"
            >
              <v-icon size="20">mdi-send</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Плавающая кнопка чат-бота -->
    <v-btn
      fab
      dark
      color="primary"
      class="chatbot-fab-alternative"
      @click="showChatPanel = true"
      size="56"
      v-if="!showChatPanel && !chatDialogOpen"
    >
      <v-badge
        v-if="unreadMessages > 0"
        color="red"
        :content="unreadMessages"
        dot
      >
        <v-icon size="24">mdi-robot</v-icon>
      </v-badge>
      <v-icon v-else size="24">mdi-robot</v-icon>
    </v-btn>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const drawer = ref(false)

const user = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.isAuthenticated())
const isAdmin = computed(() => {
  return userStore.isAdmin && userStore.isAdmin()
})

const pendingTestsCount = computed(() => {
  try {
    const tests = JSON.parse(localStorage.getItem('pendingTests') || '[]')
    return tests.length
  } catch (e) {
    return 0
  }
})

const hasTestResults = computed(() => {
  try {
    const results = localStorage.getItem('testResults')
    return results && results !== '[]' && results !== 'null' && results !== 'undefined'
  } catch (e) {
    return false
  }
})

const recentResultsCount = computed(() => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]')
    const count = Math.min(results.length, 99)
    return count
  } catch (e) {
    return 0
  }
})

const chatDialogOpen = ref(false)
const userInput = ref('')
const chatMessages = ref([])
const isTyping = ref(false)
const unreadMessages = ref(0)
const messagesContainer = ref(null)
const chatInputField = ref(null)
const isMobile = ref(false)

const showChatPanel = ref(true)
const isChatMinimized = ref(false)
const isChatFullscreen = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const quickQuestions = ref([
  { id: 1, text: 'Анализ результатов', icon: 'mdi-chart-bar', color: 'blue' },
  { id: 2, text: 'Что повторить?', icon: 'mdi-book', color: 'green' },
  { id: 3, text: 'Как улучшить?', icon: 'mdi-trending-up', color: 'amber' },
  { id: 4, text: 'Советы', icon: 'mdi-lightbulb', color: 'purple' }
])

const extendedQuickQuestions = ref([
  { id: 1, text: 'Проанализируй мои результаты тестов', icon: 'mdi-chart-bar', color: 'blue' },
  { id: 2, text: 'Какие темы нужно повторить?', icon: 'mdi-book-alert', color: 'green' },
  { id: 3, text: 'Как улучшить процент правильных ответов?', icon: 'mdi-trending-up', color: 'amber' },
  { id: 4, text: 'Сколько времени дается на тесты?', icon: 'mdi-timer', color: 'purple' },
  { id: 5, text: 'Как начать подготовку к экзамену?', icon: 'mdi-school', color: 'cyan' }
])

const userName = computed(() => {
  if (user.value?.name) return user.value.name
  
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

const shortName = computed(() => {
  const name = userName.value
  if (name.length <= 12) return name
  return name.substring(0, 10) + '...'
})

const profileLink = computed(() => {
  if (isLoggedIn.value) {
    return isAdmin.value ? '/admin/profile' : '/profile'
  }
  return '/login'
})

const testStats = ref(null)

const recentMessages = computed(() => {
  return chatMessages.value.slice(-3).map(msg => ({
    ...msg,
    content: msg.content.length > 50 ? msg.content.substring(0, 47) + '...' : msg.content
  }))
})

const chatDialogWidth = computed(() => {
  if (isMobile.value) return '100%'
  if (isChatFullscreen.value) return '100%'
  return '800'
})

const chatDialogHeight = computed(() => {
  if (isMobile.value) return '100%'
  if (isChatFullscreen.value) return '100%'
  return '700'
})

onMounted(() => {
  userStore.loadUser()
  
  if (!userStore.user && userStore.getToken()) {
    console.log('Обнаружен токен, восстанавливаю сессию...')
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  loadChatMessages()
  checkUnreadChatMessages()
  loadTestStats()
  
  const savedPanelState = localStorage.getItem('ai_chat_panel_minimized')
  if (savedPanelState !== null) {
    isChatMinimized.value = JSON.parse(savedPanelState)
  }
})

watch(() => router.currentRoute.value.path, () => {
  drawer.value = false
})

const loadTestStats = () => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]')
    const stats = {
      totalTests: results.length,
      averageScore: 0,
      totalTime: '0ч 0м'
    }
    
    if (results.length > 0) {
      const totalScore = results.reduce((sum, test) => sum + (test.percentage || 0), 0)
      stats.averageScore = Math.round(totalScore / results.length)
      
      const totalMinutes = results.reduce((sum, test) => sum + (test.timeSpent || 0), 0)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      stats.totalTime = `${hours}ч ${minutes}м`
    }
    
    testStats.value = stats
  } catch (e) {
    console.error('Ошибка загрузки статистики:', e)
  }
}

const toggleChatMinimize = () => {
  isChatMinimized.value = !isChatMinimized.value
  localStorage.setItem('ai_chat_panel_minimized', JSON.stringify(isChatMinimized.value))
}

const hideChatPanel = () => {
  showChatPanel.value = false
}

const openChatFullscreen = () => {
  isChatFullscreen.value = true
  openChatDialog()
}

const toggleFullscreen = () => {
  isChatFullscreen.value = !isChatFullscreen.value
}

const openChatDialog = () => {
  chatDialogOpen.value = true
  isChatMinimized.value = false
  unreadMessages.value = 0
  nextTick(() => {
    scrollToBottom()
    chatInputField.value?.focus()
  })
}

const closeChatDialog = () => {
  chatDialogOpen.value = false
  isChatFullscreen.value = false
  saveChatMessages()
}

const showHelp = () => {
  const helpMessage = {
    id: Date.now().toString(),
    role: 'bot',
    content: '**AI Помощник - Справка**\n\n' +
            'Я могу помочь вам с:\n' +
            '• Анализом результатов тестов\n' +
            '• Рекомендациями по темам\n' +
            '• Советами по тайм-менеджменту\n' +
            '• Ответами на вопросы по программированию\n' +
            '• Стратегиями подготовки к экзаменам\n\n' +
            '**Управление:**\n' +
            '• 📎 - Отправить сообщение\n' +
            '• 🗑️ - Очистить чат\n' +
            '• ⛶ - Полноэкранный режим\n' +
            '• ✕ - Закрыть чат',
    timestamp: Date.now()
  }
  
  chatMessages.value.push(helpMessage)
  scrollToBottom()
}

const clearChat = () => {
  if (confirm('Очистить всю историю чата?')) {
    chatMessages.value = []
    saveChatMessages()
    addWelcomeMessage()
  }
}

const sendChatMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isTyping.value) return
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: Date.now()
  }
  
  chatMessages.value.push(userMessage)
  userInput.value = ''
  saveChatMessages()
  scrollToBottom()
  
  isTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const botResponse = await getBotResponse(text)
  
  chatMessages.value.push({
    id: (Date.now() + 1).toString(),
    role: 'bot',
    content: botResponse,
    timestamp: Date.now()
  })
  
  isTyping.value = false
  saveChatMessages()
  scrollToBottom()
}

const sendQuickQuestion = (text) => {
  userInput.value = text
  sendChatMessage()
}

const getBotResponse = async (question) => {
  const testHistory = await loadTestHistory()
  const testStats = calculateTestStats(testHistory)
  
  const lowerQuestion = question.toLowerCase()
  
  const hasKeywords = {
    result: ['результат', 'оценка', 'балл', 'счет', 'процент', 'статистика'],
    test: ['тест', 'экзамен', 'проверка', 'опрос'],
    topic: ['тема', 'раздел', 'предмет', 'курс'],
    time: ['время', 'длительность', 'минут', 'час'],
    help: ['помощь', 'помоги', 'подсказка', 'совет'],
    repeat: ['повторить', 'слабый', 'плохой', 'ошибк'],
    good: ['хорош', 'отличн', 'улучши', 'повыси'],
    start: ['начать', 'старт', 'подготовк'],
    difficult: ['сложн', 'трудн', 'проблем']
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
      return generateResultResponse(testStats)
    case 'test':
      return generateTestResponse(testHistory)
    case 'topic':
      return generateTopicResponse(testStats, lowerQuestion)
    case 'time':
      return generateTimeResponse(testHistory)
    case 'help':
      return generateHelpResponse()
    case 'repeat':
      return generateRepeatResponse(testStats)
    case 'good':
      return generateGoodResponse(testStats)
    case 'start':
      return generateStartResponse()
    case 'difficult':
      return generateDifficultResponse()
    default:
      return generateGeneralResponse(testHistory)
  }
}

const loadTestHistory = () => {
  try {
    const results = localStorage.getItem('testResults')
    if (results && results !== '[]' && results !== 'null') {
      return JSON.parse(results)
    }
  } catch (e) {
    console.error('Ошибка загрузки истории тестов:', e)
  }
  return []
}

const calculateTestStats = (history) => {
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
}

const generateResultResponse = (stats) => {
  if (!stats || stats.totalTests === 0) {
    return 'Вы еще не проходили тесты. Начните с первого теста, чтобы увидеть свои результаты!'
  }
  
  let response = `**Ваша статистика:**\n\n` +
                `• Всего пройдено тестов: **${stats.totalTests}**\n` +
                `• Средний результат: **${stats.averageScore}%**\n` +
                `• Лучший результат: **${stats.bestScore}%**\n` +
                `• Худший результат: **${stats.worstScore}%**\n\n`
  
  if (stats.averageScore >= 80) {
    response += 'Отличные результаты! Продолжайте в том же духе!'
  } else if (stats.averageScore >= 60) {
    response += 'Хорошие результаты! Есть куда расти.'
  } else {
    response += 'Нужно больше практики. Рекомендую повторить материал.'
  }
  
  return response
}

const generateTestResponse = (history) => {
  if (history.length === 0) {
    return 'У вас пока нет истории тестов. Перейдите в раздел "Все тесты" и начните подготовку!'
  }
  
  const recent = history.slice(0, 3)
  let response = '**Ваши последние тесты:**\n\n'
  
  recent.forEach((test, index) => {
    const date = new Date(test.date).toLocaleDateString('ru-RU')
    response += `${index + 1}. "${test.testTitle}" - **${test.percentage}%** (${date})\n`
  })
  
  response += '\nХотите пройти тест заново или узнать больше о конкретном тесте?'
  
  return response
}

const generateTopicResponse = (stats, question) => {
  if (!stats || stats.weakTopics.length === 0) {
    return 'Судя по вашим результатам, все темы усвоены хорошо! Можете переходить к более сложным заданиям.'
  }
  
  if (question.includes('слаб') || question.includes('плох')) {
    return `**Требуют внимания:** ${stats.weakTopics.slice(0, 5).join(', ')}\n\n` +
           '**Рекомендую:**\n' +
           '1. Повторить теорию по этим темам\n' +
           '2. Пройти тест по этим темам заново\n' +
           '3. Проанализировать ошибки\n' +
           '4. Решать практические задачи'
  }
  
  return 'Для подготовки рекомендую сосредоточиться на практических заданиях и регулярно проходить тесты.'
}

const generateTimeResponse = (history) => {
  if (history.length === 0) {
    return '**Обычно на тест дается 15-30 минут.**\n\n' +
           '**Стратегия:**\n' +
           '1. Начинайте с простых вопросов\n' +
           '2. Оставляйте время на сложные\n' +
           '3. Проверяйте ответы в конце'
  }
  
  const totalTime = history.reduce((sum, test) => sum + (test.timeSpent || 0), 0)
  const avgTime = Math.round(totalTime / history.length / 60)
  
  return `**Среднее время прохождения теста: ${avgTime} минут**\n\n` +
         '**Советы по тайм-менеджменту:**\n' +
         '1. Читайте вопрос внимательно\n' +
         '2. Пропускайте сложные вопросы и возвращайтесь к ним позже\n' +
         '3. Оставляйте 5-10 минут на проверку\n' +
         '4. Следите за временем во время теста'
}

const generateHelpResponse = () => {
  return '**Я могу помочь вам с:**\n\n' +
         '1. Анализом ваших результатов тестов\n' +
         '2. Рекомендациями по темам для повторения\n' +
         '3. Советами по тайм-менеджменту\n' +
         '4. Ответами на вопросы по тестам и программированию\n' +
         '5. Стратегиями подготовки к экзаменам\n' +
         '6. Отслеживанием вашего прогресса\n\n' +
         'Задайте конкретный вопрос или используйте быстрые вопросы!'
}

const generateRepeatResponse = (stats) => {
  if (!stats || stats.weakTopics.length === 0) {
    return 'Все темы усвоены хорошо! Можете переходить к продвинутым заданиям или новым темам.'
  }
  
  return `**План повторения:**\n\n` +
         `1. **${stats.weakTopics[0]}** - начать с теории\n` +
         `2. Решить 5-10 практических задач\n` +
         `3. Пройти тест по теме\n` +
         `4. Проанализировать ошибки\n\n` +
         `**Рекомендация:** Уделяйте 30 минут в день на повторение.`
}

const generateGoodResponse = (stats) => {
  let response = '**Для улучшения результатов:**\n\n' +
                '1. Регулярная практика (ежедневно по 15-30 мин)\n' +
                '2. Анализ ошибок после каждого теста\n' +
                '3. Фокусировка на слабых темах\n' +
                '4. Использование разных типов вопросов\n' +
                '5. Тренировка тайм-менеджмента\n\n'
  
  if (stats && stats.averageScore < 60) {
    response += '**Сосредоточьтесь на основах и повторении материала.**'
  } else if (stats && stats.averageScore < 80) {
    response += '**Работайте над сложными темами и скоростью выполнения.**'
  } else {
    response += '**Осваивайте продвинутые темы и участвуйте в соревнованиях.**'
  }
  
  response += '\n\nПомните: постоянство важнее интенсивности!'
  
  return response
}

const generateStartResponse = () => {
  return '**Отличное решение начать подготовку!**\n\n' +
         '**План для новичка:**\n' +
         '1. Начните с теста "Основы программирования"\n' +
         '2. Уделяйте 20-30 минут в день\n' +
         '3. Анализируйте ошибки после каждого теста\n' +
         '4. Повторяйте слабые темы\n' +
         '5. Постепенно увеличивайте сложность\n\n' +
         'Не забывайте делать перерывы и не перегружайтесь!'
}

const generateDifficultResponse = () => {
  return '**Сложности в обучении - это нормально!**\n\n' +
         '**Что делать если тема кажется сложной:**\n' +
         '1. Разбейте тему на мелкие части\n' +
         '2. Ищите разные объяснения (видео, статьи, примеры)\n' +
         '3. Решайте простые задачи сначала\n' +
         '4. Не бойтесь ошибаться - это часть обучения\n' +
         '5. Делайте перерывы и возвращайтесь к теме свежим\n\n' +
         'Помните: каждый эксперт когда-то был новичком!'
}

const generateGeneralResponse = (history) => {
  if (history.length === 0) {
    return 'Привет! Я AI-помощник по подготовке к тестам. Помогу вам с вопросами по программированию, тестам и подготовке к экзаменам. Задавайте вопросы!'
  }
  
  const responses = [
    'Интересный вопрос! Можете уточнить, что именно вас интересует в тестах?',
    'Я специализируюсь на подготовке к тестам по программированию. Задайте вопрос по этой теме!',
    'Чтобы дать точный ответ, мне нужно больше контекста. О чем именно вы спрашиваете?',
    'Попробуйте задать вопрос о конкретном тесте, теме программирования или подготовке к экзамену.'
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessage = (text) => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const getMessagePreview = (text) => {
  return text.length > 30 ? text.substring(0, 27) + '...' : text
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const checkUnreadChatMessages = () => {
  const lastVisit = localStorage.getItem('chatbot_last_visit')
  if (!lastVisit) return
  
  const savedMessages = JSON.parse(localStorage.getItem('chatbot_messages') || '[]')
  const unread = savedMessages.filter(msg => 
    msg.role === 'bot' && msg.timestamp > parseInt(lastVisit)
  ).length
  
  unreadMessages.value = unread
}

const saveChatMessages = () => {
  localStorage.setItem('chatbot_messages', JSON.stringify(chatMessages.value))
  localStorage.setItem('chatbot_last_visit', Date.now().toString())
}

const loadChatMessages = () => {
  try {
    const saved = localStorage.getItem('chatbot_messages')
    if (saved) {
      chatMessages.value = JSON.parse(saved)
    } else {
      addWelcomeMessage()
    }
  } catch (e) {
    console.error('Ошибка загрузки сообщений:', e)
    chatMessages.value = []
    addWelcomeMessage()
  }
}

const addWelcomeMessage = () => {
  const testHistory = loadTestHistory()
  const testStats = calculateTestStats(testHistory)
  
  let welcomeText = `Привет, ${userName.value}! Я AI-помощник по подготовке к тестам. `
  
  if (testStats) {
    if (testStats.totalTests === 0) {
      welcomeText += 'Начните с первого теста, и я помогу вам улучшить результаты!'
    } else if (testStats.averageScore >= 80) {
      welcomeText += `Отличные результаты! Средний балл: ${testStats.averageScore}%. Продолжайте в том же духе!`
    } else if (testStats.averageScore >= 60) {
      welcomeText += `Хорошая работа! Средний балл: ${testStats.averageScore}%. Есть куда расти!`
    } else {
      welcomeText += `Есть над чем поработать! Средний балл: ${testStats.averageScore}%. Помогу вам улучшить результаты!`
    }
  } else {
    welcomeText += 'Задавайте вопросы о тестах, программировании или подготовке к экзаменам!'
  }
  
  chatMessages.value.push({
    id: 'welcome',
    role: 'bot',
    content: welcomeText,
    timestamp: Date.now()
  })
  saveChatMessages()
}

const logout = async () => {
  try {
    await userStore.logout()
    drawer.value = false
    chatDialogOpen.value = false
    
    router.push('/')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
  }
}
</script>

<style scoped>
.app-bar {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 !important;
}

.nav-container {
  max-width: 1200px !important;
  padding: 0 20px !important;
}

.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  min-width: 160px;
}

.logo:hover {
  opacity: 0.8;
}

.app-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #cbd5e1 !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  font-size: 0.9rem !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  min-width: auto !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  position: relative;
  overflow: visible;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-link.active {
  background: rgba(30, 136, 229, 0.15) !important;
  border-color: rgba(30, 136, 229, 0.3) !important;
  color: #1e88e5 !important;
  font-weight: 600 !important;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #1e88e5;
  border-radius: 3px 3px 0 0;
}

.admin-btn {
  background: rgba(0, 188, 212, 0.1) !important;
  border-color: rgba(0, 188, 212, 0.2) !important;
  color: #00bcd4 !important;
}

.admin-btn:hover {
  background: rgba(0, 188, 212, 0.2) !important;
  border-color: rgba(0, 188, 212, 0.3) !important;
}

.admin-btn.active {
  background: rgba(0, 188, 212, 0.2) !important;
  border-color: rgba(0, 188, 212, 0.4) !important;
  color: #00bcd4 !important;
}

.admin-btn.active::after {
  background: #00bcd4;
}

.chip-counter {
  font-weight: 700 !important;
  height: 18px !important;
  min-width: 18px !important;
  padding: 0 4px !important;
  font-size: 10px !important;
  margin-left: 6px !important;
  transform: translateY(-1px);
}

.user-nav {
  display: flex;
  align-items: center;
  min-width: 160px;
  justify-content: flex-end;
}

.user-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: 40px;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.user-avatar {
  background: rgba(30, 136, 229, 0.2) !important;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ffffff;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-btn {
  font-weight: 500 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  font-size: 0.9rem !important;
  border-radius: 8px !important;
  min-width: auto !important;
  padding: 8px 16px !important;
  height: 40px;
  background: rgba(30, 136, 229, 0.1) !important;
  border: 1px solid rgba(30, 136, 229, 0.2) !important;
  color: #1e88e5 !important;
}

.auth-btn:hover {
  background: rgba(30, 136, 229, 0.2) !important;
  border-color: rgba(30, 136, 229, 0.3) !important;
  color: #1e88e5 !important;
  transform: translateY(-2px);
}

.admin-menu {
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px !important;
  margin-top: 8px !important;
  overflow: hidden;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.admin-header {
  font-weight: 600 !important;
  color: #00bcd4 !important;
  font-size: 0.8rem !important;
  background: rgba(0, 188, 212, 0.1);
}

.user-menu {
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px !important;
  margin-top: 8px !important;
  overflow: hidden;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.user-menu-item {
  border-radius: 6px;
  margin: 2px 8px;
  min-height: 36px !important;
}

.user-menu-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.logout-item {
  color: #ef5350 !important;
}

.logout-item:hover {
  background: rgba(239, 83, 80, 0.1) !important;
}

.mobile-title {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mobile-app-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.mobile-menu {
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-logo-text h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.mobile-logo-text .text-grey {
  font-size: 0.8rem;
  color: #94a3b8;
}

.mobile-profile {
  padding: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  border: 2px solid rgba(30, 136, 229, 0.3);
  background: rgba(30, 136, 229, 0.2) !important;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #ffffff;
}

.mobile-list {
  padding: 8px !important;
}

.mobile-nav-item {
  border-radius: 8px !important;
  margin: 4px 8px !important;
  color: #cbd5e1 !important;
  transition: all 0.2s ease !important;
  padding: 12px 16px !important;
  min-height: 48px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  transform: translateX(4px);
}

.mobile-nav-item.active {
  background: rgba(30, 136, 229, 0.15) !important;
  border-color: rgba(30, 136, 229, 0.3) !important;
  color: #1e88e5 !important;
  font-weight: 600;
}

.mobile-nav-item.active .v-icon {
  color: #1e88e5 !important;
}

.mobile-admin-header {
  color: #00bcd4 !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  padding-left: 16px !important;
  margin-top: 8px !important;
  background: rgba(0, 188, 212, 0.1);
  border-radius: 6px;
  margin: 8px 8px 4px 8px !important;
}

.mobile-footer {
  padding: 16px;
}

.auth-buttons-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-logout-btn {
  color: #ef5350 !important;
  background: rgba(239, 83, 80, 0.1) !important;
  border: 1px solid rgba(239, 83, 80, 0.2) !important;
  height: 44px !important;
}

.mobile-logout-btn:hover {
  background: rgba(239, 83, 80, 0.2) !important;
  border-color: rgba(239, 83, 80, 0.3) !important;
}

.mobile-login-btn {
  height: 44px !important;
  background: rgba(30, 136, 229, 0.1) !important;
  border: 1px solid rgba(30, 136, 229, 0.2) !important;
  color: #1e88e5 !important;
}

.mobile-login-btn:hover {
  background: rgba(30, 136, 229, 0.2) !important;
  border-color: rgba(30, 136, 229, 0.3) !important;
}

.app-main {
  background: #0f172a !important;
  min-height: calc(100vh - 64px);
  position: relative;
}

.ai-chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  z-index: 999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-chat-panel.minimized {
  height: 48px;
}

.chat-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  cursor: pointer;
  user-select: none;
}

.panel-header-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #10b981;
  font-size: 0.95rem;
}

.panel-header-actions {
  display: flex;
  align-items: center;
}

.panel-header-actions .v-btn {
  color: #10b981 !important;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.panel-header-actions .v-btn:hover {
  opacity: 1;
  background: rgba(16, 185, 129, 0.1) !important;
}

.chat-panel-content {
  padding: 16px;
  max-height: 350px;
  overflow-y: auto;
}

.quick-questions-panel {
  margin-bottom: 12px;
}

.quick-questions-title {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.quick-questions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-question-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  font-size: 0.8rem !important;
}

.quick-question-chip:hover {
  background: rgba(16, 185, 129, 0.2) !important;
  transform: translateY(-1px);
}

.mini-chat {
  margin: 12px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mini-chat-title {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.mini-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-message {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.8rem;
}

.mini-message.bot {
  border-left: 3px solid #10b981;
}

.mini-message.user {
  border-left: 3px solid #1e88e5;
}

.mini-message-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.mini-message-text {
  color: #cbd5e1;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-full-chat {
  margin-top: 12px;
}

.open-full-btn {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
  font-weight: 500;
  font-size: 0.9rem !important;
}

.chatbot-dialog-full {
  border-radius: 16px !important;
  overflow: hidden;
}

.chatbot-card-full {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.98) !important;
  backdrop-filter: blur(20px);
}

.chatbot-header-full {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chatbot-title-full {
  display: flex;
  align-items: center;
}

.chatbot-avatar-full {
  background: rgba(255, 255, 255, 0.2) !important;
}

.chatbot-name-full {
  font-weight: 600;
  font-size: 1.1rem;
}

.chatbot-status-full {
  display: flex;
  align-items: center;
  margin-top: 2px;
  font-size: 0.85rem;
}

.chatbot-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chatbot-actions .v-btn {
  color: white !important;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.chatbot-actions .v-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1) !important;
  transform: scale(1.1);
}

.chatbot-main-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.chatbot-sidebar {
  width: 250px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.sidebar-questions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-question-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.sidebar-question-item:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateX(4px);
}

.sidebar-stats {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-content {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #10b981;
}

.chatbot-messages-full {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  margin-bottom: 16px;
}

.welcome-avatar {
  flex-shrink: 0;
}

.welcome-content h3 {
  margin: 0 0 10px 0;
  color: #10b981;
  font-size: 1.2rem;
}

.welcome-content p {
  margin: 6px 0;
  color: #cbd5e1;
  line-height: 1.5;
  font-size: 0.9rem;
}

.welcome-features {
  margin: 10px 0;
  padding-left: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.welcome-features li {
  margin-bottom: 4px;
}

.welcome-hint {
  font-style: italic;
  color: #10b981 !important;
  font-size: 0.9rem;
}

.message-wrapper-full {
  display: flex;
  gap: 12px;
}

.message-wrapper-full.user {
  flex-direction: row-reverse;
}

.message-wrapper-full.user .message-content-full {
  align-items: flex-end;
}

.message-wrapper-full.user .message-text {
  background: rgba(30, 136, 229, 0.2);
  border: 1px solid rgba(30, 136, 229, 0.4);
}

.message-avatar {
  flex-shrink: 0;
}

.message-content-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-header-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-sender-full {
  font-weight: 600;
  font-size: 0.85rem;
  color: #10b981;
}

.message-wrapper-full.user .message-sender-full {
  color: #1e88e5;
}

.message-time-full {
  font-size: 0.7rem;
  color: #94a3b8;
}

.message-text {
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  border-top-left-radius: 4px;
  line-height: 1.5;
  color: #ffffff;
  white-space: pre-line;
  font-size: 0.9rem;
}

.message-text strong {
  color: #10b981;
}

.message-text em {
  color: #94a3b8;
}

.typing-indicator-full {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  border-top-left-radius: 4px;
  width: fit-content;
}

.typing-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.chatbot-input-area-full {
  padding: 12px 16px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.input-wrapper-full {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chatbot-textarea-full {
  flex: 1;
}

.chatbot-textarea-full :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.chatbot-textarea-full :deep(.v-field__input) {
  color: white !important;
  font-size: 0.9rem;
}

.send-btn-full {
  min-width: 40px !important;
  height: 40px !important;
  background: #10b981 !important;
}

.send-btn-full:hover {
  background: #059669 !important;
}

.chatbot-fab-alternative {
  position: fixed !important;
  bottom: 20px;
  right: 20px;
  z-index: 998;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
  background: linear-gradient(135deg, #10b981, #059669) !important;
}

.chatbot-fab-alternative:hover {
  transform: scale(1.1) rotate(10deg) !important;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4) !important;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 8px;
  }
  
  .nav-link {
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
  }
  
  .ai-chat-panel {
    width: calc(100vw - 32px);
    right: 16px;
    bottom: 16px;
  }
  
  .chatbot-sidebar {
    display: none;
  }
  
  .chatbot-messages-full {
    padding: 12px;
  }
  
  .message-content-full {
    max-width: 85%;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 6px;
  }
  
  .nav-link {
    padding: 6px 10px !important;
    font-size: 0.8rem !important;
  }
  
  .ai-chat-panel {
    width: calc(100vw - 24px);
    right: 12px;
    bottom: 12px;
  }
  
  .chat-panel-content {
    max-height: 280px;
  }
}
</style>

<style>
.v-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 500 !important;
}

.v-btn:focus-visible {
  outline: 2px solid rgba(30, 136, 229, 0.5);
  outline-offset: 2px;
}

.v-btn,
.v-list-item,
.v-chip {
  transition: all 0.2s ease !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.text-accent {
  color: #1e88e5 !important;
}

.v-card {
  background: rgba(15, 23, 42, 0.95) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px !important;
}

.v-chip {
  font-weight: 600 !important;
}

.v-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.v-card:hover {
  box-shadow: none !important;
  transform: none !important;
}
</style>