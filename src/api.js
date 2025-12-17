
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000' 
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        return await response.json()
      }
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get(endpoint) {
    return this.request(endpoint)
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export const apiGet = (endpoint) => new ApiService().get(endpoint)
export const apiPost = (endpoint, data) => new ApiService().post(endpoint, data)
export const apiPut = (endpoint, data) => new ApiService().put(endpoint, data)
export const apiDelete = (endpoint) => new ApiService().delete(endpoint)

export default new ApiService()
