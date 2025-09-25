import ButtonLink from "../../ui/ButtonLink";
import img1 from "../../assets/images/Hero-Section-image.png";
export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Decorative gradient blob (optional, adds modern feel) */}
      {/* <div className="absolute inset-0 -z-10">
				<div className="absolute top-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-[#2E90EB]/10 blur-3xl" />
				<div className="absolute bottom-[-15%] right-[-20%] w-[350px] h-[350px] rounded-full bg-[#134848]/10 blur-3xl" />
			</div> */}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:pt-20 pb-28 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="text-[#134848]">Find the Right</span>{" "}
            <span className="bg-gradient-to-r from-[#134848] to-[#2E90EB] bg-clip-text text-transparent">
              Talent
            </span>{" "}
            for Your Next Project
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Connect with <span className="font-semibold text-[#134848]">skilled freelancers</span>
            and <span className="font-semibold text-[#2E90EB]">clients worldwide</span>. Build,
            collaborate, and grow your career with ease in a modern, trusted marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <ButtonLink
              to="/signup"
              variant="primary"
              className="px-6 py-3 text-lg shadow-md hover:scale-105 transition-transform"
            >
              🚀 Get Started
            </ButtonLink>
            <ButtonLink
              to="/jobs"
              variant="outline"
              className="px-6 py-3 text-lg hover:bg-[#2E90EB]/10 transition"
            >
              🔎 Explore Jobs
            </ButtonLink>
          </div>

          {/* Social proof / mini stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                alt="check"
                className="w-5 h-5"
              />
              <span>Trusted by 10,000+ clients</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
                alt="star"
                className="w-5 h-5"
              />
              <span>4.9/5 average rating</span>
            </div>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 flex justify-center lg:justify-end relative">
          <img
            src={img1}
            alt="Freelance collaboration"
            className="w-full max-w-md  hover:scale-105 transition-transform  "
          />
        </div>
      </div>
    </section>
  );
}
