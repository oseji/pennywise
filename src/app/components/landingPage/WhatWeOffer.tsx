import Image from "next/image";

import financialStability from "../../../assets/landingPageIcons/financial stability.svg";
import smartBudgeting from "../../../assets/landingPageIcons/smart budgeting.svg";
import insightfulAnalytics from "../../../assets/landingPageIcons/insightful analytics.svg";

const WhatWeOffer = () => {
  return (
    <div className=" px-28 py-20">
      <h1 className=" sectionHeading">What We Offer</h1>

      <div className=" flex flex-row items-center justify-center gap-12">
        <div className=" whatWeOfferBox">
          <Image src={financialStability} alt="Financial Stability" />

          <div className=" whatWeOfferText">
            <h2 className=" text-2xl font-bold">Financial Stability</h2>
            <p className=" text-custom-gray">
              We are here to help you manage your finances more effectively and
              make informed decisions.
            </p>
          </div>
        </div>

        <div className=" whatWeOfferBox">
          <Image src={smartBudgeting} alt="Smart Budgeting" />

          <div className=" whatWeOfferText">
            <h2 className=" text-2xl font-bold">Smart Budgeting</h2>
            <p className=" text-custom-gray">
              We are here to help you manage your finances more effectively and
              make informed decisions.
            </p>
          </div>
        </div>

        <div className=" whatWeOfferBox">
          <Image src={insightfulAnalytics} alt="Insightful Analytics" />

          <div className=" whatWeOfferText">
            <h2 className=" text-2xl font-bold">Insightful Analytics</h2>
            <p className=" text-custom-gray">
              We are here to help you manage your finances more effectively and
              make informed decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWeOffer;
