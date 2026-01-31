import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type AnalyticsLevel = "beginner" | "intermediate" | "advanced";

interface LevelSelectorProps {
    currentLevel: AnalyticsLevel;
    onSelect: (level: AnalyticsLevel) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ currentLevel, onSelect }) => {
    const levels: AnalyticsLevel[] = ["beginner", "intermediate", "advanced"];

    return (
        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-6">
            {levels.map((level) => {
                const isActive = currentLevel === level;
                return (
                    <TouchableOpacity
                        key={level}
                        onPress={() => onSelect(level)}
                        className={`flex-1 py-2 rounded-lg items-center justify-center ${isActive ? 'bg-white shadow-sm' : 'bg-transparent'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold capitalize ${isActive ? 'text-blue-600' : 'text-slate-500'
                                }`}
                        >
                            {level}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
