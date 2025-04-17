import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Star,
  Users,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-black">EduConnect</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#"
              className="text-sm font-medium hover:text-amber-500 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-amber-500 transition-colors"
            >
              Tutors
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-amber-500 transition-colors"
            >
              Subjects
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-amber-500 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#"
              className="text-sm font-medium hover:text-amber-500 transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium hover:text-amber-500 transition-colors"
            >
              Log in
            </Link>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Get Started
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Academic Potential with Expert Tutors
                  </h1>
                  <p className="max-w-[600px] text-black md:text-xl">
                    Connect with qualified tutors who can help you excel in any
                    subject. Personalized learning, flexible scheduling, and
                    proven results.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    Find a Tutor
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-50"
                  >
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-white bg-orange-100 overflow-hidden"
                      >
                        <Image
                          src={
                            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          }
                          alt="User"
                          width={32}
                          height={32}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Join{" "}
                    <span className="font-bold text-amber-500">2,000+</span>{" "}
                    students already learning
                  </div>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="absolute -top-4 -left-4 h-72 w-72 bg-amber-200 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-4 -right-4 h-72 w-72 bg-orange-200 rounded-full blur-3xl opacity-30" />
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
                  <Image
                    src="https://images.unsplash.com/photo-1580894732930-0babd100d356?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Tutoring Session"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700">
                  Why Choose Us
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers comprehensive tools and resources to
                  enhance your learning experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              {[
                {
                  icon: <Users className="h-10 w-10 text-amber-500" />,
                  title: "Expert Tutors",
                  description:
                    "Connect with qualified tutors who specialize in your subject area.",
                },
                {
                  icon: <Calendar className="h-10 w-10 text-amber-500" />,
                  title: "Flexible Scheduling",
                  description:
                    "Book sessions at times that work for your busy schedule.",
                },
                {
                  icon: <MessageSquare className="h-10 w-10 text-amber-500" />,
                  title: "Interactive Sessions",
                  description:
                    "Engage in real-time video sessions with screen sharing and digital whiteboards.",
                },
                {
                  icon: <BookOpen className="h-10 w-10 text-amber-500" />,
                  title: "Personalized Learning",
                  description:
                    "Get customized lesson plans tailored to your learning style and goals.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-amber-500" />,
                  title: "Progress Tracking",
                  description:
                    "Monitor your improvement with detailed progress reports and feedback.",
                },
                {
                  icon: <Star className="h-10 w-10 text-amber-500" />,
                  title: "Guaranteed Results",
                  description:
                    "See improvement in your grades or get additional sessions at no cost.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="rounded-full bg-amber-50 p-3">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gradient-to-b from-white to-amber-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  What Our Students Say
                </h2>
                <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from students who have transformed their academic
                  performance with our tutors.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              {[
                {
                  quote:
                    "My grades improved from a C to an A- in just two months of tutoring. My tutor made complex calculus concepts easy to understand.",
                  name: "Alex Johnson",
                  role: "Calculus Student",
                },
                {
                  quote:
                    "The flexible scheduling allowed me to fit tutoring sessions around my busy sports schedule. My tutor was always patient and supportive.",
                  name: "Samantha Lee",
                  role: "Chemistry Student",
                },
                {
                  quote:
                    "I was struggling with essay writing until I found my English tutor here. Now I feel confident in my writing skills and have improved my GPA.",
                  name: "Michael Rodriguez",
                  role: "English Literature Student",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white p-6 shadow-sm border border-amber-100"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-amber-100 overflow-hidden">
                        <Image
                          src={
                            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          }
                          alt={testimonial.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tutor Showcase */}
        {/* <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700">
                  Our Tutors
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Meet Our Expert Tutors
                </h2>
                <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  All our tutors are thoroughly vetted and have proven track
                  records of student success.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Dr. Sarah Chen", subject: "Mathematics", rating: 4.9 },
                { name: "Prof. James Wilson", subject: "Physics", rating: 4.8 },
                { name: "Emma Thompson", subject: "English", rating: 5.0 },
                {
                  name: "David Patel",
                  subject: "Computer Science",
                  rating: 4.9,
                },
              ].map((tutor, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border border-amber-100 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <Image
                      src={`/placeholder.svg?height=300&width=300&text=${tutor.name}`}
                      alt={tutor.name}
                      width={300}
                      height={300}
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{tutor.name}</h3>
                    <p className="text-sm text-gray-600">{tutor.subject}</p>
                    <div className="mt-2 flex items-center">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="ml-1 text-sm font-medium">
                        {tutor.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                View All Tutors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Ready to Transform Your Academic Journey?
                  </h2>
                  <p className="max-w-[600px] opacity-90 md:text-xl/relaxed">
                    Join thousands of students who have improved their grades
                    and confidence through our tutoring platform.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-white text-amber-500 hover:bg-gray-100">
                    Get Started Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Schedule a Free Consultation
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Sign Up for a Free Session
                  </h3>
                  <form className="space-y-4">
                    <div className="grid gap-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium text-gray-700"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="What subject do you need help with?"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      Request Free Session
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-gray-300">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-bold text-white">EduConnect</span>
              </div>
              <p className="max-w-xs text-gray-400">
                Connecting students with expert tutors for personalized learning
                and academic success.
              </p>
              <div className="flex space-x-4">
                {["Twitter", "Facebook", "Instagram", "LinkedIn"].map(
                  (social) => (
                    <Link
                      key={social}
                      href="#"
                      className="hover:text-amber-500"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-xs">{social[0]}</span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {[
                  "Home",
                  "About Us",
                  "Find a Tutor",
                  "Become a Tutor",
                  "Pricing",
                  "Blog",
                ].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-amber-500 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Subjects</h3>
              <ul className="space-y-2">
                {[
                  "Mathematics",
                  "Science",
                  "English",
                  "History",
                  "Languages",
                  "Test Prep",
                  "Computer Science",
                ].map((subject) => (
                  <li key={subject}>
                    <Link
                      href="#"
                      className="hover:text-amber-500 transition-colors"
                    >
                      {subject}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Contact Us
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@tutorconnect.com</li>
                <li>Phone: (123) 456-7890</li>
                <li>Address: 123 Education St, Learning City, 12345</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} TutorConnect. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-amber-500"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-amber-500"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
