"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, MapPin, Building2, Accessibility, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 text-center bg-gradient-to-br from-primary via-primary/80 to-accent">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            <Navigation className="h-4 w-4" />
            Smart Campus Navigation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Find Any Room. Instantly.
          </h1>

          <p className="text-lg md:text-xl text-white/90">
            Seamlessly navigate buildings, classrooms, and offices at SFU with real-time indoor mapping and search.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => router.push("/navigate")}
            >
              Start Navigating
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
      </section>

      {/* Interactive Map Preview */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Explore the Campus Map</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search buildings, view directions, and plan routes across all SFU campuses — powered by interactive indoor maps.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-lg mt-10 border bg-background">
            <div className="relative aspect-[16/9] w-full">
              {/* Placeholder for Google Maps integration */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.626571585565!2d-122.9198830241529!3d49.278093771389834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486771c7e46a5d7%3A0x2a49f1f1d4de084!2sSimon%20Fraser%20University!5e0!3m2!1sen!2sca!4v1696271360974!5m2!1sen!2sca"
                allowFullScreen
                loading="lazy"
                className="w-full h-full border-0"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-bold">Why Use RoomFinder?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your campus companion for fast, accurate, and accessible navigation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin className="h-8 w-8 text-primary" />,
                title: "Room Search",
                desc: "Instantly find any room, classroom, or office by number or name.",
              },
              {
                icon: <Building2 className="h-8 w-8 text-primary" />,
                title: "Multi-Building Support",
                desc: "Navigate across all SFU campuses — Burnaby, Surrey, and Vancouver.",
              },
              {
                icon: <Accessibility className="h-8 w-8 text-primary" />,
                title: "Accessibility Routes",
                desc: "Find wheelchair-accessible paths, elevators, and ramps easily.",
              },
              {
                icon: <Settings className="h-8 w-8 text-primary" />,
                title: "Admin Tools",
                desc: "Easily update building maps and room data through a clean admin panel.",
              },
            ].map((feature, i) => (
              <Card key={i} className="border border-border/60 hover:shadow-md transition">
                <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
                  {feature.icon}
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/90 via-primary to-accent text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Explore?</h2>
          <p className="text-lg text-white/90">
            Discover every corner of SFU with real-time indoor navigation.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg"
            onClick={() => router.push("/navigate")}
          >
            Start Navigating
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RoomFinder by Simar Singh. Built with Next.js, Tailwind, and shadcn/ui.
      </footer>
    </main>
  );
}
