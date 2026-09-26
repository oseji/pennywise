import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
	title: "Pennywise | Savings",
};

// Savings isn't built yet. The page exists so the link lands somewhere honest.
const SavingsPage = () => {
	return (
		<div className="page max-w-[880px]">
			<PageHeader title="Savings">Goals you put money aside for.</PageHeader>

			<div className="slip-shadow">
				<div className="slip-torn px-5 pb-10 pt-6 md:px-8">
					<span className="stamp border-warn text-warn">Not built yet</span>
					<h2 className="mt-4 font-mono text-[15px] font-bold uppercase tracking-[0.06em]">Savings goals are coming</h2>
					<p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
						You&apos;ll be able to name a goal, set a target and watch the balance climb towards it. Until then, the
						&ldquo;Kept&rdquo; line on your dashboard shows how much of your income you&apos;re holding on to, and a
						budget line is the best way to ring-fence money for something.
					</p>
					<div className="mt-6 flex flex-wrap gap-2">
						<Link href="/dashboard/budget" className="key-plain">
							Go to budget
						</Link>
						<Link href="/dashboard" className="key-ghost">
							Back to dashboard
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SavingsPage;
