/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookmarkIcon,
  ChevronLeft,
  Download,
  FastForward,
  FileText,
  Pause,
  Play,
  Rewind,
  Share2,
  Volume2,
} from "lucide-react";

// Mock recording data
const recordingData = {
  id: "recording-1",
  title: "Introduction to Programming",
  course: "Computer Science Basics",
  description: "Learn the fundamentals of programming and algorithms",
  date: "September 12, 2023",
  duration: "1 hour 30 minutes",
  tutor: {
    name: "Prof. Davis",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  resources: [
    {
      id: "resource-1",
      title: "Programming Basics Slides",
      type: "pdf",
      size: "2.2 MB",
    },
    {
      id: "resource-2",
      title: "Code Examples",
      type: "zip",
      size: "1.5 MB",
    },
  ],
  notes: [
    {
      id: "note-1",
      timestamp: "00:05:23",
      content:
        "Definition of programming: Process of creating a set of instructions that tell a computer how to perform a task.",
    },
    {
      id: "note-2",
      timestamp: "00:18:45",
      content:
        "Key programming concepts: variables, data types, control structures, functions.",
    },
    {
      id: "note-3",
      timestamp: "00:32:10",
      content:
        "Algorithm: Step-by-step procedure for solving a problem or accomplishing a task.",
    },
    {
      id: "note-4",
      timestamp: "00:47:30",
      content:
        "Example of a simple algorithm: Finding the largest number in a list.",
    },
    {
      id: "note-5",
      timestamp: "01:05:15",
      content:
        "Introduction to pseudocode and flowcharts for algorithm design.",
    },
  ],
  transcript: `
    [00:00:00] Prof. Davis: Good afternoon everyone, and welcome to our introduction to programming session. Today we'll be covering the fundamental concepts of programming and algorithms.

    [00:01:30] Prof. Davis: Let's start by defining what programming actually is. Programming is the process of creating a set of instructions that tell a computer how to perform a task.

    [00:05:23] Prof. Davis: These instructions are written in programming languages, which are essentially ways for humans to communicate with computers in a structured way.

    [00:08:45] Prof. Davis: Before we dive into specific programming languages, it's important to understand some key concepts that are common across most languages.

    [00:18:45] Prof. Davis: These include variables, data types, control structures, and functions. Let's go through each of these one by one...
  `,
};

export function RecordingPlayer({ recordingId }: { recordingId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [activeTab, setActiveTab] = useState("notes");
  const [newNote, setNewNote] = useState("");

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would add the note to the database
      setNewNote("");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to recordings</span>
            </Link>
          </Button>
          <div className="ml-2">
            <h1 className="text-lg font-medium">{recordingData.title}</h1>
            <p className="text-sm text-muted-foreground">
              {recordingData.course}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="grid h-full grid-rows-[1fr_auto]">
            {/* Video Area */}
            <div className="bg-black p-4">
              <div className="mx-auto aspect-video max-h-[calc(100vh-16rem)] overflow-hidden rounded-lg bg-muted">
                {/* This would be replaced with actual video component in a real app */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-2">Video recording would appear here</p>
                    <p className="text-sm opacity-70">{recordingData.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t bg-background p-4">
              <div className="mb-2 flex items-center">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <div className="mx-4 flex-1">
                  <Slider
                    value={[currentTime]}
                    max={5400} // 1h30m in seconds
                    step={1}
                    onValueChange={(value) => setCurrentTime(value[0])}
                  />
                </div>
                <span className="text-sm">01:30:00</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Rewind className="h-5 w-5" />
                  </Button>
                  <Button size="icon" onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FastForward className="h-5 w-5" />
                  </Button>
                  <div className="ml-4 flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" />
                    <Slider
                      className="w-24"
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0])}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    Add Bookmark
                  </Button>
                  <select className="rounded-md border px-2 py-1 text-sm">
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="1.75">1.75x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden w-80 border-l md:block">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent
              value="notes"
              className="flex h-[calc(100%-40px)] flex-col"
            >
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <h3 className="font-medium">Your Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a timestamp to jump to that point in the video.
                  </p>
                </div>

                <div className="space-y-4">
                  {recordingData.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 text-xs font-medium text-primary"
                        >
                          {note.timestamp}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <BookmarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Add Note at {formatTime(currentTime)}
                  </h4>
                  <textarea
                    className="h-20 w-full rounded-md border p-2 text-sm"
                    placeholder="Type your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  ></textarea>
                  <Button onClick={handleAddNote} className="w-full">
                    Save Note
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="transcript"
              className="h-[calc(100%-40px)] overflow-y-auto p-4"
            >
              <div className="space-y-4">
                <h3 className="font-medium">Transcript</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a timestamp to jump to that point in the video.
                </p>

                <div className="whitespace-pre-line text-sm">
                  {recordingData.transcript.split("\n").map((line, index) => {
                    const timestampMatch = line.match(
                      /\[(\d{2}:\d{2}:\d{2})\]/
                    );
                    if (timestampMatch) {
                      const timestamp = timestampMatch[1];
                      const content = line.replace(
                        /\[\d{2}:\d{2}:\d{2}\]\s*/,
                        ""
                      );
                      return (
                        <div key={index} className="mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mb-1 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {timestamp}
                          </Button>
                          <p>{content}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="mb-4">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="resources"
              className="h-[calc(100%-40px)] overflow-y-auto p-4"
            >
              <div className="space-y-4">
                <h3 className="font-medium">Session Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Download these resources to enhance your learning.
                </p>

                <div className="space-y-2">
                  {recordingData.resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {resource.type.toUpperCase()} • {resource.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium">
                    About the Instructor
                  </h4>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={recordingData.tutor.avatar}
                        alt={recordingData.tutor.name}
                      />
                      <AvatarFallback>
                        {recordingData.tutor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{recordingData.tutor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Computer Science Professor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
