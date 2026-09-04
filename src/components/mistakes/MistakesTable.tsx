import React from 'react';
import { Mistake } from "@/types/mistake-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MistakesTableProps {
    mistakes: Mistake[];
    onEdit: (mistake: Mistake) => void;
    onDelete: (mistakeId: string) => void;
}

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        Behavioral: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        Psychological: "bg-pink-500/10 text-pink-500 border-pink-500/20",
        Cognitive: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Technical: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
        High: "bg-red-500/10 text-red-500 border-red-500/20",
        Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return colors[severity] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
        Critical: "bg-red-500/10 text-red-500 border-red-500/20",
        Moderate: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        Minor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    };
    return colors[impact] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

export function MistakesTable({ mistakes, onEdit, onDelete }: MistakesTableProps) {
    if (mistakes.length === 0) {
        return (
            <div className="glass-card-premium p-12 text-center rounded-3xl border border-border dark:border-white/5 bg-gradient-to-b from-card to-transparent dark:from-white/5">
                <div className="w-16 h-16 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <p className="text-lg font-bold text-foreground dark:text-white mb-2">No custom mistakes yet</p>
                <p className="text-muted-foreground">
                    Click "New Mistake" to start tracking your trading errors.
                </p>
            </div>
        );
    }

    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 5;

    // Sort mistakes by date (newest first) if created_at exists, otherwise keep order
    const sortedMistakes = [...mistakes].sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalPages = Math.ceil(sortedMistakes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedMistakes.length);
    const currentMistakes = sortedMistakes.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-card/50 dark:bg-white/5 rounded-2xl border border-border/50 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
                <div className="col-span-3 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">
                    Mistake Name
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Category
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Severity
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Impact
                </div>
                <div className="col-span-1 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                    Count
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right pr-2">
                    Actions
                </div>
            </div>

            {/* Table Body - Floating Rows */}
            <div className="space-y-3">
                {currentMistakes.map((mistake, index) => (
                    <motion.div
                        key={mistake.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 gap-4 px-6 py-5 items-center rounded-2xl bg-card dark:bg-[#0f172a]/40 border border-border/50 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-muted/50 dark:hover:bg-[#0f172a]/80 backdrop-blur-md transition-all duration-300 group hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:scale-[1.01]"
                    >
                        <div className="col-span-3 flex items-center gap-4 pl-2">
                            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${mistake.category === 'Psychological' ? 'text-pink-500 bg-pink-500' :
                                mistake.category === 'Behavioral' ? 'text-purple-500 bg-purple-500' :
                                    mistake.category === 'Technical' ? 'text-emerald-500 bg-emerald-500' :
                                        'text-blue-500 bg-blue-500'
                                }`} />
                            <span className="font-bold text-foreground dark:text-white text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
                                {mistake.name}
                            </span>
                        </div>

                        <div className="col-span-2 flex items-center">
                            <Badge variant="outline" className={cn("font-bold px-3 py-1 rounded-lg backdrop-blur-sm border-0",
                                getCategoryColor(mistake.category).replace('border-', 'ring-1 ring-')
                            )}>
                                {mistake.category}
                            </Badge>
                        </div>

                        <div className="col-span-2 flex items-center">
                            <Badge variant="outline" className={cn("font-bold px-3 py-1 rounded-lg backdrop-blur-sm border-0",
                                getSeverityColor(mistake.severity).replace('border-', 'ring-1 ring-')
                            )}>
                                {mistake.severity}
                            </Badge>
                        </div>

                        <div className="col-span-2 flex items-center">
                            <Badge variant="outline" className={cn("font-bold px-3 py-1 rounded-lg backdrop-blur-sm border-0",
                                getImpactColor(mistake.impact).replace('border-', 'ring-1 ring-')
                            )}>
                                {mistake.impact}
                            </Badge>
                        </div>

                        <div className="col-span-1 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-xl bg-accent/50 dark:bg-white/5 flex items-center justify-center border border-border/50 dark:border-white/10 group-hover:border-blue-500/30 transition-colors">
                                <span className="text-lg font-black text-foreground dark:text-white">{mistake.count}</span>
                            </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-3 pr-2 opacity-100 transition-opacity duration-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(mistake)}
                                className="h-9 w-9 p-0 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(mistake.id)}
                                className="h-9 w-9 p-0 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-card dark:bg-white/5 border-border/50 dark:border-white/10 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                            <span className="mr-1">‹</span> Prev
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                    "w-9 h-9 p-0 font-bold transition-all",
                                    currentPage === page
                                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                        : "bg-card dark:bg-white/5 border-border/50 dark:border-white/10 text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-card dark:bg-white/5 border-border/50 dark:border-white/10 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                        >
                            Next <span className="ml-1">›</span>
                        </Button>
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">
                        Showing <span className="text-foreground font-bold">{startIndex + 1}</span> to <span className="text-foreground font-bold">{endIndex}</span> of <span className="text-foreground font-bold">{sortedMistakes.length}</span> mistakes
                    </div>
                </div>
            )}
        </div>
    );
}
