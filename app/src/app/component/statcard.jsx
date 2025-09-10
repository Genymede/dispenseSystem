import React from 'react';
import { TrendingUp } from 'lucide-react';
export default function StatsCard({ icon: Icon, label, value, color = "blue", trend }) {

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
					<p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
					{trend && (
						<div className="flex items-center mt-2">
							<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
							<span className="text-sm text-green-600 font-medium">{trend}</span>
						</div>
					)}
				</div>
				<div className={`bg-${color}-100 p-3 rounded-full`}>
					<Icon className={`h-6 w-6 text-${color}-800`} />
				</div>
			</div>
		</div>
	)
}