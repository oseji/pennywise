const NavBar = () => {
  return (
    <nav className=" flex flex-row items-center justify-between px-28 py-5">
      <div className=" flex flex-row items-center gap-6">
        <div>
          <span className=" text-4xl font-bold text-custom-green px-5 py-2.5 rounded-full bg-[#B7E4C7]">
            P
          </span>
        </div>

        <span className=" text-3xl font-bold">Pennywise</span>
      </div>

      <div className=" flex flex-row items-center gap-8 font-semibold">
        <ul className=" flex flex-row items-center gap-8">
          <li>How it works</li>
          <li>Benefits</li>
          <li>Features</li>
          <li>Faq</li>
        </ul>

        <button className=" px-4 py-3 rounded-lg bg-custom-green text-white">
          Register
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
