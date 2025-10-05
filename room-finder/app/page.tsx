"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Building2, Accessibility, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/pictures/alligator.svg"
              alt="alligator logo"
              width={30}
              height={30}
              priority
            />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => router.push("/navigate")}
            >
              Navigate
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => router.push("/admin")}
            >
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* gradient bg + subtle grid */}
        <div className="relative isolate bg-gradient-to-br from-primary via-primary/80 to-accent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white/15_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[#FDFDF5]" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl text-center text-white">
              <div className="mb-6 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <Navigation className="h-4 w-4" />
                  Smart Campus Navigation
                </div>
              </div>

              {/* <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                Find Any Room. Instantly.
              </h1> */}
              <img src="/pictures/Hero.svg"></img>
              <p className="mt-4 text-lg text-white/90 md:text-xl">
                Seamlessly navigate buildings, classrooms, and offices anywhere with real-time indoor mapping and search.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {/* Start Navigating button */}
                <button
                  type="button"
                  onClick={() => router.push("/navigate")}
                  className="transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <Image
                    src="/pictures/StartButtons.svg"
                    alt="Start Navigating"
                    width={150}
                    height={50}
                    className="h-auto w-[150px] sm:w-[240px]"
                    priority
                  />
                </button>

                {/* Admin Dashboard button */}
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <Image
                    src="/pictures/BusinessButtons.svg"
                    alt="Admin Dashboard"
                    width={150}
                    height={50}
                    className="h-auto w-[150px] sm:w-[240px]"
                    priority
                  />
                </button>
              </div>

            </div>

            {/* Decorative logo mark in hero (optional, faint) */}
            <div className="pointer-events-none absolute -right-10 bottom-[-80px] hidden opacity-15 sm:block">

            </div>
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Explore the Campus Map</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Search buildings, view directions, and plan routes across all campuses — powered by interactive indoor maps.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border bg-background shadow-lg">
            <div className="relative aspect-[16/9] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.626571585565!2d-122.9198830241529!3d49.278093771389834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486771c7e46a5d7%3A0x2a49f1f1d4de084!2sSimon%20Fraser%20University!5e0!3m2!1sen!2sca!4v1696271360974!5m2!1sen!2sca"
                allowFullScreen
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-10 text-center">
          <h2 className="text-3xl font-bold">Why Use RoomiGator?</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Your campus companion for fast, accurate, and accessible navigation.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <MapPin className="h-8 w-8 text-primary" />,
                title: "Room Search",
                desc: "Instantly find any room, classroom, or office by number or name.",
              },
              {
                icon: <Building2 className="h-8 w-8 text-primary" />,
                title: "Multi-Building Support",
                desc: "Navigate across all indoor buildings in Vancouver!",
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
              <Card
                key={i}
                className="border border-border/60 transition hover:shadow-md"
              >
                <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
                  {feature.icon}
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#3F95B2] from-primary/90 via-primary to-accent px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-4xl font-bold">Ready to Explore?</h2>
          <p className="text-lg text-white/90">
            Discover every corner of Vancouver with real-time indoor navigation.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary shadow-lg hover:bg-white/90"
            onClick={() => router.push("/navigate")}
          >
            Start Navigating
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RoomFinder by Elaine Chen, Jasper He, Karen Agustino, and Simarjot Singh. Built with Next.js, Tailwind, and shadcn/ui.
      </footer>
    </main>
  );
}
