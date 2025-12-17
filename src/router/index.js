import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
    path: '/', 
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
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
    component: () => import('@/views/AllTests.vue')

  },
  { 
    path: '/tests/:id',
    name: 'TestView',
    component: () => import('@/views/TestView.vue'),
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
    path: '/admin', 
    name: 'Admin', 
    component: () => import('@/views/AdminView.vue'),
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

router.beforeEach(async (to, from, next) => {
  console.log(`📍 Навигация: ${from.path || '/'} → ${to.path}`)
  
  const { useUserStore } = await import('@/stores/user')
  const userStore = useUserStore()

  userStore.loadUser()
  
  console.log('👤 Состояние пользователя:', {
    user: userStore.user,
    isAuth: userStore.isAuthenticated(),
    isAdmin: userStore.isAdmin()
  })
  
  const publicRoutes = ['/', '/login', '/register', '/tests', '/state-exams']

  if (publicRoutes.includes(to.path)) {
    console.log('✅ Публичный маршрут - пропускаем')
    return next()
  }
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated()) {
    console.log('🔒 Требуется вход - перенаправляем на логин')
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  
  if (to.meta.requiresAdmin && !userStore.isAdmin()) {
    console.log('🚫 Недостаточно прав - перенаправляем на главную')
    return next('/')
  }

  next()
})

router.afterEach((to, from) => {
  console.log(`✅ Успешный переход: ${from.path || '/'} → ${to.path}`)
})

export default router