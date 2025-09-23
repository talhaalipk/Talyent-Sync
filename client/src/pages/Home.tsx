import { CTASection } from "../components/home/CtaSection";
import HeroSection from "../components/home/HeroSection";
import CategoriesSection from "../components/home/CategoriesSection";
import { StatusSection } from "../components/home/StatusSection";

function Home() {
  return (
    <div>
      <HeroSection />
      <StatusSection />
      <CTASection />
      <CategoriesSection />
    </div>
  );
}

export default Home;
