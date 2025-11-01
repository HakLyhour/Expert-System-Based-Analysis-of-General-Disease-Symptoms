import React from "react";
import Navbar from "../components/NavBar";
import HomePage from "./HomePage/HomePage";
import AboutPage from "./AboutAI/AboutAIPage";
import PrivacyPage from "./PrivacyPage/PrivacyPage";
import AboutUs from "./AboutUs/AboutUsPage";
import WelcomePage from "./WelcomePage/WelcomePage";

export default function Home(){
  return(
    <div className="min-h-screen bg-[#EEF6FE] font-sans text-black relative dark:bg-gray-900 dark:text-white">
      <Navbar />
      <section id="home">
        <WelcomePage />
      </section>
      <section id="purpose">
        <AboutPage />
      </section>
      <section id="privacy">
        <PrivacyPage />
      </section>
      <section id="about">
        < AboutUs/>
      </section>
    </div>
  );
}