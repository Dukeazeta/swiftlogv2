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
    <div className="min-h-[100dvh] bg-cloud-gray py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-subtle-border rounded-xl shadow-whisper p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-expo-black rounded-[14px] flex items-center justify-center shadow-whisper">
                <span className="text-white font-bold text-2xl tracking-tighter">S</span>
              </div>
            </div>
            <h1 className="text-[24px] font-display font-bold tracking-tight text-expo-black mb-2">Complete Your Profile</h1>
            <p className="text-[15px] text-slate-gray font-medium">
              Help us personalize your logbook experience
            </p>
          </div>
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className="p-3 text-[14px] font-medium text-near-black bg-[#fff0f0] border border-[#eb8e90] rounded-[6px]">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-expo-black border-b border-subtle-border pb-2">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[14px] text-near-black">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-[13px] text-[#eb8e90]">{errors.fullName.message}</p>
                  )}
                </div>
              </div>

              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-expo-black border-b border-subtle-border pb-2">School Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-[14px] text-near-black">School Name</Label>
                    <Input
                      id="schoolName"
                      placeholder="e.g., University of Lagos"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("schoolName")}
                    />
                    {errors.schoolName && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.schoolName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolDepartment" className="text-[14px] text-near-black">Department</Label>
                    <Input
                      id="schoolDepartment"
                      placeholder="e.g., Computer Science"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("schoolDepartment")}
                    />
                    {errors.schoolDepartment && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.schoolDepartment.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-expo-black border-b border-subtle-border pb-2">Company Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-[14px] text-near-black">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Tech Solutions Ltd"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("companyName")}
                    />
                    {errors.companyName && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDepartment" className="text-[14px] text-near-black">Department/Field</Label>
                    <Input
                      id="companyDepartment"
                      placeholder="e.g., Software Development"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("companyDepartment")}
                    />
                    {errors.companyDepartment && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.companyDepartment.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobRole" className="text-[14px] text-near-black">Job Description/Role</Label>
                  <Textarea
                    id="jobRole"
                    placeholder="Describe your role and responsibilities..."
                    rows={3}
                    className="resize-none rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                    {...register("jobRole")}
                  />
                  {errors.jobRole && (
                    <p className="text-[13px] text-[#eb8e90]">{errors.jobRole.message}</p>
                  )}
                </div>
              </div>

              {/* SIWES Duration */}
              <div className="space-y-4">
                <h3 className="text-[18px] font-semibold text-expo-black border-b border-subtle-border pb-2">SIWES Duration</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-[14px] text-near-black">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("startDate")}
                    />
                    {errors.startDate && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-[14px] text-near-black">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="rounded-[6px] border-input-border focus-visible:ring-link-cobalt text-[14px]"
                      {...register("endDate")}
                    />
                    {errors.endDate && (
                      <p className="text-[13px] text-[#eb8e90]">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-subtle-border">
                <Button 
                  type="submit" 
                  className="w-full bg-expo-black text-white hover:bg-near-black rounded-[9999px] py-6 text-[16px] font-medium transition-all active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
