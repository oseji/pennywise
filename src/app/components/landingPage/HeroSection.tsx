import Image from "next/image";
import heroSectionIcon from "../../../assets/landingPageIcons/hero section image.png";
const HeroSection = () => {
  return (
    <div className=" flex flex-row items-start justify-between gap-13 px-28 py-20 bg-[#D8F3DC]">
      <div className=" w-full lg:w-[60%] flex flex-col gap-8">
        <p className=" text-5xl font-bold">
          Financial freedom starts when you
          <span className=" text-custom-green"> Track expenses</span> ,
          <span className=" text-custom-green">Budget</span>, and
          <span className=" text-custom-green"> Save</span> to make every penny
          count.
        </p>

        <p className=" text-custom-gray">
          We are here to help you manage your finances more effectively and make
          informed decisions about your spending and saving habits.
        </p>

        <button className=" bg-custom-green text-white px-4 py-3 rounded-lg w-fit">
          Register Here
        </button>
      </div>

      <Image
        src={heroSectionIcon}
        alt="Hero section image"
        className=" w-full lg:w-[40%]"
      />
    </div>
  );
};

export default HeroSection;
