"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Search, Star, Users } from "lucide-react";
import { getAllCourses } from "@/api/course";
import { useQuery } from "@tanstack/react-query";
import type { Course, CourseResponse } from "@/api/course";

const categories = [
  "All Categories",
  "Mathematics",
  "Language",
  "Science",
  "Technology",
  "History",
  "Business",
  "Marketing",
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export function CourseCatalog() {
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery<CourseResponse, Error>({
    queryKey: ["courses"],
    queryFn: getAllCourses,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("popularity");

  // Filter courses based on search query, category, and level
  const filteredCourses =
    coursesData?.courses?.filter((course: Course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "All Levels" || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    }) ?? [];

  // Sort courses based on selected criteria
  const sortedCourses = [...filteredCourses].sort((a: Course, b: Course) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "students":
        return (b.students?.length || 0) - (a.students?.length || 0);
      case "newest":
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      default: // popularity
        return (
          (b.rating || 0) * (b.students?.length || 0) -
          (a.rating || 0) * (a.students?.length || 0)
        );
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading courses: {error.message}
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground">
          Browse our wide range of courses and find the perfect one for your
          learning journey.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="students">Most Students</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedCourses.map((course: Course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <div className="mt-8 text-center">
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const defaultImage = `https://source.unsplash.com/800x400/?${encodeURIComponent(
    course.category.toLowerCase()
  )}`;

  console.log(course.image);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full relative">
        <Image
          src={course.image || defaultImage}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            *
            <CardTitle className="line-clamp-1 text-lg">
              {course.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Star className="mr-1 h-4 w-4" />
            {course.rating}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            {course.students.length} students
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {course.duration}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* <span className="text-lg font-bold">${course.price}</span> */}
          <Button asChild>
            <a href={`/courses/${course._id}`}>View Course</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
