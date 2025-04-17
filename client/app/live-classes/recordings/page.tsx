"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Search, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import liveClassApi, { ILiveClass } from "@/api/live-class.api";
import { useToast } from "@/components/ui/use-toast";

export default function RecordingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<ILiveClass[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<ILiveClass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would have a specific API endpoint for recordings
        // For now, we'll use the getLiveClasses endpoint and filter client-side
        const classes = await liveClassApi.getLiveClasses();
        // Filter to only include classes that have ended (would have recordings)
        const recordedClasses = classes.filter(
          (cls) => !cls.isLive && cls.endTime
        );
        setRecordings(recordedClasses);
        setFilteredRecordings(recordedClasses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setError("Failed to load recordings. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load recordings. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecordings(recordings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recordings.filter(
      (recording) =>
        recording.title.toLowerCase().includes(query) ||
        recording.description.toLowerCase().includes(query) ||
        recording.subject.toLowerCase().includes(query) ||
        recording.instructor.name.toLowerCase().includes(query)
    );

    setFilteredRecordings(filtered);
  }, [searchQuery, recordings]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format duration for display
  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "Unknown duration";
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/live-classes">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Class Recordings</h1>
          </div>
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Class Recordings</h1>
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/live-classes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Class Recordings</h1>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recordings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="recent" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="subject">By Subject</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredRecordings.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="mb-4">No Recordings Found</CardTitle>
          <p>
            {searchQuery
              ? `No recordings match your search for "${searchQuery}"`
              : "There are no recorded classes available yet."}
          </p>
          {searchQuery && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Video className="h-12 w-12 text-white opacity-75" />
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{recording.title}</CardTitle>
                </div>
                <CardDescription>
                  {formatDate(recording.endTime || recording.startTime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {recording.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(recording.startTime, recording.endTime)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {recording.subject}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/live-classes/recordings/${recording.id}`)}
                >
                  Watch Recording
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
