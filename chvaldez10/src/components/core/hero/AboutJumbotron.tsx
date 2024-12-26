// Original code from https://www.creative-tim.com/twcomponents/component/hero-section-1

import { RiFacebookFill } from "react-icons/ri";
import { SiBehance } from "react-icons/si";
import Image from "next/image";

import "@/styles/main-header.css";

const AboutJumbotron = () => {
  return (
    <div className="h-screen gradient-background flex flex-col justify-center items-center">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center md:gap-20">
        {/* Left side */}
        <div className="content">
          {/* top label */}
          <div className="flex items-center gap-3">
            <hr className="w-10 bg-orange-500 border" />
            <span className="md:text-[18px] font-medium text-gray-800">
              Product Engineer
            </span>
          </div>

          {/* Header */}
          <p className="text-[40px] lg:text-[45px] xl:text-[55px] font-bold leading-tight mt-5 sm:mt-0">
            I&apos;m Christian Valdez
          </p>

          {/* Subheader */}
          <p className="mt-5 md:text-md">
            I&apos;m a creative designer based in Calgary, Alberta, and I&apos;m
            very passionate and dedicated to my work. Your Satisfaction is my
            success
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-10">
            <button className="font-medium text-[16px] flex items-center px-5 py-3 md:py-4 md:px-8 rounded-xl capitalize bg-gradient-to-r from-orange-300 to-orange-500 hover:from-pink-500 hover:to-yellow-500 relative gap-2 transition duration-300 hover:scale-105 text-white shadow-glass">
              Get In Touch
              <span className="animate-ping absolute right-0 top-0 w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-700"></span>
            </button>
            <RiFacebookFill />
            <SiBehance />
          </div>
        </div>

        {/* Right side */}
        <div className="relative sm:mt-0 mt-10 px-6 sm:px-0">
          <Image
            className="w-[600px] animate__animated animate__fadeInRight animate__delay-.5s"
            src="https://images.unsplash.com/photo-1624628639856-100bf817fd35?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8M2QlMjBpbWFnZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60"
            width={600}
            height={600}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default AboutJumbotron;
