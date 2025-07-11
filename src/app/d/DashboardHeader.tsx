import Image from "next/image";

import searchIcon from "../../assets/dashboard/search.svg";
import bellIcon from "../../assets/dashboard/notification-bing.svg";
import avatarIcon from "../../assets/dashboard/avatar.svg";

const DashboardHeader = () => {
	return (
		<div className=" w-[calc(100%-256px)] flex flex-row justify-between items-center px-12 py-4 bg-white fixed top-0 left-64 right-0">
			<div className=" flex flex-row items-center gap-2 w-[440px] px-6 py-3 rounded-lg border border-slate-300">
				<Image src={searchIcon} alt="search icon" />
				<input
					type="text"
					name="searchbar"
					id="searchbar"
					placeholder="Search"
				/>
			</div>

			<div className=" flex flex-row items-center gap-4">
				<Image src={bellIcon} alt="notification icon" />
				<Image src={avatarIcon} alt="avatar icon" />
			</div>
		</div>
	);
};

export default DashboardHeader;
