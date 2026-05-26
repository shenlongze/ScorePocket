const STORAGE_KEY_API_HOST = 'billiards_api_host';

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.31.240:8080';

function getApiHost(): string {
  const stored = uni.getStorageSync(STORAGE_KEY_API_HOST);
  const host = stored || ENV_BASE_URL;
  console.log('[API] 当前API地址:', host);
  return host;
}

export function setApiHost(host: string): void {
  uni.setStorageSync(STORAGE_KEY_API_HOST, host);
  console.log('[API] API地址已更新:', host);
}

const API_CONFIG = {
  get BASE_URL() {
    return getApiHost();
  },
  TIMEOUT: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export async function request<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const headers: any = { ...API_CONFIG.headers };
    const fullUrl = `${API_CONFIG.BASE_URL}${url}`;
    console.log(`[API] 请求: ${method} ${fullUrl}`);
    console.log(`[API] 请求数据:`, data);

    uni.request({
      url: fullUrl,
      method,
      data,
      header: headers,
      timeout: API_CONFIG.TIMEOUT,
      success: (res) => {
        console.log(`[API] 响应状态: ${res.statusCode}`);
        console.log(`[API] 响应数据:`, res.data);

        const response = res.data as ApiResponse<T>;

        if (response.code === 200) {
          resolve(response);
        } else {
          reject(new Error(response.message || response.msg || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('[API] 请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

export const api = {
  match: {
    create: (data: any) => request('/api/match', 'POST', data),
    list: (params?: any) => request('/api/match', 'GET', params),
    detail: (id: string) => request(`/api/match/${id}`, 'GET'),
    update: (id: string, data: any) => request(`/api/match/${id}`, 'PUT', data),
    delete: (id: string) => request(`/api/match/${id}`, 'DELETE'),
  },
  player: {
    create: (data: any) => request('/api/player', 'POST', data),
    list: (params?: any) => request('/api/player', 'GET', params),
    detail: (id: string) => request(`/api/player/${id}`, 'GET'),
    update: (id: string, data: any) => request(`/api/player/${id}`, 'PUT', data),
    delete: (id: string) => request(`/api/player/${id}`, 'DELETE'),
  },
  record: {
    create: (data: any) => request('/api/record', 'POST', data),
    list: (params?: any) => request('/api/record', 'GET', params),
    delete: (id: string) => request(`/api/record/${id}`, 'DELETE'),
  },
};

export default api;
