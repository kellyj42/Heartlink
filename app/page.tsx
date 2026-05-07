import HeroSection from "./components/sections/HeroSection";
import Navbar from "./components/layouts/Navbar";
import HowItWorks from "./components/sections/HowItWorks";
import Features from "./components/sections/Features";
import Testimonials from "./components/sections/Testimonials";
import CTASection from "./components/sections/CTAsection";
import Footer from "./components/layouts/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
