/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Check,
  Download,
  Plus,
  Save,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const resumeTemplates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with a focus on readability",
    preview: "/placeholder.svg?height=200&width=150",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional layout ideal for corporate and formal settings",
    preview: "/placeholder.svg?height=200&width=150",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design for creative fields and standing out",
    preview: "/placeholder.svg?height=200&width=150",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design with focus on content",
    preview: "/placeholder.svg?height=200&width=150",
  },
];

const initialResumeData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  templateId: "modern",
};

const validateResumeData = (resumeData: any) => {
  const errors = [];

  // Validate personal info
  if (!resumeData.personalInfo.name.trim()) {
    errors.push("Name is required");
  }

  if (!resumeData.personalInfo.email.trim()) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resumeData.personalInfo.email)) {
      errors.push("Please enter a valid email address");
    }
  }

  // Validate experience entries if any exist
  if (resumeData.experience.length > 0) {
    resumeData.experience.forEach((exp: any, index: number) => {
      if (!exp.company?.trim()) {
        errors.push(`Experience ${index + 1}: Company name is required`);
      }
      if (!exp.title?.trim()) {
        errors.push(`Experience ${index + 1}: Job title is required`);
      }
      if (!exp.startDate?.trim()) {
        errors.push(`Experience ${index + 1}: Start date is required`);
      }
    });
  }

  // Validate education entries if any exist
  if (resumeData.education.length > 0) {
    resumeData.education.forEach((edu: any, index: number) => {
      if (!edu.institution?.trim()) {
        errors.push(`Education ${index + 1}: Institution is required`);
      }
      if (!edu.degree?.trim()) {
        errors.push(`Education ${index + 1}: Degree is required`);
      }
      if (!edu.startDate?.trim()) {
        errors.push(`Education ${index + 1}: Start date is required`);
      }
    });
  }

  return errors;
};

const commonTechSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby",
  "Ruby on Rails",
  "HTML",
  "CSS",
  "SASS/SCSS",
  "TailwindCSS",
  "Bootstrap",
  "MaterialUI",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQL Server",
  "Oracle",
  "Firebase",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "GitLab",
  "CI/CD",
  "RESTful APIs",
  "GraphQL",
  "Jest",
  "Mocha",
  "Chai",
  "Cypress",
  "Selenium",
  "Redux",
  "Webpack",
  "Babel",
  "Next.js",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "Golang",
  "Rust",
  "Data Structures",
  "Algorithms",
  "System Design",
  "Object-Oriented Programming",
  "Functional Programming",
  "Agile Methodologies",
  "Scrum",
  "Jira",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Sketch",
];

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function getSectionDefaults(section: string) {
  switch (section) {
    case "education":
      return {
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
      };
    case "experience":
      return {
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        current: false,
      };
    case "skills":
      return { name: "", level: "beginner" };
    case "projects":
      return { title: "", description: "", link: "", technologies: [] };
    case "certifications":
      return { name: "", issuer: "", date: "", link: "" };
    default:
      return {};
  }
}

