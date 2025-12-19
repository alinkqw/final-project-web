import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AllTests from '@/views/AllTests.vue'
import AdminTests from '@/views/AdminTests.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/tests',
    name: 'AllTests',
    component: AllTests 
  },
  {
    path: '/tests/:id',
    name: 'TestView',
    component: () => import('@/views/TestView.vue'),
    props: true
  },
  
  {
    path: '/dashboard/test-results/:id',
    name: 'TestResultDetails',
    component: () => import('@/views/TestResultDetails.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/test-results/:testId',
    name: 'TestResults',
    component: () => import('@/views/TestResults.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/test-results/card/:id',
    name: 'TestResultsCard',
    component: () => import('@/views/TestResultsCard.vue'),
    props: true
  },
  {
    path: '/test-history',
    name: 'TestHistory',
    component: () => import('@/views/TestHistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/tests',
    name: 'AdminTests',
    component: AdminTests,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('@/views/AdminProfileView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/tests',
  '/test-results/card/:id'
]

const isPublicRoute = (path) => {
  if (publicRoutes.includes(path)) {
    return true
  }

  if (path.startsWith('/tests/')) {
    const param = path.split('/tests/')[1]
    if (/^\d+$/.test(param)) {
      return true
    }
  }
  if (path.startsWith('/test-results/card/')) {
    const param = path.split('/test-results/card/')[1]
    if (/^\d+$/.test(param)) {
      return true
    }
  }

  return false
}

router.beforeEach(async (to, from, next) => {
  console.log(`📍 Навигация: ${from.path || '/'} → ${to.path}`)

  if (isPublicRoute(to.path)) {
    console.log('✅ Публичный маршрут - пропускаем проверку авторизации')
    return next()
  }

  try {
    const userStore = useUserStore()
    
    userStore.loadUser()
    
    console.log('👤 Состояние пользователя:', {
      user: userStore.user,
      isAuth: userStore.isAuthenticated(),
      isAdmin: userStore.isAdmin()
    })
    
    if (to.meta.requiresAuth && !userStore.isAuthenticated()) {
      console.log('🔒 Требуется вход - перенаправляем на логин')
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
    
    if (to.meta.requiresAdmin) {
      if (!userStore.isAuthenticated()) {
        console.log('🔒 Требуется вход - перенаправляем на логин')
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
      
      if (!userStore.isAdmin()) {
        console.log('🚫 Недостаточно прав - перенаправляем на главную')
        const adminRoutes = ['/admin', '/admin/tests', '/admin/profile']
        if (adminRoutes.includes(to.path)) {
          alert('У вас нет прав для доступа к админ-панели')
        }
        return next('/')
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка в guard:', error)
    
    if (isPublicRoute(to.path)) {
      return next()
    }
    
    return next('/login')
  }

  next()
})

router.afterEach((to, from) => {
  console.log(`✅ Успешный переход: ${from.path || '/'} → ${to.path}`)
  
  const pageTitles = {
    '/': 'ГосЭкзамен - Главная',
    '/tests': 'ГосЭкзамен - Все тесты',
    '/test-history': 'ГосЭкзамен - История тестов',
    '/admin/tests': 'Админ-панель - Управление тестами',
    '/login': 'ГосЭкзамен - Вход',
    '/register': 'ГосЭкзамен - Регистрация',
    '/dashboard': 'ГосЭкзамен - Личный кабинет',
    '/profile': 'ГосЭкзамен - Профиль',
    '/admin': 'ГосЭкзамен - Админ-панель'
  }
  
  if (pageTitles[to.path]) {
    document.title = pageTitles[to.path]
  } else if (to.path.startsWith('/tests/')) {
    document.title = 'ГосЭкзамен - Прохождение теста'
  } else if (to.path.startsWith('/test-results/')) {
    document.title = 'ГосЭкзамен - Результаты теста'
  } else {
    document.title = 'ГосЭкзамен - Платформа подготовки к экзаменам'
  }
})

export default router