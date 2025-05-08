"use client";

import "./landingPage.css";
import NavBar from "./Navbar";
import HeroSection from "./HeroSection";
import WhatWeOffer from "./WhatWeOffer";
import KeepTrackOfTransactions from "./KeepTrackOfTransactions";
import HowToSetUp from "./HowToSetUp";
import ContactUs from "./ContactUs";
import Faq from "./Faq";

import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <WhatWeOffer />
      <KeepTrackOfTransactions />
      <HowToSetUp />
      <Faq />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default LandingPage;
