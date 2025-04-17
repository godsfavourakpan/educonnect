import config from './config';

export interface ILiveClassCreate {
  title: string;
  description: string;
  subject: string;
  startTime: Date | string;
  courseId?: string;
  meetingUrl: string;
  meetingId: string;
  maxParticipants?: number;
}

export interface ILiveClass {
  _id: string;
  id: string;
  title: string;
  description: string;
  subject: string;
  startTime: string;
  scheduledFor: string;
  endTime?: string;
  isLive: boolean;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  participants: {
    id: string;
    name: string;
    joinedAt: string;
  }[];
  courseId?: string;
  meetingUrl: string;
  meetingId: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to make API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Create a proper Headers object from the config headers
  const headers = new Headers();
  
  // Add content-type header
  if (config.headers && config.headers['Content-Type']) {
    headers.append('Content-Type', config.headers['Content-Type']);
  }
  
  // Add authorization header if available
  const authHeader = config.getAuthHeader();
  if (authHeader && authHeader.Authorization) {
    headers.append('Authorization', authHeader.Authorization);
  }
  
  // Add any custom headers from options
  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.keys(optionsHeaders).forEach(key => {
      headers.append(key, optionsHeaders[key]);
    });
  }

  const response = await fetch(`${config.baseURL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// API endpoints for Live Classes
const liveClassApi = {
  // Create a new live class (for tutors)
  createLiveClass: async (liveClassData: ILiveClassCreate): Promise<{ liveClass: ILiveClass } | ILiveClass> => {
    return apiRequest('/live-classes', {
      method: 'POST',
      body: JSON.stringify(liveClassData)
    });
  },

  // Start a live class (for tutors)
  startLiveClass: async (liveClassId: string): Promise<{ meetingUrl: string; meetingId: string; liveClass: ILiveClass }> => {
    return apiRequest(`/live-classes/${liveClassId}/start`, {
      method: 'PATCH'
    });
  },

  // End a live class (for tutors)
  endLiveClass: async (liveClassId: string): Promise<ILiveClass> => {
    return apiRequest(`/live-classes/${liveClassId}/end`, {
      method: 'PATCH'
    });
  },

  // Get all live classes (with optional filters)
  getLiveClasses: async (filters?: { isLive?: boolean; subject?: string; instructorId?: string }): Promise<{ data: ILiveClass[] } | { liveClasses: ILiveClass[] } | ILiveClass[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.isLive !== undefined) {
        queryParams.append('isLive', filters.isLive.toString());
      }
      if (filters.subject) {
        queryParams.append('subject', filters.subject);
      }
      if (filters.instructorId) {
        queryParams.append('instructorId', filters.instructorId);
      }
    }
    
    const url = `/live-classes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(url);
  },

  // Get a specific live class by ID
  getLiveClassById: async (liveClassId: string): Promise<ILiveClass> => {
    const response = await apiRequest(`/live-classes/${liveClassId}`);
    // Handle both direct response and nested response formats
    return response.data || response;
  },

  // Join a live class (for students or instructors)
  joinLiveClass: async (liveClassId: string): Promise<{ 
    meetingUrl: string; 
    meetingId: string; 
    liveClass: ILiveClass;
    isInstructor: boolean;
    role: 'instructor' | 'student';
  }> => {
    return apiRequest(`/live-classes/${liveClassId}/join`, {
      method: 'PUT'
    });
  },

  // Leave a live class
  leaveLiveClass: async (liveClassId: string): Promise<void> => {
    return apiRequest(`/live-classes/${liveClassId}/leave`, {
      method: 'PUT'
    });
  },

  // Get live classes created by the authenticated instructor
  getMyLiveClasses: async (): Promise<ILiveClass[]> => {
    return apiRequest('/live-classes/instructor/my-classes');
  }
};

export default liveClassApi;