function PersonalInfoSection({ personalInfo, onChange }: any) {
  const validateField = (field: string, value: string) => {
    onChange(field, value);

    // Add validation for required fields
    if (field === "name" && !value.trim()) {
      toast.error("Name is required");
      return false;
    }

    // Email validation
    if (field === "email") {
      if (!value.trim()) {
        toast.error("Email is required");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }

    // Phone validation (optional but validate format if provided)
    if (field === "phone" && value.trim()) {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{8,20}$/;
      if (!phoneRegex.test(value)) {
        toast.error("Please enter a valid phone number");
        return false;
      }
    }

    // Website validation (optional but validate format if provided)
    if (field === "website" && value.trim()) {
      try {
        new URL(value);
      } catch (e) {
        toast.error(
          "Please enter a valid website URL (include http:// or https://)"
        );
        return false;
      }
    }

    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={personalInfo.name}
                onChange={(e) => validateField("name", e.target.value)}
                placeholder="John Doe"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={personalInfo.title}
                onChange={(e) => onChange("title", e.target.value)}
                placeholder="Frontend Developer"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => validateField("email", e.target.value)}
                placeholder="john.doe@example.com"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => validateField("phone", e.target.value)}
                placeholder="+1 234 567 890"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={personalInfo.location}
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Website or LinkedIn</Label>
              <Input
                id="website"
                value={personalInfo.website}
                onChange={(e) => validateField("website", e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={personalInfo.summary}
              onChange={(e) => onChange("summary", e.target.value)}
              placeholder="A brief summary of your professional background and career objectives"
              className="mt-1"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummarySection({
  summary,
  onChange,
}: {
  summary: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
        <CardDescription>
          Write a brief summary of your professional background and goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-[100px]"
          value={summary}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Keep your summary concise (2-4 sentences) and focused on your key
          strengths and career objectives.
        </p>
      </CardContent>
    </Card>
  );
}

function DynamicSection({
  title,
  description,
  items,
  onAdd,
  // onRemove,
  renderItem,
}: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add {title}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {items.map((item: any, index: number) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4">
                {item.title || item.institution || `${title} ${index + 1}`}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {renderItem(item)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 font-medium">No {title} Added</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the Add {title} button to add your {title.toLowerCase()}
            </p>
            <Button onClick={onAdd} className="mt-4" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add {title}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EducationItem({ item, onChange, onRemove }: any) {
  const validateSection = (section: any, field: string, value: string) => {
    onChange(section, field, value);

    // Add basic validation
    const fieldsToValidate = {
      institution: "Institution name is required",
      degree: "Degree is required",
      fieldOfStudy: "Field of study is required",
      startDate: "Start date is required",
    };

    if (field in fieldsToValidate && !value.trim()) {
      toast.error(fieldsToValidate[field as keyof typeof fieldsToValidate]);
      return false;
    }

    return true;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor={`institution-${item.id}`}>Institution</Label>
        <Input
          id={`institution-${item.id}`}
          value={item.institution}
          onChange={(e) =>
            validateSection(item.id, "institution", e.target.value)
          }
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`degree-${item.id}`}>Degree</Label>
        <Input
          id={`degree-${item.id}`}
          value={item.degree}
          onChange={(e) => validateSection(item.id, "degree", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`startDate-${item.id}`}>Start Date</Label>
        <Input
          id={`startDate-${item.id}`}
          type="month"
          value={item.startDate}
          onChange={(e) =>
            validateSection(item.id, "startDate", e.target.value)
          }
        />
      </div>
      <div>
        <Label htmlFor={`endDate-${item.id}`}>End Date</Label>
        <Input
          id={`endDate-${item.id}`}
          type="month"
          value={item.endDate}
          onChange={(e) => {
            if (item.current) {
              return;
            }
            onChange(item.id, "endDate", e.target.value);
          }}
          disabled={item.current}
        />
      </div>
      <div className="flex items-center space-x-2 sm:col-span-2">
        <Checkbox
          id={`current-${item.id}`}
          checked={item.current}
          onCheckedChange={(checked) => {
            const isChecked = Boolean(checked);
            onChange(item.id, "current", isChecked);
            if (isChecked) {
              onChange(item.id, "endDate", "Present");
            } else if (item.endDate === "Present") {
              onChange(item.id, "endDate", "");
            }
          }}
        />
        <Label htmlFor={`current-${item.id}`} className="text-sm font-normal">
          I currently study here
        </Label>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`description-${item.id}`}>Description</Label>
        <Textarea
          id={`description-${item.id}`}
          value={item.description}
          onChange={(e) => onChange(item.id, "description", e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex items-center sm:col-span-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function ExperienceItem({ item, onChange, onRemove }: any) {
  const validateSection = (section: any, field: string, value: string) => {
    onChange(section, field, value);

    // Add basic validation
    const fieldsToValidate = {
      company: "Company name is required",
      position: "Position is required",
      startDate: "Start date is required",
      location: "Location is required",
    };

    if (field in fieldsToValidate && !value.trim()) {
      toast.error(fieldsToValidate[field as keyof typeof fieldsToValidate]);
      return false;
    }

    return true;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`title-${item.id}`}>Job Title</Label>
        <Input
          id={`title-${item.id}`}
          value={item.title}
          onChange={(e) => validateSection(item.id, "title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`company-${item.id}`}>Company</Label>
        <Input
          id={`company-${item.id}`}
          value={item.company}
          onChange={(e) => validateSection(item.id, "company", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`startDate-${item.id}`}>Start Date</Label>
        <Input
          id={`startDate-${item.id}`}
          type="month"
          value={item.startDate}
          onChange={(e) =>
            validateSection(item.id, "startDate", e.target.value)
          }
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`endDate-${item.id}`}>End Date</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id={`current-${item.id}`}
              checked={item.current}
              onCheckedChange={(checked) =>
                onChange(item.id, "current", checked)
              }
            />
            <Label htmlFor={`current-${item.id}`} className="text-sm">
              Current Position
            </Label>
          </div>
        </div>
        <Input
          id={`endDate-${item.id}`}
          type="month"
          value={item.endDate}
          onChange={(e) => {
            if (item.current) {
              return;
            }
            onChange(item.id, "endDate", e.target.value);
          }}
          disabled={item.current}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`location-${item.id}`}>Location</Label>
        <Input
          id={`location-${item.id}`}
          value={item.location}
          onChange={(e) => validateSection(item.id, "location", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor={`description-${item.id}`}>Description</Label>
        <Textarea
          id={`description-${item.id}`}
          value={item.description}
          onChange={(e) => onChange(item.id, "description", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Describe your responsibilities and achievements. Use bullet points for
          better readability.
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function SkillsSection({ skills, onAdd, onChange, onRemove }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = commonTechSkills
    .filter(
      (skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !skills.some((s: any) => s.name.toLowerCase() === skill.toLowerCase())
    )
    .slice(0, 5);

  const handleAddSkill = (skill: string, level = "intermediate") => {
    if (!skill.trim()) return;

    // Check if skill already exists
    if (skills.some((s: any) => s.name.toLowerCase() === skill.toLowerCase())) {
      toast.error("This skill is already in your resume");
      return;
    }

    onAdd();
    // Set the new skill's name and level
    setTimeout(() => {
      onChange(`skills${skills.length + 1}`, "name", skill);
      onChange(`skills${skills.length + 1}`, "level", level);
    }, 0);
    setSearchTerm("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add your technical and soft skills
            </CardDescription>
          </div>
          <div className="relative">
            <div className="flex">
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search skills..."
                className="mr-2"
              />
              <Button
                onClick={() => {
                  handleAddSkill(searchTerm);
                  setShowSuggestions(false);
                }}
                disabled={!searchTerm.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showSuggestions &&
              searchTerm &&
              filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                  <ul className="py-1">
                    {filteredSuggestions.map((skill) => (
                      <li
                        key={skill}
                        className="cursor-pointer px-4 py-2 hover:bg-accent"
                        onClick={() => {
                          handleAddSkill(skill);
                          setShowSuggestions(false);
                        }}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill: any) => (
            <div key={skill.id} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  value={skill.name}
                  onChange={(e) => onChange(skill.id, "name", e.target.value)}
                  placeholder="Skill name"
                />
              </div>
              <Select
                value={skill.level}
                onValueChange={(value) => onChange(skill.id, "level", value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(skill.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {skills.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <h3 className="font-medium">No Skills Added</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Search and add skills using the search box above
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsSection({ projects, onAdd, onChange, onRemove }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Add your personal or academic projects
            </CardDescription>
          </div>
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {projects.map((project: any) => (
            <AccordionItem
              key={project.id}
              value={project.id}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4">
                {project.title || `Project ${projects.indexOf(project) + 1}`}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${project.id}`}>Project Title</Label>
                    <Input
                      id={`title-${project.id}`}
                      value={project.title}
                      onChange={(e) =>
                        onChange(project.id, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${project.id}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`description-${project.id}`}
                      value={project.description}
                      onChange={(e) =>
                        onChange(project.id, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`link-${project.id}`}>
                      Project Link (Optional)
                    </Label>
                    <Input
                      id={`link-${project.id}`}
                      value={project.link}
                      onChange={(e) =>
                        onChange(project.id, "link", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technologies Used</Label>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(
                        (tech: string, techIndex: number) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tech}
                            <button
                              onClick={() => {
                                const newTech = [...project.technologies];
                                newTech.splice(techIndex, 1);
                                onChange(project.id, "technologies", newTech);
                              }}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      )}
                      <div className="flex">
                        <Input
                          placeholder="Add technology"
                          className="h-8 w-32"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value) {
                              e.preventDefault();
                              const newTech = [
                                ...project.technologies,
                                e.currentTarget.value,
                              ];
                              onChange(project.id, "technologies", newTech);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(project.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <h3 className="font-medium">No Projects Added</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the Add Project button to add your projects
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CertificationItem({ item, onChange, onRemove }: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`name-${item.id}`}>Certification Name</Label>
        <Input
          id={`name-${item.id}`}
          value={item.name}
          onChange={(e) => onChange(item.id, "name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`issuer-${item.id}`}>Issuing Organization</Label>
        <Input
          id={`issuer-${item.id}`}
          value={item.issuer}
          onChange={(e) => onChange(item.id, "issuer", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`date-${item.id}`}>Date Issued</Label>
        <Input
          id={`date-${item.id}`}
          type="month"
          value={item.date}
          onChange={(e) => onChange(item.id, "date", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`link-${item.id}`}>Credential Link (Optional)</Label>
        <Input
          id={`link-${item.id}`}
          value={item.link}
          onChange={(e) => onChange(item.id, "link", e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
          <Trash2 className="mr-1 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function TemplateSelection({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Choose a Template</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resumeTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all",
              selected === template.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(template.id)}
          >
            <div className="aspect-[210/297] overflow-hidden rounded-t-lg bg-muted">
              <Image
                src={template.preview}
                alt={template.name}
                width={300}
                height={420}
                className="h-full w-full object-cover"
              />
            </div>
            <CardFooter className="flex items-center justify-between p-4">
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              {selected === template.id && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResumePreview({
  data,
  onBack,
  onSave,
  onDownload,
  targetRef,
  onClear,
}: any) {
  const { personalInfo, experience, education, skills, templateId } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resume Preview</h2>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack}>
            Edit Content
          </Button>
          <Button variant="outline" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="destructive" onClick={onClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Resume
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <div
            ref={targetRef}
            className="mx-auto max-w-[210mm] rounded-md bg-white p-12"
          >
            {/* Resume Header */}
            <div className="mb-6 border-b pb-6">
              <h1 className="text-3xl font-bold text-primary">
                {personalInfo.name || "Your Name"}
              </h1>
              {personalInfo.title && (
                <p className="mt-1 text-xl">{personalInfo.title}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {personalInfo.email && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Email:</span>{" "}
                    {personalInfo.email}
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Phone:</span>{" "}
                    {personalInfo.phone}
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Location:</span>{" "}
                    {personalInfo.location}
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Website:</span>{" "}
                    {personalInfo.website}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {personalInfo.summary && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-bold">Professional Summary</h2>
                <p>{personalInfo.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-bold">Work Experience</h2>
                <div className="space-y-4">
                  {experience.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-bold">
                          {exp.title || "Position Title"}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.endDate || "Present"}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">
                          {exp.company || "Company Name"}
                        </p>
                        {exp.location && (
                          <p className="text-sm">{exp.location}</p>
                        )}
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-bold">Education</h2>
                <div className="space-y-4">
                  {education.map((edu: any) => (
                    <div
                      key={edu.id}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-bold">{edu.degree || "Degree"}</h3>
                        <div className="text-sm text-muted-foreground">
                          {edu.startDate} - {edu.endDate || "Present"}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {edu.institution || "Institution Name"}
                      </p>
                      {edu.description && (
                        <p className="mt-2 text-sm">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                          {skill.level.charAt(0).toUpperCase() +
                            skill.level.slice(1)}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<string>("content");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
  const [resumeData, setResumeData] = useState<any>(initialResumeData);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Load saved resume data on component mount
  useEffect(() => {
    const savedResumeData = localStorage.getItem("savedResumeData");
    if (savedResumeData) {
      try {
        const parsedData = JSON.parse(savedResumeData);
        setResumeData(parsedData);
      } catch (error) {
        console.error("Error loading saved resume:", error);
      }
    }
  }, []);

  const handlePersonalInfo = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const addEducation = () => {
    const newId = `edu${resumeData.education.length + 1}`;
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: newId,
          institution: "",
          degree: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu: any) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu: any) => edu.id !== id),
    });
  };

  const addExperience = () => {
    const newId = `exp${resumeData.experience.length + 1}`;
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: newId,
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp: any) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp: any) => exp.id !== id),
    });
  };

  const addSkill = () => {
    const newId = `skills${resumeData.skills.length + 1}`;
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        {
          id: newId,
          name: "",
          level: "intermediate",
        },
      ],
    });
  };

  const updateSkill = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.map((skill: any) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    });
  };

  const removeSkill = (id: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((skill: any) => skill.id !== id),
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setResumeData({
      ...resumeData,
      templateId,
    });
  };

  const generatePDF = async () => {
    if (!resumeRef.current) return;

    try {
      toast.loading("Generating PDF...");

      const dataUrl = await toPng(resumeRef.current, { quality: 0.95 });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${resumeData.personalInfo.name || "resume"}.pdf`);

      toast.dismiss();
      toast.message("PDF Generated", {
        description: "Your resume has been generated and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleSaveResume = () => {
    try {
      localStorage.setItem("savedResumeData", JSON.stringify(resumeData));
      toast.message("Resume Saved", {
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume. Please try again.");
    }
  };

  const handleClearResume = () => {
    setResumeData(initialResumeData);
    toast.message("Resume Cleared", {
      description: "Your resume has been cleared.",
    });
  };

  const validateResumeBeforeDownload = () => {
    const errors = validateResumeData(resumeData);

    if (errors.length) {
      toast.error(`Please fix the following issues before downloading:`, {
        description: (
          <ul className="list-disc pl-5 mt-2">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        ),
      });
      return false;
    }

    return true;
  };

  const handleDownload = () => {
    if (validateResumeBeforeDownload()) {
      generatePDF();
    }
  };

  const sections = {
    personalInfo: (
      <PersonalInfoSection
        personalInfo={resumeData.personalInfo}
        onChange={handlePersonalInfo}
      />
    ),
    education: (
      <div className="space-y-6">
        {resumeData.education.map((item: any) => (
          <EducationItem
            key={item.id}
            item={item}
            onChange={updateEducation}
            onRemove={removeEducation}
          />
        ))}
        <Button onClick={addEducation}>
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>
    ),
    experience: (
      <div className="space-y-6">
        {resumeData.experience.map((item: any) => (
          <ExperienceItem
            key={item.id}
            item={item}
            onChange={updateExperience}
            onRemove={removeExperience}
          />
        ))}
        <Button onClick={addExperience}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>
    ),
    skills: (
      <SkillsSection
        skills={resumeData.skills}
        onAdd={addSkill}
        onChange={updateSkill}
        onRemove={removeSkill}
      />
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        heading="Resume Builder"
        subheading="Create a professional resume to showcase your skills and experience"
      />
      <Tabs
        defaultValue="content"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSaveResume}>
              <Save className="mr-2 h-4 w-4" />
              Save Resume
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <TabsContent value="content" className="space-y-6">
            <PersonalInfoSection
              personalInfo={resumeData.personalInfo}
              onChange={handlePersonalInfo}
            />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="education">
                <AccordionTrigger>Education</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 space-y-4">
                    {resumeData.education.map((item: any) => (
                      <EducationItem
                        key={item.id}
                        item={item}
                        onChange={updateEducation}
                        onRemove={removeEducation}
                      />
                    ))}
                    <Button onClick={addEducation}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="experience">
                <AccordionTrigger>Experience</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 space-y-4">
                    {resumeData.experience.map((item: any) => (
                      <ExperienceItem
                        key={item.id}
                        item={item}
                        onChange={updateExperience}
                        onRemove={removeExperience}
                      />
                    ))}
                    <Button onClick={addExperience}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skills">
                <AccordionTrigger>Skills</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4">
                    <SkillsSection
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onChange={updateSkill}
                      onRemove={removeSkill}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          <TabsContent value="templates">
            <TemplateSelection
              selected={resumeData.templateId}
              onSelect={handleTemplateChange}
            />
          </TabsContent>
          <TabsContent value="preview">
            <ResumePreview
              data={resumeData}
              onBack={() => setActiveTab("content")}
              onSave={handleSaveResume}
              onDownload={handleDownload}
              targetRef={resumeRef}
              onClear={handleClearResume}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
