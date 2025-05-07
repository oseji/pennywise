import NavBar from "./Navbar";
import HeroSection from "./HeroSection";
import WhatWeOffer from "./WhatWeOffer";
import KeepTrackOfTransactions from "./KeepTrackOfTransactions";
import HowToSetUp from "./HowToSetUp";

import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <WhatWeOffer />
      <KeepTrackOfTransactions />
      <HowToSetUp />

      <Footer />
    </div>
  );
};

export default LandingPage;
