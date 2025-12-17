
const originalSetItem = localStorage.setItem
const originalRemoveItem = localStorage.removeItem


localStorage.setItem = function(key, value) {
  console.log(`📝 Кто-то устанавливает ${key}:`, value)
  console.trace('Stack trace:')
  
  if (key === 'currentUser') {
    console.warn('⚠️ ВНИМАНИЕ: Устанавливается currentUser!')
    

    try {
      const parsed = JSON.parse(value)
      console.log('👤 Данные пользователя:', parsed)
    } catch(e) {
      console.error('❌ Некорректный JSON:', value)
    }
  }
  
  return originalSetItem.apply(this, arguments)
}

localStorage.removeItem = function(key) {
  console.log(`🗑️ Кто-то удаляет ${key}`)
  console.trace('Stack trace:')
  
  return originalRemoveItem.apply(this, arguments)
}

const originalSessionSetItem = sessionStorage.setItem
sessionStorage.setItem = function(key, value) {
  console.log(`📝 [sessionStorage] Устанавливается ${key}:`, value)
  console.trace('Stack trace:')
  
  return originalSessionSetItem.apply(this, arguments)
}