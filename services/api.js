const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

class ApiService {
  static async request(endpoint, method = 'GET', data = null, token = null) {
    try {
        const headers = {
        'Content-Type': 'application/json',
        };
        
        if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
        method,
        headers,
        };
        
        // Hanya tambahkan body jika data tidak null dan method bukan GET
        if (data !== null && data !== undefined && method !== 'GET') {
        config.body = JSON.stringify(data);
        }
        
        console.log(`API Request: ${method} ${endpoint}`);
        if (data) {
        console.log('Request body:', JSON.stringify(data, null, 2));
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Log status
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        // Coba parse response
        let result;
        try {
        result = await response.json();
        } catch (e) {
        const text = await response.text();
        console.log('Raw response text:', text);
        result = {
            success: false,
            data: null,
            message: 'Invalid JSON response',
            error: text,
        };
        }
        
        console.log(`API Response: ${method} ${endpoint}`);
        console.log('Response data:', JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return {
        success: false,
        data: null,
        message: error.message || 'Network error',
        error: error.message,
        };
    }
    }

  static async uploadFile(endpoint, formData, token = null) {
    try {
        const headers = {};
        
        if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Jangan set Content-Type untuk FormData
        // Browser akan set otomatis dengan boundary
        
        console.log(`API Upload: POST ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        });
        
        console.log(`Response status: ${response.status}`);
        
        const result = await response.json();
        
        console.log(`API Upload Response:`, result);
        
        return result;
    } catch (error) {
        console.error('API Upload Error:', error);
        return {
        success: false,
        data: null,
        message: error.message || 'Upload failed',
        error: error.message,
        };
    }
    }

  static async get(endpoint, token = null) {
    return this.request(endpoint, 'GET', null, token);
  }

  static async post(endpoint, data, token = null) {
    return this.request(endpoint, 'POST', data, token);
  }

  static async put(endpoint, data, token = null) {
    return this.request(endpoint, 'PUT', data, token);
  }

  static async delete(endpoint, token = null) {
    return this.request(endpoint, 'DELETE', null, token);
  }

  // Authentication
  static async login(username, password) {
    return this.post('/auth/login', { username, password });
  }

  static async verifyToken(token) {
    return this.get('/auth/verify', token);
  }

  static async logout(token) {
    return this.post('/auth/logout', {}, token);
  }

  // Portfolio
  static async getPortfolio() {
    return this.get('/portfolio');
  }

  static async updateProfile(data, token) {
    return this.put('/portfolio/profile', data, token);
  }

  // Social Links
  static async createSocialLink(data, token) {
    return this.post('/portfolio/social-links', data, token);
  }

  static async updateSocialLink(id, data, token) {
    return this.put(`/portfolio/social-links/${id}`, data, token);
  }

  static async deleteSocialLink(id, token) {
    return this.delete(`/portfolio/social-links/${id}`, token);
  }

  // Skills
  static async createSkill(data, token) {
    return this.post('/portfolio/skills', data, token);
  }

  static async updateSkill(id, data, token) {
    return this.put(`/portfolio/skills/${id}`, data, token);
  }

  static async deleteSkill(id, token) {
    return this.delete(`/portfolio/skills/${id}`, token);
  }

  // Experiences
  static async createExperience(data, token) {
    return this.post('/portfolio/experiences', data, token);
  }

  static async updateExperience(id, data, token) {
    return this.put(`/portfolio/experiences/${id}`, data, token);
  }

  static async deleteExperience(id, token) {
    return this.delete(`/portfolio/experiences/${id}`, token);
  }

  // Projects
  static async createProject(data, token) {
    return this.post('/portfolio/projects', data, token);
  }

  static async updateProject(id, data, token) {
    return this.put(`/portfolio/projects/${id}`, data, token);
  }

  static async deleteProject(id, token) {
    return this.delete(`/portfolio/projects/${id}`, token);
  }

  // Messages
  static async createMessage(data) {
    return this.post('/messages', data);
  }

  static async getMessages(token, page = 1, limit = 10) {
    return this.get(`/messages?page=${page}&limit=${limit}`, token);
  }

  static async getUnreadCount(token) {
    return this.get('/messages/unread-count', token);
  }

  static async markAsRead(id, token) {
    // PUT tanpa body (null)
    return this.put(`/messages/${id}/read`, null, token);
  }

  static async deleteMessage(id, token) {
    return this.delete(`/messages/${id}`, token);
  }

  static async replyToMessage(id, replyText, token) {
    return this.post(`/messages/${id}/reply`, { reply_text: replyText }, token);
  }

  // Services
static async getServices(token = null) {
  return this.get('/portfolio/services', token);
}

static async createService(data, token) {
  return this.post('/portfolio/services', data, token);
}

static async updateService(id, data, token) {
  return this.put(`/portfolio/services/${id}`, data, token);
}

static async deleteService(id, token) {
  return this.delete(`/portfolio/services/${id}`, token);
}

// Stats
static async getStats(token = null) {
  return this.get('/portfolio/stats', token);
}

static async createStat(data, token) {
  return this.post('/portfolio/stats', data, token);
}

static async updateStat(id, data, token) {
  return this.put(`/portfolio/stats/${id}`, data, token);
}

static async deleteStat(id, token) {
  return this.delete(`/portfolio/stats/${id}`, token);
}

}

export default ApiService;