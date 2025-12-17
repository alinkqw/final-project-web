import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' 

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  components,
  directives,
  theme: {
    defaultTheme: 'examTheme',
    themes: {
      examTheme: {
        colors: {
          primary: '#1E88E5',
          secondary: '#26C6DA',
          error: '#EF5350',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#F5F5F5'
        }
      }
    }
  }
})

const createTestUsers = () => {
  try {
    const usersJson = localStorage.getItem('registeredUsers')
    if (!usersJson || usersJson === '[]') {
      console.log('👑 Создаю тестовых пользователей...')
      
      const adminUser = {
        id: 'admin-1',
        name: 'Администратор',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      }
      
      const studentUser = {
        id: 'student-1',
        name: 'Иванов Иван',
        email: 'student@example.com',
        password: '123456',
        role: 'student'
      }
      
      const users = [adminUser, studentUser]
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      console.log('Тестовые пользователи созданы')
    }
  } catch (error) {
    console.error('Ошибка создания пользователей:', error)
  }
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

createTestUsers()

app.mount('#app')