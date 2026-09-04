import { CURRENCIES } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
    currency: string;
    className?: string;
}

export function CountryFlag({ currency, className }: CountryFlagProps) {
    const currencyData = CURRENCIES.find(c => c.code === currency);

    if (!currencyData) {
        return <span className={className}>🏳️</span>;
    }

    return (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden",
                className
            )}
            title={currencyData.name}
        >
            <img
                src={`https://flagcdn.com/w160/${currencyData.countryCode}.png`}
                alt={currencyData.name}
                className="w-full h-full object-cover scale-110"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                        const fallback = document.createElement('span');
                        fallback.innerText = currencyData.flag;
                        fallback.className = 'text-sm';
                        parent.appendChild(fallback);
                    }
                }}
            />
        </div>
    );
}
