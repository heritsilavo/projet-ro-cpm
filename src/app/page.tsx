"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Task } from '../components/CPMGraph/types'

const defaultTasks: Task[] = [
    { id: 'start', name: 'Début', duration: 0, successors: ['a'] },
    { id: 'a', name: 'a', duration: 7, successors: ['b'] },
    { id: 'b', name: 'b', duration: 7, successors: ['c'] },
    { id: 'c', name: 'c', duration: 15, successors: ['d'] },
    { id: 'd', name: 'd', duration: 30, successors: ['e', 'g', 'h'] },
    { id: 'e', name: 'e', duration: 45, successors: ['f'] },
    { id: 'f', name: 'f', duration: 15, successors: ['k'] },
    { id: 'g', name: 'g', duration: 45, successors: ['m'] },
    { id: 'h', name: 'h', duration: 60, successors: ['i'] },
    { id: 'i', name: 'i', duration: 20, successors: ['j'] },
    { id: 'j', name: 'j', duration: 30, successors: ['m'] },
    { id: 'k', name: 'k', duration: 30, successors: ['l'] },
    { id: 'l', name: 'l', duration: 15, successors: ['m'] },
    { id: 'm', name: 'm', duration: 30, successors: ['n', 'p'] },
    { id: 'n', name: 'n', duration: 15, successors: ['o'] },
    { id: 'o', name: 'o', duration: 30, successors: ['q'] },
    { id: 'p', name: 'p', duration: 15, successors: ['t'] },
    { id: 'q', name: 'q', duration: 15, successors: ['r', 's'] },
    { id: 'r', name: 'r', duration: 15, successors: ['u', 'w'] },
    { id: 's', name: 's', duration: 30, successors: ['v', 'w'] },
    { id: 't', name: 't', duration: 7, successors: ['u', 'v'] },
    { id: 'u', name: 'u', duration: 4, successors: ['fin'] },
    { id: 'v', name: 'v', duration: 2, successors: ['fin'] },
    { id: 'w', name: 'w', duration: 7, successors: ['fin'] },
    { id: 'fin', name: 'fin', duration: 0, successors: [] },
];

export default function TaskEditorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>(defaultTasks);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const tasksParam = searchParams.get('tasks');
        
        if (tasksParam) {
            try {
                const decodedTasks = JSON.parse(decodeURIComponent(tasksParam));
                if (Array.isArray(decodedTasks) && decodedTasks.length > 0) {
                    setTasks(decodedTasks);
                }
            } catch (error) {
                console.error('Erreur lors du parsing des tâches:', error);
                setTasks(defaultTasks);
            }
        } else {
            setTasks(defaultTasks);
        }
        setIsLoading(false);
    }, [searchParams]);

    // Filtrer les tâches éditables (exclure début et fin)
    const editableTasks = tasks.filter(task => task.id !== 'start' && task.id !== 'fin');
    const startTask = tasks.find(task => task.id === 'start');
    const endTask = tasks.find(task => task.id === 'fin');

    const addTask = () => {
        const taskLetters = 'abcdefghijklmnopqrstuvwxyz';
        const existingIds = editableTasks.map(t => t.id);
        
        // Trouver la prochaine lettre disponible
        let newId = '';
        for (let letter of taskLetters) {
            if (!existingIds.includes(letter)) {
                newId = letter;
                break;
            }
        }
        
        if (!newId) {
            newId = `task_${Date.now()}`;
        }

        const newTask: Task = {
            id: newId,
            name: `Tâche ${newId.toUpperCase()}`,
            duration: 1,
            successors: []
        };

        // Insérer la nouvelle tâche avant la tâche 'fin'
        const updatedTasks = [
            startTask!,
            ...editableTasks,
            newTask,
            endTask!
        ];
        
        setTasks(updatedTasks);
    };

    const removeTask = (taskId: string) => {
        if (taskId === 'start' || taskId === 'fin') return;
        if (editableTasks.length <= 1) return;
        
        const updatedEditableTasks = editableTasks.filter(task => task.id !== taskId);
        const updatedTasks = [startTask!, ...updatedEditableTasks, endTask!];
        
        setTasks(updatedTasks);
    };

    const updateTask = (taskId: string, field: keyof Task, value: any) => {
        if (taskId === 'fin') return;
        
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId 
                    ? { ...task, [field]: value }
                    : task
            )
        );
    };

    const updateSuccessors = (taskId: string, successors: string) => {
        if (taskId === 'fin') return;
        
        const successorArray = successors
            .split(/[-,\s]+/)
            .map(s => s.trim())
            .filter(s => s && s !== taskId);
        
        updateTask(taskId, 'successors', successorArray);
    };

    const saveAndReturn = () => {
        const tasksParam = encodeURIComponent(JSON.stringify(tasks));
        router.push(`/graphe?tasks=${tasksParam}`);
    };

    const cancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto p-6">
                {/* En-tête */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                ✏️ Éditeur de Tâches CPM
                            </h1>
                            <p className="text-gray-600">
                                Gérez vos tâches de projet - Les tâches "Début" et "Fin" sont automatiques
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={addTask}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                ➕ Ajouter Tâche
                            </button>
                            <button
                                onClick={saveAndReturn}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                💾 Generer Graphe
                            </button>
                            <button
                                onClick={cancel}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                ❌ Annuler
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                    <th className="px-6 py-4 text-left font-semibold">ID</th>
                                    <th className="px-6 py-4 text-left font-semibold">Nom de la tâche</th>
                                    <th className="px-6 py-4 text-left font-semibold">Durée (jours)</th>
                                    <th className="px-6 py-4 text-left font-semibold">Successeurs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* Tâche de début (non éditable) */}
                                <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                                            🚀
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-green-700">start</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-green-700">Début</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-600">0</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={startTask?.successors?.join('-') || ''}
                                            onChange={(e) => updateSuccessors('start', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="a-b-c ou fin"
                                        />
                                    </td>
                                </tr>

                                {/* Tâches éditables */}
                                {editableTasks.map((task, index) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => removeTask(task.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
                                                disabled={editableTasks.length <= 1}
                                                title="Supprimer la tâche"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={task.id}
                                                onChange={(e) => updateTask(task.id, 'id', e.target.value)}
                                                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                                placeholder="ID"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={task.name}
                                                onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                                placeholder="Nom de la tâche"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={task.duration}
                                                onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                                min="0"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={task.successors?.join('-') || ''}
                                                onChange={(e) => updateSuccessors(task.id, e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                                placeholder="a-b-c ou fin"
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {/* Tâche de fin (non éditable) */}
                                <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                                            🏁
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-red-700">fin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-red-700">Fin</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-red-600">0</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">Aucun</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        📋 Guide d'utilisation
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Champs éditables :</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <strong>ID :</strong> Identifiant unique (ex: a, b, c)
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <strong>Nom :</strong> Description de la tâche
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <strong>Durée :</strong> Temps en jours
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <strong>Successeurs :</strong> Tâches suivantes (séparées par -)
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Actions disponibles :</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Ajouter de nouvelles tâches
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Supprimer des tâches existantes
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Modifier tous les champs en temps réel
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                    Les prédécesseurs sont calculés automatiquement
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold">{editableTasks.length}</div>
                            <div className="text-blue-100">Tâches éditables</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{tasks.length}</div>
                            <div className="text-blue-100">Total des tâches</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {editableTasks.reduce((sum, task) => sum + task.duration, 0)}
                            </div>
                            <div className="text-blue-100">Durée totale (jours)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}