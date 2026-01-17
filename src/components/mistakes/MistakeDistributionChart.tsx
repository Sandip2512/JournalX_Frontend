import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

interface DistributionData {
    category: string;
    count: number;
}

interface MistakeDistributionChartProps {
    data: DistributionData[];
}

const BAR_COLORS = [
    "#6366f1", // Indigo/Purple
    "#ec4899", // Pink
    "#0ea5e9", // Sky Blue
    "#10b981", // Emerald
    "#f97316", // Orange
    "#3b82f6", // Blue
    "#e2e8f0", // Slate/White
];

const CustomTooltip = ({ active, payload, totalMistakes }: any) => {
    if (active && payload && payload.length) {
        const count = payload[0].value;
        const percentage = totalMistakes > 0 ? Math.round((count / totalMistakes) * 100) : 0;

        return (
            <div className="glass-card-premium p-3 rounded-lg border border-white/10 shadow-xl">
                <p className="text-xs font-bold text-foreground mb-1">{payload[0].payload.category}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-primary">{count} mistakes</p>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-md">
                        {percentage}%
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function MistakeDistributionChart({ data }: MistakeDistributionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[280px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No distribution data available</p>
            </div>
        );
    }

    // Calculate total mistakes for percentage
    const totalMistakes = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[280px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: -20, right: 0, top: 10, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
                    <XAxis
                        dataKey="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                        dy={10}
                        interval={0}
                        // Simple truncation for very long labels if needed, though CSS is better
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <RechartsTooltip
                        content={<CustomTooltip totalMistakes={totalMistakes} />}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
