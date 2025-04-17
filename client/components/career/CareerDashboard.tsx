"use client";

import { useState } from "react";
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
import { ChevronRight, FileText } from "lucide-react";

export function CareerDashboard() {
  const [activeTab, setActiveTab] = useState("resume");

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="resume"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="resume">Resume Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Resume Builder
                </CardTitle>
                <CardDescription>
                  Create and manage your professional resume
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-2 font-medium">Create Your Resume</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Build a professional resume with our easy-to-use templates
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/career/resume-builder">
                    Build Your Resume
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
