const Footer = () => {
  return (
    <footer>
      <div className=" px-28 py-20 bg-[#2D6A4F]">
        <p className=" text-5xl font-bold text-white text-center">
          Smart budgeting for a better tomorrow.
        </p>

        <p className=" text-white text-center mt-2">
          Make better money choices to attain financial freedom with Pennywise.
        </p>

        <button className=" border border-white px-4 py-2 rounded-lg text-white block mx-auto mt-10 font-semibold">
          Sign Up Now
        </button>
      </div>

      <div className=" px-28 py-8 bg-white flex flex-row justify-between items-center">
        <p className=" font-semibold">Pennywise</p>

        <p>Pennywise Inc. All rights Reserved</p>

        <div className=" flex flex-row items-center gap-2">
          <p className=" text-custom-green">Privacy</p>
          <p className=" text-custom-green">Terms</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
