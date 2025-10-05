"use client";

import { Button } from "@/components/ui/button";
import { Navigation, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent py-24 px-4">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

      <div className="container relative z-10 mx-auto">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
            <Navigation className="h-4 w-4" />
            Indoor Navigation System
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Never Get Lost in Large Buildings Again
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/90 leading-relaxed">
            Advanced indoor navigation for universities and large facilities.
            Find any room with real-time wayfinding and interactive floor maps.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg transition"
              onClick={() => router.push("/navigate")}
            >
              Start Navigating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              onClick={() => router.push("/admin")}
            >
              Admin Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
