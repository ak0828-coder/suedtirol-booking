"use client"

import { NextStepProvider, NextStep } from "nextstepjs"
import { adminOverviewTour, adminCoursesTour, memberDashboardTour } from "@/lib/tour-steps"

export function TourShell({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep steps={[...adminOverviewTour, ...adminCoursesTour, ...memberDashboardTour]}>
        {children}
      </NextStep>
    </NextStepProvider>
  )
}
