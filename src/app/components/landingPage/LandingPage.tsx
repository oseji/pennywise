import NavBar from "./Navbar";
import HeroSection from "./HeroSection";
import WhatWeOffer from "./WhatWeOffer";
import KeepTrackOfTransactions from "./KeepTrackOfTransactions";
import HowToSetUp from "./HowToSetUp";
import ContactUs from "./ContactUs";

import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <WhatWeOffer />
      <KeepTrackOfTransactions />
      <HowToSetUp />
      <ContactUs />

      <Footer />
    </div>
  );
};

export default LandingPage;
