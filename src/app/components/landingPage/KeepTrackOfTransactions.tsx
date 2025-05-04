import Image from "next/image";
import image from "../../../assets/landingPageIcons/keep track of transactions.png";
import tickIcon from "../../../assets/landingPageIcons/tick icon.svg";

const KeepTrackOfTransactions = () => {
  const dataToMap: string[] = [
    "Budget Tracking",
    "Income Tracking",
    "Expenditure Tracking",
    "Savings and Others",
    "Budget Tracking",
    "Income Tracking",
    "Expenditure Tracking",
    "Savings and Others",
  ];
  return (
    <div className=" flex flex-row items-center justify-between gap-32 px-28 py-20">
      <Image
        src={image}
        alt="Keep track of transactions"
        className=" w-full lg:w-[40%]"
      />

      <div className=" w-full lg:w-[60%] flex flex-col gap-6">
        <h2 className=" font-bold text-3xl">Keep Track Of Your Transactions</h2>

        <p className=" text-custom-gray">
          Easy-to-use exam editor helps you design any kind of assessments from
          very basic to highly complex.
        </p>

        <div className=" grid grid-cols-2 gap-y-4">
          {dataToMap.map((item, index) => (
            <div className=" flex flex-row items-center gap-2" key={index}>
              <Image src={tickIcon} alt="Tick icon" />
              <p className=" text-[#2D6A4F]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeepTrackOfTransactions;
