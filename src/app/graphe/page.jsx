"use client";
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { validateData } from "../../utils/validation"

const CPMGraph = dynamic(() => import('../../components/CPMGraph/CPMGraph'), {
    ssr: false,
    loading: () => <div className="text-center py-10">Chargement du graphe...</div>
});

const initialTasks = [
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

export default function CPMPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [pendingTasks, setPendingTasks] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleUseDefaultData = () => {
        setIsLoading(true);
        setTasks([...initialTasks]);
        setValidationErrors([]);
        setPendingTasks(null);
        setIsLoading(false);

        // Rediriger vers la page avec les données par défaut
        const tasksParam = encodeURIComponent(JSON.stringify(initialTasks));
        router.push(`/graphe?tasks=${tasksParam}`);
    };

    const handleReturnToPrevious = () => {
        setIsLoading(true);
        setPendingTasks(null);
        setIsLoading(false);

        // Retourner avec les tâches actuelles (avant la tentative de changement)
        const tasksParam = encodeURIComponent(JSON.stringify(tasks));
        router.push(`/?tasks=${tasksParam}`);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const tasksParam = searchParams.get('tasks');
            var finalTasks = [...tasks];

            if (tasksParam) {
                try {
                    // Décoder et parser les tâches depuis les paramètres URL
                    const decodedTasks = JSON.parse(decodeURIComponent(tasksParam));

                    // Valider que les données ont la structure attendue
                    if (Array.isArray(decodedTasks) && decodedTasks.length > 0) {
                        const isValidStructure = decodedTasks.every(task =>
                            task.id &&
                            task.name &&
                            typeof task.duration === 'number' &&
                            Array.isArray(task.successors)
                        );

                        if (isValidStructure) {
                            finalTasks = [...decodedTasks];
                        } else {
                            console.warn('Structure des tâches invalide, utilisation des tâches par défaut');
                            finalTasks = [...initialTasks];
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors du parsing des tâches depuis les paramètres:', error);
                    finalTasks = [...initialTasks];
                }
            } else {
                // Aucun paramètre trouvé, utiliser les tâches initiales
                finalTasks = [...initialTasks];
            }

            // Validation des données
            const validationResult = validateData(finalTasks);
            console.log("%%%VALIDATION RESULT: ", validationResult);
            
            // Simuler un temps de chargement pour une meilleure expérience utilisateur
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setTasks(finalTasks);
            if (!validationResult.isValid) {
                // Si les données ne sont pas valides, afficher les erreurs et demander à l'utilisateur
                setValidationErrors(validationResult.errors);
                setPendingTasks(finalTasks);
                setShowErrorDialog(true);
            } else {
                setValidationErrors([]);
                setShowErrorDialog(false);
                setPendingTasks(null);
            }
            setIsLoading(false);
        };

        loadData();
    }, [searchParams]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Graphe CPM - Méthode du Chemin Critique</h1>

            {/* Dialog de chargement */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-lg font-medium">Traitement des données en cours...</p>
                        <p className="text-sm text-gray-600 mt-2">Veuillez patienter</p>
                    </div>
                </div>
            )}

            {/* Dialog d'erreur de validation */}
            {showErrorDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Erreurs de validation détectées</h2>
                        <p className="mb-4">Les données fournies contiennent des erreurs :</p>

                        <div className="mb-4 max-h-40 overflow-y-auto">
                            {validationErrors.map((error, index) => (
                                <div key={index} className="mb-2 p-2 bg-red-50 border-l-4 border-red-500">
                                    <p className="text-sm text-red-700">{error.message}</p>
                                    {error.taskId && (
                                        <p className="text-xs text-red-600">Tâche: {error.taskId}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="mb-6 text-sm text-gray-600">
                            Voulez-vous utiliser les données par défaut ou retourner aux données précédentes ?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleUseDefaultData}
                                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Utiliser les données par défaut
                            </button>
                            <button
                                onClick={handleReturnToPrevious}
                                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Retourner
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {
                !showErrorDialog && !isLoading && (
                    <div>
                        <CPMGraph initialTasks={tasks} />
                    </div>
                )
            }
        </div>
    );
}