"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validations";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help us personalize your logbook experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>
              </div>

              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">School Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      placeholder="e.g., University of Lagos"
                      {...register("schoolName")}
                    />
                    {errors.schoolName && (
                      <p className="text-sm text-red-500">{errors.schoolName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolDepartment">Department</Label>
                    <Input
                      id="schoolDepartment"
                      placeholder="e.g., Computer Science"
                      {...register("schoolDepartment")}
                    />
                    {errors.schoolDepartment && (
                      <p className="text-sm text-red-500">{errors.schoolDepartment.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Tech Solutions Ltd"
                      {...register("companyName")}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500">{errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDepartment">Department/Field</Label>
                    <Input
                      id="companyDepartment"
                      placeholder="e.g., Software Development"
                      {...register("companyDepartment")}
                    />
                    {errors.companyDepartment && (
                      <p className="text-sm text-red-500">{errors.companyDepartment.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Description/Role</Label>
                  <Textarea
                    id="jobRole"
                    placeholder="Describe your role and responsibilities..."
                    rows={3}
                    {...register("jobRole")}
                  />
                  {errors.jobRole && (
                    <p className="text-sm text-red-500">{errors.jobRole.message}</p>
                  )}
                </div>
              </div>

              {/* SIWES Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SIWES Duration</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate")}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register("endDate")}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
