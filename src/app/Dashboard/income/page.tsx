import Image from "next/image";

import editIcon from "../../../assets/dashboard/edit icon.svg";
import deleteIcon from "../../../assets/dashboard/delete icon.svg";

type tableDataType = {
	date: string;
	narration: string;
	amount: number;
}[];

const IncomeScreen = () => {
	const tableData: tableDataType = [
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
	];
	return (
		<div className=" dashboardScreen">
			<h1 className="dashboardHeading">income</h1>

			<div className=" flex flex-row items-center justify-between">
				<h1 className=" font-bold text-2xl">Date</h1>

				<button className="  bg-white border border-[#2D6A4F] text-[#2D6A4F] px-4 py-2 rounded-lg hover:scale-110 transition ease-in-out">
					+ Add income
				</button>
			</div>

			<table className=" w-full mt-5 border-collapse table-auto">
				<thead>
					<tr className=" capitalize bg-slate-200 rounded-lg">
						<th className=" py-4 px-14 font-bold">date | time</th>
						<th className=" py-4 px-14 font-bold">narration</th>
						<th className=" py-4 px-14 font-bold">amount </th>
						<th className=" py-4 px-14 font-bold">action</th>
					</tr>
				</thead>

				<tbody className=" bg-white w-full">
					{tableData.map((item, index) => (
						<tr key={index} className=" shadow-2xl rounded-lg px-4 py-2">
							<td className=" font-medium pt-4">{item.date}</td>

							<td className=" font-medium pt-4">{item.narration}</td>

							<td className=" font-medium pt-4">{item.amount}</td>

							<td>
								<div className=" flex flex-row items-center gap-4 justify-center">
									<Image
										src={editIcon}
										alt="edit icon"
										className=" cursor-pointer hover:scale-110 transition ease-in-out"
									/>
									<Image
										src={deleteIcon}
										alt="delete icon"
										className=" cursor-pointer hover:scale-110 transition ease-in-out"
									/>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default IncomeScreen;
