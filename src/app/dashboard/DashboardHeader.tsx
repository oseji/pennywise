import Image from "next/image";

// import searchIcon from "../../assets/dashboard/search.svg";
import bellIcon from "../../assets/dashboard/notification-bing.svg";
import avatarIcon from "../../assets/dashboard/avatar.svg";

const DashboardHeader = () => {
	return (
		<div className="fixed top-0 left-0 z-30 flex flex-row items-center justify-between w-full px-4 py-4 bg-white shadow md:px-12">
			<div className="flex flex-row items-center justify-center gap-4 text-xl font-bold md:text-2xl ">
				<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
					P
				</span>

				<span className="hidden md:block">Pennywise</span>
			</div>

			<div className="flex flex-row items-center gap-4 ">
				<Image
					src={bellIcon}
					alt="notification icon"
					className="cursor-pointer "
				/>
				<Image src={avatarIcon} alt="avatar icon" />
			</div>
		</div>
	);
};

export default DashboardHeader;
