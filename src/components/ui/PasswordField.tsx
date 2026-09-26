"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
	id: string;
	name: string;
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	autoComplete: string;
	minLength?: number;
};

export function PasswordField({ id, name, label, value, onChange, autoComplete, minLength }: Props) {
	const [visible, setVisible] = useState(false);
	return (
		<div>
			<label htmlFor={id} className="field-label">
				{label}
			</label>
			<div className="relative">
				<input
					type={visible ? "text" : "password"}
					id={id}
					name={name}
					autoComplete={autoComplete}
					required
					minLength={minLength}
					placeholder="••••••••"
					className="field pr-12"
					value={value}
					onChange={onChange}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					className="key-icon absolute right-0 top-0"
					aria-label={visible ? "Hide password" : "Show password"}
					aria-pressed={visible}
				>
					{visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
				</button>
			</div>
		</div>
	);
}
