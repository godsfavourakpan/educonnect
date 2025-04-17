/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Search,
  SortAsc,
  XCircle,
} from "lucide-react";

// Mock data for assignments
const assignments = [
  {
    id: "1",
    title: "Introduction to Algebra",
    course: "Mathematics 101",
    dueDate: "2025-03-25T23:59:59",
    status: "pending",
    priority: "high",
    type: "quiz",
  },
  {
    id: "2",
    title: "Essay on Modern Literature",
    course: "English Literature",
    dueDate: "2025-03-20T23:59:59",
    status: "completed",
    priority: "medium",
    type: "essay",
  },
  {
    id: "3",
    title: "Physics Lab Report",
    course: "Physics 202",
    dueDate: "2025-04-05T23:59:59",
    status: "upcoming",
    priority: "medium",
    type: "report",
  },
  {
    id: "4",
    title: "Programming Assignment: Algorithms",
    course: "Computer Science 301",
    dueDate: "2025-03-18T23:59:59",
    status: "pending",
    priority: "high",
    type: "project",
  },
  {
    id: "5",
    title: "Chemistry Experiment Analysis",
    course: "Chemistry 201",
    dueDate: "2025-03-30T23:59:59",
    status: "upcoming",
    priority: "low",
    type: "report",
  },
];

export function AssignmentNavigation() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Filter assignments based on search query, tab, and filters
  const filteredAssignments = assignments.filter((assignment) => {
    // Search filter
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    const matchesTab = activeTab === "all" || activeTab === assignment.status;

    // Priority filter
    const matchesPriority =
      filterPriority === "all" || filterPriority === assignment.priority;

    // Type filter
    const matchesType = filterType === "all" || filterType === assignment.type;

    return matchesSearch && matchesTab && matchesPriority && matchesType;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "course") {
      return a.course.localeCompare(b.course);
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      );
    }
    return 0;
  });

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays < 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due on ${date.toLocaleDateString()}`;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          >
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            <Calendar className="mr-1 h-3 w-3" /> Upcoming
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <XCircle className="mr-1 h-3 w-3" /> Unknown
          </Badge>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>View and manage your assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assignments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="mr-2 h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("dueDate")}>
                      Due Date {sortBy === "dueDate" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")}>
                      Title {sortBy === "title" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("course")}>
                      Course {sortBy === "course" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("priority")}>
                      Priority {sortBy === "priority" && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                      All {filterPriority === "all" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                      High {filterPriority === "high" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("medium")}
                    >
                      Medium {filterPriority === "medium" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                      Low {filterPriority === "low" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Type</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilterType("all")}>
                      All {filterType === "all" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("quiz")}>
                      Quiz {filterType === "quiz" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("essay")}>
                      Essay {filterType === "essay" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("report")}>
                      Report {filterType === "report" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("project")}>
                      Project {filterType === "project" && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {renderAssignmentList(sortedAssignments)}
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                {renderAssignmentList(sortedAssignments)}
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                {renderAssignmentList(sortedAssignments)}
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                {renderAssignmentList(sortedAssignments)}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderAssignmentList(assignments: typeof filteredAssignments) {
    if (assignments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <XCircle className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No assignments found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Link
            key={assignment.id}
            href={`/assignments/${assignment.id}`}
            className="block"
          >
            <Card className="transition-all hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription>{assignment.course}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {getPriorityBadge(assignment.priority)}
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-2">
                <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Type:{" "}
                    {assignment.type.charAt(0).toUpperCase() +
                      assignment.type.slice(1)}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      new Date(assignment.dueDate) < new Date() &&
                        assignment.status !== "completed"
                        ? "text-red-500"
                        : ""
                    )}
                  >
                    {formatDueDate(assignment.dueDate)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  }
}
