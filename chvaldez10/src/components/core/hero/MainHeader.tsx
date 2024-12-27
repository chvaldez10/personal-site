import React from "react";
import { FaGithub } from "react-icons/fa";

// Components
import { SocialButton } from "@/components/ui/buttons";
import { PdfDialogButton } from "@/components/ui/buttons";

// Styles
import styles from "./hero.module.css";

// Note: Depreciate this component once all components are migrated to AboutJumbotron

const MainHeader: React.FC = () => {
  return (
    <div
      className={`${styles.gradientBackground} h-screen flex flex-col justify-center items-center text-center space-y-4`}
    >
      {/* Header */}
      <h1
        className="text-4xl md:text-6xl font-extrabold text-white"
        style={{ textShadow: "0 0 10px rgba(104, 109, 118, 0.7)" }}
      >
        Hi, I&apos;m Christian
      </h1>

      {/* Subheader */}
      <h3
        className="text-xl md:text-2xl text-white"
        style={{ textShadow: "0 0 10px rgba(104, 109, 118, 0.7)" }}
      >
        Transforming Ideas into Solutions
      </h3>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* GitHub */}
        <SocialButton
          variant="outline"
          icon={<FaGithub />}
          href="https://github.com/chvaldez10"
        >
          GitHub
        </SocialButton>

        {/* Resume */}
        <PdfDialogButton
          pdfUrl="/Christian-Valdez_Resume.pdf"
          label="Resume"
          description="View my resume below."
        />
      </div>
    </div>
  );
};

export default MainHeader;
