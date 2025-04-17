/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Clock,
  Filter,
  Play,
  Search,
  Users,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import liveClassApi, { ILiveClass } from "@/api/live-class.api";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Categories for filtering
const categories = [
  "All Categories",
  "Mathematics",
  "Literature",
  "Physics",
  "Computer Science",
  "History",
];

export function LiveClassSchedule() {
  const [view, setView] = useState("calendar");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveClasses, setLiveClasses] = useState<ILiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch live classes from API
  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        setLoading(true);
        const classes = await liveClassApi.getLiveClasses();
        setLiveClasses(classes);
      } catch (error) {
        console.error("Error fetching live classes:", error);
        toast({
          title: "Error",
          description: "Failed to load live classes. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveClasses();
  }, [toast]);

  // Filter classes based on search query and category
  const filteredClasses = liveClasses?.data?.filter((classItem) => {
    const matchesSearch =
      searchQuery === "" ||
      classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      classItem.subject === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filter classes based on date (for calendar view)
  const classesOnSelectedDate = date
    ? filteredClasses?.filter((classItem) => {
        const classDate = new Date(classItem.startTime);
        return (
          classDate.getDate() === date.getDate() &&
          classDate.getMonth() === date.getMonth() &&
          classDate.getFullYear() === date.getFullYear()
        );
      })
    : [];

  // Get live classes
  const liveNowClasses = filteredClasses?.filter(
    (classItem) => classItem.isLive
  );

  // Get upcoming classes (not live and not ended)
  const upcomingClasses = filteredClasses?.filter(
    (classItem) =>
      !classItem.isLive &&
      (!classItem.endTime || new Date(classItem.endTime) > new Date())
  );

  // Get past classes (have an end time in the past)
  const pastClasses = filteredClasses?.filter(
    (classItem) => classItem.endTime && new Date(classItem.endTime) < new Date()
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  // Calculate duration in minutes
  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    return Math.round(durationMs / (1000 * 60));
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="upcoming" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <TabsList>
            <TabsTrigger value="live" className="relative">
              Live Now
              {liveNowClasses?.length > 0 && (
                <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                  {liveNowClasses?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <TabsContent value="live" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {loading ? (
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="pb-2">
                          <Skeleton className="mb-4 h-12 w-full" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-9 w-full" />
                        </CardFooter>
                      </Card>
                    ))
                ) : liveNowClasses?.length === 0 ? (
                  <div className="col-span-2 rounded-lg border p-8 text-center">
                    <p className="text-muted-foreground">
                      No live classes at the moment.
                    </p>
                  </div>
                ) : (
                  liveNowClasses?.map((classItem) => (
                    <ClassCard
                      key={classItem._id}
                      classItem={classItem}
                      getDuration={getDuration}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Upcoming Classes</h2>
                <div className="flex space-x-2">
                  <Button
                    variant={view === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("list")}
                  >
                    List
                  </Button>
                  <Button
                    variant={view === "calendar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("calendar")}
                  >
                    Calendar
                  </Button>
                </div>
              </div>

              {view === "list" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {loading ? (
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i}>
                          <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </CardHeader>
                          <CardContent className="pb-2">
                            <Skeleton className="mb-4 h-12 w-full" />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Skeleton className="h-9 w-full" />
                          </CardFooter>
                        </Card>
                      ))
                  ) : upcomingClasses?.length === 0 ? (
                    <div className="col-span-2 rounded-lg border p-8 text-center">
                      <p className="text-muted-foreground">
                        No upcoming classes scheduled.
                      </p>
                    </div>
                  ) : (
                    upcomingClasses?.data?.map((classItem) => (
                      <ClassCard
                        key={classItem._id}
                        classItem={classItem}
                        getDuration={getDuration}
                        formatDate={formatDate}
                        formatTime={formatTime}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="mx-auto"
                      />
                    </CardContent>
                  </Card>

                  <h3 className="font-medium">
                    Classes on {date?.toDateString()}
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {loading ? (
                      <Card>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="pb-2">
                          <Skeleton className="mb-4 h-12 w-full" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-9 w-full" />
                        </CardFooter>
                      </Card>
                    ) : classesOnSelectedDate?.length === 0 ? (
                      <div className="col-span-2 rounded-lg border p-8 text-center">
                        <p className="text-muted-foreground">
                          No classes scheduled for this date.
                        </p>
                      </div>
                    ) : (
                      classesOnSelectedDate?.map((classItem) => (
                        <ClassCard
                          key={classItem._id}
                          classItem={classItem}
                          getDuration={getDuration}
                          formatDate={formatDate}
                          formatTime={formatTime}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recordings" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="pb-2">
                          <Skeleton className="mb-4 h-12 w-full" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-9 w-full" />
                        </CardFooter>
                      </Card>
                    ))
                ) : pastClasses?.data?.length === 0 ? (
                  <div className="col-span-2 rounded-lg border p-8 text-center">
                    <p className="text-muted-foreground">
                      No recordings found.
                    </p>
                  </div>
                ) : (
                  pastClasses?.data?.map((classItem) => (
                    <ClassCard
                      key={classItem._id}
                      classItem={classItem}
                      getDuration={getDuration}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function ClassCard({
  classItem,
  getDuration,
  formatDate,
  formatTime,
}: {
  classItem: ILiveClass;
  getDuration: (startTime: string, endTime: string) => number;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{classItem.title}</CardTitle>
            <CardDescription>{classItem.subject}</CardDescription>
          </div>
          {classItem.isLive ? (
            <Badge className="bg-red-500 hover:bg-red-600">Live Now</Badge>
          ) : classItem.endTime && new Date(classItem.endTime) < new Date() ? (
            <Badge variant="outline">Recorded</Badge>
          ) : (
            <Badge variant="outline">Upcoming</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="mb-4 text-sm">{classItem.description}</p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{formatDate(classItem.startTime)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(classItem.startTime)}
              {classItem.endTime && ` - ${formatTime(classItem.endTime)}`}
              {classItem.endTime &&
                ` (${getDuration(classItem.startTime, classItem.endTime)} min)`}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {classItem.participants.length}/{classItem.maxParticipants || 100}{" "}
              participants
            </span>
          </div>
          <div className="flex items-center">
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={classItem.instructor.avatar}
                alt={classItem.instructor.name}
              />
              <AvatarFallback>
                {classItem.instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{classItem.instructor.name}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {classItem.isLive ? (
          <Button asChild className="w-full">
            <Link href={`/live-classes/${classItem._id}`}>
              <Play className="mr-2 h-4 w-4" />
              Join Now
            </Link>
          </Button>
        ) : classItem.endTime && new Date(classItem.endTime) < new Date() ? (
          <Button variant="outline" asChild className="w-full">
            <Link href={`/live-classes/recordings/${classItem._id}`}>
              <Video className="mr-2 h-4 w-4" />
              Watch Recording
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild className="w-full">
            <Link href={`/live-classes/${classItem._id}`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
