import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  const loadUser = () => {
    try {
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        user.value = JSON.parse(saved)
      }
    } catch (e) {
      user.value = null
    }
  }

  const login = async (userData) => {
    try {
      const { password, ...safeUser } = userData
      user.value = safeUser
      
      localStorage.setItem('currentUser', JSON.stringify(safeUser))
      
      const token = {
        userId: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        timestamp: Date.now(),
        expires: Date.now() + 24 * 60 * 60 * 1000 
      }
      
      localStorage.setItem('userToken', JSON.stringify(token))
      
      return { success: true, user: safeUser }
    } catch (e) {
      return { success: false, message: 'Ошибка входа' }
    }
  }

  const checkLogin = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      if (users.length === 0) {
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
        
        users.push(adminUser, studentUser)
        localStorage.setItem('registeredUsers', JSON.stringify(users))
      }

      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      )

      if (!foundUser) {
        return { success: false, message: 'Неверный email или пароль' }
      }

      return await login(foundUser)
    } catch (e) {
      return { success: false, message: 'Ошибка сервера' }
    }
  }

  const register = async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email уже используется' }
      }

      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        group: userData.group || 'Не указана',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(users))

      return await login(newUser)
    } catch (e) {
      return { success: false, message: 'Ошибка регистрации' }
    }
  }


  const logout = () => {
    user.value = null
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userToken') 
    return { success: true }
  }

  const isAuthenticated = () => !!user.value
  
  const isAdmin = () => {
    if (!user.value) return false
    return user.value.role === 'admin'
  }


  const getToken = () => {
    const token = localStorage.getItem('userToken')
    return token ? JSON.parse(token) : null
  }

  return { 
    user, 
    loadUser,
    login,
    checkLogin,
    register,
    logout, 
    isAuthenticated, 
    isAdmin,
    getToken
  }
})