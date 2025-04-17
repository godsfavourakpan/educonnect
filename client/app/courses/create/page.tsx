"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createCourse } from "@/api/course";
import { useMutation } from "@tanstack/react-query";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  content: {
    videoUrl?: string;
    description: string;
  };
  resources: Array<{
    title: string;
    type: string;
    url: string;
  }>;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      router.push("/tutor-dashboard");
    },
    onError: (error) => {
      console.error("Failed to create course:", error);
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    level: "Beginner",
    duration: "",
    price: "",
    image: "",
    tags: "",
    requirements: "",
    lessons: [] as Lesson[],
    objectives: "",
    instructor: {
      title: "",
      bio: "",
    },
  });

  // State for the current lesson being added
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    id: Date.now().toString(),
    title: "",
    duration: "",

    type: "Video",
    content: {
      videoUrl: "",
      description: "",
    },
    resources: [],
  });

  // State for the current resource being added
  const [currentResource, setCurrentResource] = useState({
    title: "",
    type: "PDF",
    url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("instructor.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("content.")) {
      const field = name.split(".")[1];
      setCurrentLesson((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          [field]: value,
        },
      }));
    } else {
      setCurrentLesson((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResourceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentResource((prev) => ({ ...prev, [name]: value }));
  };

  const addResource = () => {
    if (currentResource.title && currentResource.url) {
      setCurrentLesson((prev) => ({
        ...prev,
        resources: [...prev.resources, { ...currentResource }],
      }));
      setCurrentResource({ title: "", type: "PDF", url: "" });
    }
  };

  const removeResource = (index: number) => {
    setCurrentLesson((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const addLesson = () => {
    if (currentLesson.title && currentLesson.duration) {
      const newLesson = {
        ...currentLesson,
        id: Date.now().toString(),
      };
      setFormData((prev) => ({
        ...prev,
        lessons: [...prev.lessons, newLesson],
      }));
      setCurrentLesson({
        id: "",
        title: "",
        duration: "",
        type: "Video",
        content: {
          videoUrl: "",
          description: "",
        },
        resources: [],
      });
    }
  };

  const removeLesson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const courseData = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        requirements: formData.requirements.split("\n").filter(Boolean),
        objectives: formData.objectives.split("\n").filter(Boolean),
        instructor: {
          ...formData.instructor,
          id: user?.id,
          name: user?.name,
          avatar: user?.avatar || "",
        },
        price: parseFloat(formData.price),
        modules: [],
        resources: [],
        progress: 0,
        completedLessons: [],
        nextLesson: formData.lessons[0]
          ? {
              id: formData.lessons[0].id,
              title: formData.lessons[0].title,
            }
          : { id: "", title: "" },
        enrolled: false,
      };

      await createCourseMutation.mutateAsync(courseData);
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full py-10">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/tutor-dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Course Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Marketing, Development, Design"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Brief overview of your course (1-2 sentences)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  required
                  placeholder="Comprehensive description of what students will learn"
                  className="h-32"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    name="level"
                    value={formData.level}
                    onValueChange={(value) =>
                      handleSelectChange("level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 6 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Instructor Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructor.title">Title</Label>
                  <Input
                    id="instructor.title"
                    name="instructor.title"
                    value={formData.instructor.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Digital Marketing Expert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor.bio">Bio</Label>
                  <Textarea
                    id="instructor.bio"
                    name="instructor.bio"
                    value={formData.instructor.bio}
                    onChange={handleChange}
                    required
                    placeholder="Brief professional background"
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Enter each requirement on a new line"
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  placeholder="Enter each objective on a new line"
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Course Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="URL to course cover image"
                />
              </div>
            </div>

            {/* Lessons Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Course Lessons</h3>

              {/* Add New Lesson Form */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="lessonTitle">Lesson Title</Label>
                      <Input
                        id="lessonTitle"
                        name="title"
                        value={currentLesson.title}
                        onChange={handleLessonChange}
                        placeholder="e.g., Introduction to SEO"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessonDuration">Duration</Label>
                      <Input
                        id="lessonDuration"
                        name="duration"
                        value={currentLesson.duration}
                        onChange={handleLessonChange}
                        placeholder="e.g., 30 mins"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonType">Lesson Type</Label>
                    <Select
                      value={currentLesson.type}
                      onValueChange={(value) =>
                        setCurrentLesson((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="content.videoUrl"
                      value={currentLesson.content.videoUrl}
                      onChange={handleLessonChange}
                      placeholder="e.g., https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonDescription">
                      Lesson Description
                    </Label>
                    <Textarea
                      id="lessonDescription"
                      name="content.description"
                      value={currentLesson.content.description}
                      onChange={handleLessonChange}
                      placeholder="Describe what will be covered in this lesson"
                    />
                  </div>

                  {/* Resources Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Lesson Resources</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="resourceTitle">Resource Title</Label>
                        <Input
                          id="resourceTitle"
                          name="title"
                          value={currentResource.title}
                          onChange={handleResourceChange}
                          placeholder="e.g., SEO Cheat Sheet"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resourceType">Type</Label>
                        <Select
                          value={currentResource.type}
                          onValueChange={(value) =>
                            setCurrentResource((prev) => ({
                              ...prev,
                              type: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="Link">Link</SelectItem>
                            <SelectItem value="File">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resourceUrl">Resource URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="resourceUrl"
                            name="url"
                            value={currentResource.url}
                            onChange={handleResourceChange}
                            placeholder="Resource URL"
                          />
                          <Button
                            type="button"
                            onClick={addResource}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            Add Resource
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Resource List */}
                    {currentLesson.resources.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium mb-2">
                          Added Resources:
                        </h5>
                        <ul className="space-y-2">
                          {currentLesson.resources.map((resource, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                            >
                              <span>
                                {resource.title} ({resource.type})
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeResource(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={addLesson}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Lessons List */}
              {formData.lessons.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Added Lessons:</h4>
                  <div className="space-y-2">
                    {formData.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between bg-secondary/50 p-4 rounded-md"
                      >
                        <div>
                          <h5 className="font-medium">{lesson.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            {lesson.duration} • {lesson.type}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating Course..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
