import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, Save, AlertTriangle } from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CreateMistakeModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateMistakeModal: React.FC<CreateMistakeModalProps> = ({ visible, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Behavioral');
    const [severity, setSeverity] = useState('Medium');
    const [impact, setImpact] = useState('Moderate');
    const [loading, setLoading] = useState(false);

    const categories = ['Behavioral', 'Psychological', 'Technical', 'Strategy'];
    const severities = ['Low', 'Medium', 'High'];
    const impacts = ['Minor', 'Moderate', 'Critical'];

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await api.post("/mistakes/", {
                user_id: user?.user_id,
                name: name,
                category: category,
                severity: severity,
                impact: impact,
                description: "Created via Mobile",
                tags: []
            });
            onSuccess();
            setName('');
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to create mistake");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-slate-900">Log New Mistake</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="space-y-6 pb-10">
                            <View>
                                <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Mistake Name</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-base font-semibold text-slate-800"
                                    placeholder="e.g. FOMO Entry"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Category</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {categories.map(c => (
                                        <TouchableOpacity
                                            key={c}
                                            onPress={() => setCategory(c)}
                                            className={`px-4 py-2 rounded-full border ${category === c ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}
                                        >
                                            <Text className={`text-sm font-bold ${category === c ? 'text-white' : 'text-slate-600'}`}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Severity</Text>
                                <View className="flex-row gap-2">
                                    {severities.map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setSeverity(s)}
                                            className={`flex-1 py-3 rounded-xl border items-center ${severity === s ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200'}`}
                                        >
                                            <Text className={`text-sm font-bold ${severity === s ? 'text-white' : 'text-slate-600'}`}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Impact</Text>
                                <View className="flex-row gap-2">
                                    {impacts.map(i => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => setImpact(i)}
                                            className={`flex-1 py-3 rounded-xl border items-center ${impact === i ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200'}`}
                                        >
                                            <Text className={`text-sm font-bold ${impact === i ? 'text-white' : 'text-slate-600'}`}>{i}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading}
                                className="bg-slate-900 p-4 rounded-xl flex-row justify-center items-center mt-4 shadow-lg shadow-slate-300"
                            >
                                {loading ? <ActivityIndicator color="white" /> : (
                                    <>
                                        <AlertTriangle size={20} color="white" />
                                        <Text className="text-white font-bold ml-2 text-lg">Log Mistake</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
