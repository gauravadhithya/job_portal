// Centralized API Service for Job Portal Frontend

const API_BASE = '/api';

const getHeaders = (token, isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res, fallbackMsg = 'Request failed') => {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (res.status === 404) {
      throw new Error('Backend route not found (404). Please restart your backend server.');
    }
    throw new Error(`Server returned status ${res.status}: ${text.substring(0, 80)}`);
  }

  if (!res.ok) {
    throw new Error(data.message || fallbackMsg);
  }
  return data;
};

export const api = {
  // Auth API
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res, 'Registration failed');
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res, 'Login failed');
  },

  // Jobs API
  async getJobs(token, filters = {}) {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.location) params.append('location', filters.location);
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/jobs${queryString}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    const data = await handleResponse(res, 'Failed to fetch jobs');
    
    // Client-side filtering fallback
    let filteredJobs = Array.isArray(data) ? data : [];
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(j => j.title?.toLowerCase().includes(kw));
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filteredJobs = filteredJobs.filter(j => j.location?.toLowerCase().includes(loc));
    }
    if (filters.skills) {
      const requiredSkills = filters.skills.split(',').map(s => s.trim().toLowerCase());
      filteredJobs = filteredJobs.filter(j => 
        j.skills && j.skills.some(s => requiredSkills.includes(s.toLowerCase()))
      );
    }
    return filteredJobs;
  },

  async createJob(jobData, token) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(jobData),
    });
    return handleResponse(res, 'Failed to create job');
  },

  async updateJobStatus(jobId, status, token) {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res, 'Failed to update job status');
  },

  async deleteJob(jobId, token) {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to delete job');
  },

  // Applications API
  async applyForJob(applicationData, token) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(applicationData),
    });
    return handleResponse(res, 'Failed to submit application');
  },

  async getJobApplications(jobId, token) {
    const res = await fetch(`${API_BASE}/applications/job/${jobId}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to fetch applications');
  },

  async getMyApplications(token) {
    const res = await fetch(`${API_BASE}/applications/my`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to fetch your applications');
  },

  async updateApplicationStatus(applicationId, status, token) {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res, 'Failed to update application status');
  },

  // Upload API
  async uploadResume(file, token) {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await fetch(`${API_BASE}/upload/resume`, {
      method: 'POST',
      headers: getHeaders(token, true),
      body: formData,
    });
    return handleResponse(res, 'Failed to upload resume');
  },

  // Company API
  async getCompanies() {
    const res = await fetch(`${API_BASE}/companies`);
    return handleResponse(res, 'Failed to fetch companies');
  },

  async getMyCompany(token) {
    const res = await fetch(`${API_BASE}/companies/my-company`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to fetch your company');
  },

  async createCompany(companyData, token) {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(companyData),
    });
    return handleResponse(res, 'Failed to create company page');
  },

  async deleteCompany(companyId, token) {
    const res = await fetch(`${API_BASE}/companies/${companyId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to delete company');
  },

  // Admin API
  async getAdminStats(token) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to fetch stats');
  },

  async getAdminUsers(token) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to fetch users');
  },

  async createRecruiter(recruiterData, token) {
    const res = await fetch(`${API_BASE}/admin/recruiters`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(recruiterData),
    });
    return handleResponse(res, 'Failed to register recruiter account');
  },

  async deleteAdminUser(userId, token) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res, 'Failed to delete user');
  },
};
