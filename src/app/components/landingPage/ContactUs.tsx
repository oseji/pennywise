"use client";
import Image from "next/image";
import tick from "../../../assets/landingPageIcons/tick icon.svg";

const ContactUs = () => {
  return (
    <div className="px-28 py-20">
      <h1 className=" sectionHeading">Contact us</h1>

      <div className=" flex flex-row items-start justify-between">
        <div className=" w-full lg:w-[40%]">
          <p className=" text-custom-gray mb-6">
            We know you have lots of questions. Don’t lose your time figuring
            everything out by yourself. Schedule a 1 on 1 meeting and have all
            your questions answered.
          </p>

          <div className=" flex flex-col gap-4">
            <div className=" flex flex-row items-center gap-2">
              <Image src={tick} alt="tick" />
              <p className=" text-custom-green">Listen to you and your goals</p>
            </div>
            <div className=" flex flex-row items-center gap-2">
              <Image src={tick} alt="tick" />
              <p className=" text-custom-green">Answer your questions</p>
            </div>
            <div className=" flex flex-row items-center gap-2">
              <Image src={tick} alt="tick" />
              <p className=" text-custom-green">Evaluate your needs</p>
            </div>
            <div className=" flex flex-row items-center gap-2">
              <Image src={tick} alt="tick" />
              <p className=" text-custom-green">Suggest the best plan</p>
            </div>
          </div>
        </div>

        <form
          className=" w-full lg:w-[40%]"
          onClick={(e) => e.preventDefault()}
        >
          <h1 className=" text-custom-green font-bold text-2xl">
            Let’s Schedule a meeting
          </h1>

          <p className=" text-sm text-custom-gray mb-8">
            Fill in the form below and we will get back to you within 24 hours
          </p>

          <div className=" flex flex-col gap-8">
            <input
              type="text"
              placeholder="Full Name"
              className=" border-2 border-slate-300 rounded-lg px-4 py-2 w-full"
            />

            <input
              type="email"
              placeholder="Email"
              className=" border-2 border-slate-300 rounded-lg px-4 py-2 w-full"
            />

            <input
              type="number"
              inputMode="numeric"
              placeholder="Phone Number"
              className=" border-2 border-slate-300 rounded-lg px-4 py-2 w-full"
            />

            <button className=" w-fit text-white font-semibold px-8 py-2 rounded-lg bg-[#2D6A4F]">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
