import { io, Socket } from 'socket.io-client';

export interface ClassParticipant {
  userId: string;
  name: string;
  avatar: string;
  role: 'instructor' | 'student';
  socketId: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;
  private API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initialize socket connection
  connect(): void {
    if (!this.socket) {
      this.socket = io(this.API_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
  }

  // Join a live class
  joinLiveClass(classId: string, user: { _id?: string; id?: string; name: string; avatar?: string; role?: string }): void {
    if (!this.socket) this.connect();
    
    this.socket?.emit('join-live-class', { classId, user });
  }

  // Leave a live class
  leaveLiveClass(classId: string, userId: string): void {
    this.socket?.emit('leave-live-class', { classId, userId });
  }

  // Send a chat message
  sendMessage(classId: string, message: ChatMessage): void {
    this.socket?.emit('send-message', { classId, message });
  }

  // Raise/lower hand
  toggleRaiseHand(classId: string, userId: string, raised: boolean): void {
    this.socket?.emit('raise-hand', { classId, userId, raised });
  }

  // Listen for participant updates
  onParticipantsUpdated(callback: (participants: ClassParticipant[]) => void): void {
    this.socket?.on('participants-updated', ({ participants }) => {
      callback(participants);
    });
  }

  // Listen for new messages
  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on('new-message', (message) => {
      callback(message);
    });
  }

  // Listen for raise hand events
  onRaiseHand(callback: (data: { userId: string, raised: boolean }) => void): void {
    this.socket?.on('student-raised-hand', (data) => {
      callback(data);
    });
  }
  
  // Broadcast stream availability (instructor)
  broadcastStream(classId: string, userId: string): void {
    console.log('Broadcasting instructor stream availability', { classId, userId });
    this.socket?.emit('broadcast-stream', { classId, userId });
  }
  
  // Request instructor's stream (student)
  requestInstructorStream(classId: string, userId: string): void {
    console.log('Student requesting instructor stream', { classId, userId });
    this.socket?.emit('request-instructor-stream', { classId, userId });
  }
  
  // Listen for when instructor's stream is ready
  onInstructorStreamReady(callback: (instructorId: string) => void): void {
    this.socket?.on('instructor-stream-ready', (data: { instructorId: string }) => {
      console.log('Received instructor-stream-ready event', data);
      callback(data.instructorId);
    });
  }
  
  // Listen for student stream requests
  onStudentRequestStream(callback: (studentId: string) => void): void {
    this.socket?.on('student-request-stream', (data: { studentId: string }) => {
      console.log('Received student-request-stream event', data);
      callback(data.studentId);
    });
  }
  
  // Listen for student joined event
  onStudentJoined(callback: (studentId: string) => void): void {
    this.socket?.on('student-joined', ({ studentId }) => {
      callback(studentId);
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get instance (Singleton pattern)
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  private static instance: SocketService;
}

export default SocketService.getInstance();
