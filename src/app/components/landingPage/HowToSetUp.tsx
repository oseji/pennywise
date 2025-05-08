const HowToSetUp = () => {
  type boxes = {
    step: string;
    heading: string;
    subHeading: string;
    text: string;
  };

  const boxes: boxes[] = [
    {
      step: "step one",
      heading: "register",
      subHeading: "and link bank account/s",
      text: "We provide you with a comprehensive set of tools to help administrators, educators, and students manage the exam process, including creating and ",
    },
    {
      step: "step two",
      heading: "set up",
      subHeading: "budget and saving targets",
      text: "We provide you with a comprehensive set of tools to help administrators, educators, and students manage the exam process, including creating and ",
    },
    {
      step: "step three",
      heading: "enjoy",
      subHeading: "the benefits of Pennywise app",
      text: "We provide you with a comprehensive set of tools to help administrators, educators, and students manage the exam process, including creating and ",
    },
  ];

  return (
    <div className=" px-28 py-20 bg-[#F9FAFB]">
      <h2 className=" sectionHeading">How To Set Up</h2>

      <p className=" text-custom-gray text-center">
        We don’t like to brag, but we don’t mind letting our customers do it for
        us.
      </p>

      <div className=" flex flex-row items-center justify-center gap-16 mt-8">
        {boxes.map((element, index) => (
          <div key={index} className=" bg-white rounded-lg px-9 py-12">
            <div className=" flex flex-col gap-2">
              <h3 className=" capitalize text-2xl font-bold">{element.step}</h3>

              <h1 className=" capitalize text-4xl font-black text-custom-green">
                {element.heading}
              </h1>
              <p className=" font-semibold">{element.subHeading}</p>
            </div>

            <p className=" text-custom-gray mt-12">{element.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToSetUp;
