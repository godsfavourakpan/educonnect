"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  Clock,
  Filter,
  MapPin,
  Search,
  SortAsc,
  Star,
} from "lucide-react";

// Mock data for job opportunities
const jobOpportunities = [
  {
    id: "1",
    title: "Junior Software Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA (Remote)",
    type: "Full-time",
    category: "Software Development",
    salary: "$70,000 - $90,000",
    posted: "2 days ago",
    deadline: "2025-04-15",
    skills: ["JavaScript", "React", "Node.js"],
    description:
      "We are looking for a Junior Software Developer to join our growing team. You will be responsible for developing and maintaining web applications using JavaScript, React, and Node.js.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "1-2 years of experience with JavaScript and React",
      "Knowledge of Node.js and Express",
      "Familiarity with Git and version control",
    ],
    featured: true,
  },
  {
    id: "2",
    title: "Data Analyst Intern",
    company: "Analytics Pro",
    location: "New York, NY (On-site)",
    type: "Internship",
    category: "Data Science",
    salary: "$25/hour",
    posted: "1 week ago",
    deadline: "2025-03-30",
    skills: ["SQL", "Python", "Excel"],
    description:
      "Join our data team as an intern and gain hands-on experience with real-world data analysis projects. You will work with our senior analysts to extract insights from data and present findings to stakeholders.",
    requirements: [
      "Currently pursuing a degree in Statistics, Mathematics, Computer Science, or related field",
      "Knowledge of SQL and Python",
      "Strong analytical and problem-solving skills",
      "Excellent communication skills",
    ],
    featured: false,
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "Creative Designs Inc.",
    location: "Austin, TX (Hybrid)",
    type: "Contract",
    category: "Design",
    salary: "$50/hour",
    posted: "3 days ago",
    deadline: "2025-04-10",
    skills: ["Figma", "Adobe XD", "Sketch"],
    description:
      "We are seeking a talented UX/UI Designer to create engaging and intuitive user experiences for our digital products. You will work closely with product managers and developers to design user-centered interfaces.",
    requirements: [
      "3+ years of experience in UX/UI design",
      "Proficiency with design tools such as Figma, Adobe XD, or Sketch",
      "Strong portfolio demonstrating user-centered design process",
      "Experience with user research and usability testing",
    ],
    featured: true,
  },
  {
    id: "4",
    title: "Marketing Coordinator",
    company: "Global Brands Inc.",
    location: "Chicago, IL (On-site)",
    type: "Full-time",
    category: "Marketing",
    salary: "$50,000 - $60,000",
    posted: "5 days ago",
    deadline: "2025-04-05",
    skills: ["Social Media", "Content Creation", "Analytics"],
    description:
      "Join our marketing team to help coordinate and execute marketing campaigns across various channels. You will be responsible for social media management, content creation, and campaign analytics.",
    requirements: [
      "Bachelor's degree in Marketing, Communications, or related field",
      "1-2 years of experience in marketing or related role",
      "Strong written and verbal communication skills",
      "Experience with social media platforms and analytics tools",
    ],
    featured: false,
  },
  {
    id: "5",
    title: "Product Manager",
    company: "InnovateTech",
    location: "Seattle, WA (Remote)",
    type: "Full-time",
    category: "Product Management",
    salary: "$90,000 - $120,000",
    posted: "1 week ago",
    deadline: "2025-04-20",
    skills: ["Product Strategy", "Agile", "User Research"],
    description:
      "We are looking for a Product Manager to lead the development of our SaaS products. You will work with cross-functional teams to define product vision, strategy, and roadmap.",
    requirements: [
      "3+ years of experience in product management",
      "Experience with Agile development methodologies",
      "Strong analytical and problem-solving skills",
      "Excellent communication and leadership skills",
    ],
    featured: true,
  },
  {
    id: "6",
    title: "Financial Analyst",
    company: "Capital Investments",
    location: "Boston, MA (Hybrid)",
    type: "Full-time",
    category: "Finance",
    salary: "$65,000 - $80,000",
    posted: "2 weeks ago",
    deadline: "2025-03-25",
    skills: ["Financial Modeling", "Excel", "Data Analysis"],
    description:
      "Join our finance team to analyze financial data, create reports, and provide insights to support business decisions. You will work with various departments to gather and analyze financial information.",
    requirements: [
      "Bachelor's degree in Finance, Accounting, or related field",
      "1-3 years of experience in financial analysis",
      "Strong Excel and data analysis skills",
      "Knowledge of financial modeling and forecasting",
    ],
    featured: false,
  },
];

export function OpportunitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  // Filter opportunities based on search query and filters
  const filteredOpportunities = jobOpportunities.filter((job) => {
    // Search filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Type filter
    const matchesType =
      selectedType === "all" ||
      job.type.toLowerCase() === selectedType.toLowerCase();

    // Category filter
    const matchesCategory =
      selectedCategory === "all" ||
      job.category.toLowerCase() === selectedCategory.toLowerCase();

    // Location filter
    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "remote" &&
        job.location.toLowerCase().includes("remote")) ||
      (selectedLocation === "on-site" &&
        job.location.toLowerCase().includes("on-site")) ||
      (selectedLocation === "hybrid" &&
        job.location.toLowerCase().includes("hybrid"));

    // Featured filter
    const matchesFeatured = !showFeaturedOnly || job.featured;

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesLocation &&
      matchesFeatured
    );
  });

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === "recent") {
      // Sort by posted date (most recent first)
      return a.posted.includes("day") && b.posted.includes("week") ? -1 : 1;
    } else if (sortBy === "deadline") {
      // Sort by deadline (earliest first)
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else if (sortBy === "salary") {
      // Sort by salary (highest first)
      const aSalary = a.salary.includes("$")
        ? Number.parseInt(a.salary.replace(/[^0-9]/g, ""))
        : 0;
      const bSalary = b.salary.includes("$")
        ? Number.parseInt(b.salary.replace(/[^0-9]/g, ""))
        : 0;
      return bSalary - aSalary;
    }
    return 0;
  });

  // Get unique categories
  const categories = [...new Set(jobOpportunities.map((job) => job.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Opportunities</CardTitle>
          <CardDescription>
            Search and filter job opportunities based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs, skills, companies..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SortAsc className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={showFeaturedOnly}
                    onCheckedChange={(checked) =>
                      setShowFeaturedOnly(checked === true)
                    }
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured opportunities only
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedOpportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">
                No opportunities found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setShowFeaturedOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedOpportunities.map((job) => (
            <Card
              key={job.id}
              className={job.featured ? "border-2 border-primary" : ""}
            >
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      {job.featured && (
                        <Badge className="ml-2 bg-yellow-500">
                          <Star className="mr-1 h-3 w-3" /> Featured
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <Building2 className="mr-1 h-4 w-4" />
                      {job.company}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <MapPin className="mr-1 h-3 w-3" /> {job.location}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" /> {job.type}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" /> Deadline:{" "}
                      {new Date(job.deadline).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="mb-4">{job.description}</p>
                  <div className="mb-4">
                    <h4 className="font-medium">Requirements:</h4>
                    <ul className="ml-5 mt-2 list-disc space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-primary/10"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="text-sm">
                    <span className="font-medium">{job.salary}</span>
                    <span className="mx-2">•</span>
                    <span>Posted {job.posted}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href="#">Save</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/career/opportunities/${job.id}`}>
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More Opportunities</Button>
      </div>
    </div>
  );
}
