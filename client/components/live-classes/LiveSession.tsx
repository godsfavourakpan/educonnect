/* @ts-nocheck */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { VideoPlaceholder } from "./VideoPlaceholder";
import socketService, {
  ClassParticipant,
  ChatMessage,
} from "@/services/socket.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  CircleDot,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  Send,
  Share,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import liveClassApi, { ILiveClass } from "@/api/live-class.api";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Mock chat messages for demonstration
const initialChatMessages = [
  {
    id: "1",
    sender: {
      id: "user1",
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Hello everyone! Welcome to the class.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    sender: {
      id: "user2",
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Thanks for having us. I'm excited to learn about this topic.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "3",
    sender: {
      id: "user3",
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Could you please explain the concept of X in more detail?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "4",
    sender: {
      id: "user1",
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message:
      "Great question, Michael. X is a fundamental concept that relates to Y and Z. Let me elaborate...",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

// Mock resources for demonstration
const resources = [
  {
    id: "resource1",
    title: "Lecture Slides",
    type: "pdf",
    url: "#",
  },
  {
    id: "resource2",
    title: "Practice Exercises",
    type: "doc",
    url: "#",
  },
  {
    id: "resource3",
    title: "Reference Material",
    type: "link",
    url: "https://example.com/reference",
  },
];

export function LiveSession({ sessionId }: { sessionId: string }) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [liveClass, setLiveClass] = useState<ILiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<ClassParticipant[]>([]);
  const [handRaised, setHandRaised] = useState(false);
  const [studentsWithRaisedHands, setStudentsWithRaisedHands] = useState<
    string[]
  >([]);
  const [instructorJoined, setInstructorJoined] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const classId = sessionId || (params?.id as string);

  // Create a mock stream for demo purposes
  const createMockStream = useCallback(() => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      // Draw a simple pattern on the canvas
      if (ctx) {
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText("Instructor Video", canvas.width / 2, canvas.height / 2);
      }

      // Create a stream from the canvas
      // @ts-expect-error - This is a valid method but TypeScript doesn't recognize it
      const stream = canvas.captureStream(30); // 30 FPS
      return stream;
    } catch (error) {
      console.error('Error creating mock stream:', error);
      // Return a dummy MediaStream object
      return new MediaStream();
    }
  }, []);

  // Initialize video stream
  const initializeVideoStream = useCallback(async (isTeacher = false) => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support video streaming');
      }

      // Request access to user's camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Set the local stream for display if the ref is available
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      } else {
        console.warn('localVideoRef is not available yet');
      }
      setLocalStream(stream);

      // Toggle initial audio state (default: unmuted)
      if (!audioEnabled) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }

      // Toggle initial video state (default: enabled)
      if (!videoEnabled) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }

      // In a real implementation, we would use WebRTC to establish peer connections
      // between the instructor and students. For this demo, we'll simulate it:
      if (isTeacher) {
        // If user is instructor, broadcast their stream to all students
        console.log("Broadcasting instructor stream");
        const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
        const userId = userObj._id || userObj.id;
        if (userId) {
          socketService.broadcastStream(classId, userId);
          
          // Listen for student stream requests and respond
          socketService.onStudentRequestStream((studentId) => {
            console.log(`Student ${studentId} requested instructor stream`);
            // In a real WebRTC implementation, we would establish a peer connection
            // For now, we'll just broadcast again to ensure the student gets notified
            socketService.broadcastStream(classId, userId);
          });
        }
      } else {
        // If user is student, request the instructor's stream
        console.log("Student requesting instructor stream");
        const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
        const userId = userObj._id || userObj.id;
        if (userId) {
          socketService.requestInstructorStream(classId, userId);
        }
      }
      
      return stream;
    } catch (err) {
        console.error("Error accessing media devices:", err);
        toast({
          title: "Camera Access Error",
          description:
            "Could not access your camera or microphone. Please check permissions.",
          variant: "destructive",
        });
        return null;
      }
    },
    [audioEnabled, classId, toast, videoEnabled, user]
  );

  // Toggle video
  const toggleVideo = useCallback(() => {
    setVideoEnabled(!videoEnabled);

    if (localStream) {
      localStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !videoEnabled;
      });
    }
  }, [videoEnabled, localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(!audioEnabled);
    setIsMuted(!isMuted);

    if (localStream) {
      localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !isMuted;
      });
    }
  }, [audioEnabled, isMuted, localStream]);

  // Toggle screen sharing
  const toggleScreenSharing = useCallback(async () => {
    try {
      if (screenSharing) {
        // Stop screen sharing
        if (screenStream) {
          screenStream
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
          setScreenStream(null);
        }
        setScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        // Only set the srcObject if the ref is available
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }

        setScreenStream(stream);
        setScreenSharing(true);

        // Add event listener for when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          setScreenStream(null);
        };
      }
    } catch (err) {
      console.error("Error toggling screen share:", err);
      toast({
        title: "Error",
        description: "Could not share your screen. Please try again.",
        variant: "destructive",
      });
    }
  }, [screenSharing, screenStream, toast]);

  // Handle leaving the class
  const handleLeaveClass = useCallback(() => {
    // Explicitly turn off camera and stop all tracks from the media stream before leaving
    if (localStream) {
      try {
        // Turn off video first (set tracks to disabled)
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
        
        // Turn off audio
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        
        // After a short delay to ensure tracks are disabled, stop all tracks
        setTimeout(() => {
          try {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
          } catch (err) {
            console.error('Error stopping tracks:', err);
          }
        }, 300);
      } catch (err) {
        console.error('Error disabling tracks:', err);
        // Fallback: try to stop tracks directly
        try {
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        } catch (stopErr) {
          console.error('Error stopping tracks in fallback:', stopErr);
        }
      }
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }

    // Also stop the remote video stream if it exists (for students viewing instructor)
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
      remoteStream.getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    
    // Reset instructor joined state
    setInstructorJoined(false);
    
    // Leave the socket room
    if (user) {
      // Use type assertion with interface to avoid 'any'
      const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
      const userId = userObj._id || userObj.id;
      if (userId) {
        socketService.leaveLiveClass(classId, userId);
        socketService.disconnect();
      }
    }

    // Navigate back to the previous page
    router.back();
  }, [localStream, screenStream, router, user, classId, remoteVideoRef, setInstructorJoined]);

  // Start/stop recording
  const toggleRecording = useCallback(() => {
    // In a real implementation, you would start/stop recording the session
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording
        ? "The recording has been stopped."
        : "The session is now being recorded.",
      variant: "default",
    });
  }, [isRecording, toast]);

  // Join live class
  const joinLiveClass = useCallback(async () => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join a live class",
          variant: "destructive",
        });
        return;
      }

      // In a real app, you would call an API to join the class
      // For demo purposes, we'll simulate joining
      const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
      const userId = userObj._id || userObj.id;
      
      // Safe access to instructor properties
      const instructorObj = liveClass?.instructor as { _id?: string; id?: string; name: string; avatar?: string };
      const instructorId = instructorObj?._id || instructorObj?.id;

      const joinResponse = {
        success: true,
        role: userId === instructorId ? "instructor" : "student",
        isInstructor: userId === instructorId,
        liveClass: liveClass,
      };

      // Update the live class data
      setLiveClass(joinResponse.liveClass);

      // Set instructor status
      setIsInstructor(joinResponse.isInstructor);

      // Connect to socket and join the live class room
      socketService.connect();
      socketService.joinLiveClass(classId, {
        _id: userId,
        name: user.name || "Anonymous User",
        avatar: user.avatar || "",
        role: joinResponse.role,
      });

      // Initialize video stream after joining
      await initializeVideoStream();

      console.log(
        "Joined as:",
        joinResponse.role,
        "Is instructor:",
        joinResponse.isInstructor
      );
    } catch (err) {
      console.error("Error joining live class:", err);
      toast({
        title: "Error",
        description: "Could not join the live class. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, liveClass, user, classId, initializeVideoStream]);

  // Handle raising/lowering hand
  // const toggleRaiseHand = useCallback(() => {
  //   if (!user || !classId) return;

  //   const userId = (user as any)._id || (user as any).id;
  //   const newRaisedState = !handRaised;

  //   // Update local state
  //   setHandRaised(newRaisedState);

  //   // Send to server via socket
  //   socketService.toggleRaiseHand(classId, userId, newRaisedState);

  //   toast({
  //     title: newRaisedState ? "Hand Raised" : "Hand Lowered",
  //     description: newRaisedState ? "The instructor has been notified" : "Your hand has been lowered",
  //     variant: "default",
  //   });
  // }, [handRaised, user, classId, toast]);

  // Setup socket event listeners
  useEffect(() => {
    // Listen for participant updates
    socketService.onParticipantsUpdated((updatedParticipants) => {
      setParticipants(updatedParticipants);
      console.log("Participants updated:", updatedParticipants);
    });

    // Listen for new messages
    socketService.onNewMessage((message) => {
      setChatMessages((prevMessages) => [
        ...prevMessages, 
        {
          id: message.id,
          sender: {
            id: message.userId,
            name: message.userName,
            avatar: message.userAvatar
          },
          message: message.content,
          timestamp: message.timestamp.toString()
        }
      ]);
    });

    // Listen for raised hands
    socketService.onRaiseHand(({ userId, raised }) => {
      if (raised) {
        setStudentsWithRaisedHands((prev) => [...prev, userId]);
      } else {
        setStudentsWithRaisedHands((prev) =>
          prev.filter((id) => id !== userId)
        );
      }
    });

    return () => {
      // Cleanup socket connection when component unmounts
      socketService.disconnect();
    };
  }, []);

  // Fetch live class data
  useEffect(() => {
    const fetchLiveClass = async () => {
      try {
        setLoading(true);
        const data = await liveClassApi.getLiveClassById(classId);

        console.log(data);
        setLiveClass(data);

        // Check if user is the instructor
        const instructorId = data.instructor._id || data.instructor.id;
        const userObj = user as { _id?: string; id?: string };
        const userId = userObj._id || userObj.id;

        if (user && userId === instructorId) {
          setIsInstructor(true);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching live class:", err);
        setError("Failed to load the live class. Please try again later.");
        setLoading(false);
      }
    };

    if (classId) {
      fetchLiveClass();
    }

    // Scroll to bottom of chat when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [classId, user]);

  useEffect(() => {
    if (user && liveClass && liveClass.instructor) {
      // Check both _id and id fields since the API might return either format
      const instructorId = liveClass.instructor._id || liveClass.instructor.id;
      const userObj = user as { _id?: string; id?: string };
      const userId = userObj._id || userObj.id;
      if (instructorId === userId) {
        setIsInstructor(true);
      }
    }
  }, [liveClass, isInstructor, user, toast]);

  // Handle raising/lowering hand
  const toggleRaiseHand = useCallback(() => {
    if (!user || !classId) return;

    const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
    const userId = userObj._id || userObj.id;
    if (!userId) return;
    
    const newRaisedState = !handRaised;

    // Update local state
    setHandRaised(newRaisedState);

    // Send to server via socket
    socketService.toggleRaiseHand(classId, userId, newRaisedState);

    toast({
      title: newRaisedState ? "Hand Raised" : "Hand Lowered",
      description: newRaisedState
        ? "The instructor has been notified"
        : "Your hand has been lowered",
      variant: "default",
    });
  }, [handRaised, user, classId, toast]);

  // Setup socket event listeners
  useEffect(() => {
    // Listen for participant updates
    socketService.onParticipantsUpdated((updatedParticipants) => {
      setParticipants(updatedParticipants);
      console.log("Participants updated:", updatedParticipants);
    });

    // Listen for new messages
    socketService.onNewMessage((message) => {
      setChatMessages((prevMessages) => [
        ...prevMessages, 
        {
          id: message.id,
          sender: {
            id: message.userId,
            name: message.userName,
            avatar: message.userAvatar
          },
          message: message.content,
          timestamp: message.timestamp.toString()
        }
      ]);
    });

    // Listen for raised hands
    socketService.onRaiseHand(({ userId, raised }) => {
      if (raised) {
        setStudentsWithRaisedHands((prev) => [...prev, userId]);
      } else {
        setStudentsWithRaisedHands((prev) =>
          prev.filter((id) => id !== userId)
        );
      }
    });

    return () => {
      // Cleanup socket connection when component unmounts
      socketService.disconnect();
    };
  }, []);

  // Listen for instructor stream ready event
  useEffect(() => {
    if (classId && !isInstructor) {
      // Setup listener for instructor stream ready event
      socketService.onInstructorStreamReady((instructorId) => {
        console.log(`Instructor ${instructorId} stream is ready`);
        // In a real WebRTC implementation, we would connect to the instructor's stream
        // For the demo, we'll simulate receiving the instructor's stream
        setTimeout(() => {
          // Create a mock instructor stream for demonstration
          const mockStream = createMockStream();
          
          // Only set the srcObject if the ref is available
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = mockStream;
            // Update UI to show instructor is streaming
            setInstructorJoined(true);
          }
        }, 500);
      });
    }
    
    return () => {
      // No specific cleanup needed for this listener as the socket disconnect will handle it
    };
  }, [classId, isInstructor, createMockStream]);
  
  // Setup video when component mounts
  useEffect(() => {
    if (liveClass?.isLive && user) {
      const setupVideo = async () => {
        try {
          // Pass the isInstructor flag to properly initialize the correct stream type
          const stream = await initializeVideoStream(isInstructor);
          setLocalStream(stream);
        } catch (error) {
          console.error('Failed to initialize video stream:', error);
          toast({
            title: "Video Stream Error",
            description: "Could not initialize your camera. Please check your permissions and try again.",
            variant: "destructive",
          });
        }
      };

      setupVideo();
    }

    return () => {
      // Cleanup video streams when component unmounts
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [liveClass, user, initializeVideoStream, localStream, screenStream, isInstructor, toast]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const userObj = user as { _id?: string; id?: string; name: string; avatar?: string };
    const userId = userObj._id || userObj.id;
    
    if (!userId) return;
    
    // Create a new message object for the socket
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userId,
      userName: userObj.name || "Anonymous",
      userAvatar: userObj.avatar || "",
      content: newMessage,
      timestamp: new Date(),
    };

    // Send message via socket
    socketService.sendMessage(classId, message);

    // Also update local state for immediate feedback
    setChatMessages([...chatMessages, {
      id: message.id,
      sender: {
        id: message.userId,
        name: message.userName,
        avatar: message.userAvatar
      },
      message: message.content,
      timestamp: new Date().toISOString()
    }]);
    setNewMessage("");
  };

  // Handle key press in chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time for display
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>

          <div>
            <Skeleton className="mb-4 h-10 w-full" />
            <Skeleton className="h-[350px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Live Class</h1>
        </div>

        <Card className="p-8 text-center">
          <CardTitle className="mb-4 text-red-500">Error</CardTitle>
          <p>{error}</p>
          <Button className="mt-4" asChild>
            <Link href="/live-classes">Back to Live Classes</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Live Class</h1>
        </div>

        <Card className="p-8 text-center">
          <CardTitle className="mb-4">Class Not Found</CardTitle>
          <p>
            The live class you&apos;re looking for doesn&apos;t exist or has
            ended.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/live-classes">Back to Live Classes</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{liveClass.title}</h1>
            <p className="text-sm text-muted-foreground">{liveClass.subject}</p>
          </div>
        </div>
        {liveClass.isLive && (
          <Badge className="bg-red-500 hover:bg-red-600">Live Now</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              {liveClass.isLive ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {/* Different video layouts based on user role */}
                  {isInstructor ? (
                    /* INSTRUCTOR VIEW: Show student videos or placeholder */
                    <div className="relative h-full w-full">
                      {screenSharing ? (
                        <video
                          ref={screenShareRef}
                          className="h-full w-full object-contain"
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-gray-800 rounded-lg">
                          <div className="text-center p-4">
                            <h3 className="text-xl font-semibold mb-2">
                              You are the instructor
                            </h3>
                            <p className="text-gray-300 mb-4">
                              Your video is being shared with students
                            </p>
                            <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
                              {/* This would be replaced with actual student videos in a real implementation */}
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center"
                                >
                                  <p>Student {i}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : /* STUDENT VIEW: Show instructor's video or screen share */
                  screenSharing ? (
                    <video
                      ref={screenShareRef}
                      className="h-full w-full object-contain"
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="relative h-full w-full">
                      <video
                        ref={remoteVideoRef}
                        className="h-full w-full object-cover"
                        autoPlay
                        playsInline
                      />
                      {!remoteVideoRef.current?.srcObject && !instructorJoined && (
                        <div className="absolute inset-0">
                          <VideoPlaceholder
                            message="Waiting for instructor's video"
                            subMessage="The video stream will appear once the instructor starts sharing"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participant thumbnails */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    {/* Local video (yourself) */}
                    <div className="h-24 w-32 overflow-hidden rounded-lg bg-background/80 shadow-sm">
                      <video
                        ref={localVideoRef}
                        className="h-full w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <VideoPlaceholder
                    message="This class hasn't started yet"
                    subMessage={`The instructor hasn&apos;t started the live session. It&apos;s scheduled to begin at ${new Date(
                      liveClass.scheduledFor
                    ).toLocaleString()}.`}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button onClick={joinLiveClass}>Join Waiting Room</Button>
                  </div>
                </div>
              )}

              {liveClass.isLive && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={videoEnabled ? "default" : "outline"}
                      onClick={toggleVideo}
                    >
                      {videoEnabled ? (
                        <Video className="mr-2 h-4 w-4" />
                      ) : (
                        <VideoOff className="mr-2 h-4 w-4" />
                      )}
                      {videoEnabled ? "Video On" : "Video Off"}
                    </Button>
                    <Button
                      size="sm"
                      variant={audioEnabled ? "default" : "outline"}
                      onClick={toggleAudio}
                    >
                      {audioEnabled ? (
                        <Mic className="mr-2 h-4 w-4" />
                      ) : (
                        <MicOff className="mr-2 h-4 w-4" />
                      )}
                      {audioEnabled ? "Mic On" : "Mic Off"}
                    </Button>

                    {isInstructor && (
                      <>
                        <Button
                          size="sm"
                          variant={screenSharing ? "default" : "outline"}
                          onClick={toggleScreenSharing}
                        >
                          <Share className="mr-2 h-4 w-4" />
                          {screenSharing ? "Stop Sharing" : "Share Screen"}
                        </Button>
                        <Button
                          size="sm"
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={toggleRecording}
                        >
                          <CircleDot className="mr-2 h-4 w-4" />
                          {isRecording ? "Stop Recording" : "Record"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toast({
                              title: "Student Management",
                              description:
                                "Student management features will be implemented in a future update.",
                              variant: "default",
                            })
                          }
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Students
                        </Button>
                      </>
                    )}

                    {!isInstructor && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast({
                            title: "Raised Hand",
                            description:
                              "The instructor has been notified that you raised your hand.",
                            variant: "default",
                          })
                        }
                      >
                        <Hand className="mr-2 h-4 w-4" />
                        Raise Hand
                      </Button>
                    )}
                  </div>

                  {!isInstructor && (
                    <Button
                      size="sm"
                      variant={handRaised ? "default" : "outline"}
                      onClick={toggleRaiseHand}
                      className={
                        handRaised
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : ""
                      }
                    >
                      <Hand className="mr-2 h-4 w-4" />
                      {handRaised ? "Lower Hand" : "Raise Hand"}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleLeaveClass}
                  >
                    <PhoneOff className="mr-2 h-4 w-4" />
                    Leave
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={liveClass.instructor.avatar}
                      alt={liveClass.instructor.name}
                    />
                    <AvatarFallback>
                      {liveClass?.instructor?.name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{liveClass.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share this class</DialogTitle>
                        <DialogDescription>
                          Copy the link below to share this live class with
                          others.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2">
                        <Input
                          value={`${window.location.origin}/live-classes/${liveClass._id}`}
                          readOnly
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/live-classes/${liveClass._id}`
                            );
                            toast({
                              title: "Link copied",
                              description:
                                "The class link has been copied to your clipboard.",
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Report an issue</DropdownMenuItem>
                      <DropdownMenuItem>Picture-in-picture</DropdownMenuItem>
                      <DropdownMenuItem>Full screen</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-medium">About this class</h2>
            <p className="text-muted-foreground">{liveClass.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-medium">Resources</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.type.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={resource.url} target="_blank">
                        Download
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Tabs defaultValue="chat">
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Participants ({liveClass.participants.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={message.sender.avatar}
                              alt={message.sender.name}
                            />
                            <AvatarFallback>
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {message.sender.name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex w-full items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="participants" className="mt-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Instructor</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={liveClass.instructor.avatar || ''}
                        alt={liveClass.instructor.name}
                      />
                      <AvatarFallback>
                        {liveClass?.instructor?.name?.charAt(0) || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{liveClass.instructor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Instructor
                      </p>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {participants.map((participant) => (
                        <div
                          key={participant.socketId}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.name}
                            />
                            <AvatarFallback>
                              {participant.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {participant.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {participant.role}
                              {studentsWithRaisedHands.includes(
                                participant.userId
                              ) && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300"
                                >
                                  <Hand className="h-3 w-3 mr-1" /> Hand Raised
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      {participants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No participants yet
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
