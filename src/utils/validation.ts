import { Task } from "../components/CPMGraph/types";

export interface ValidationError {
    type: 'error' | 'warning';
    code: string;
    message: string;
    taskId?: string;
    details?: any;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Fonction principale de validation des données CPM
 * @param tasks - Liste des tâches à valider
 * @returns Résultat de la validation avec erreurs et avertissements
 */
export const validateData = (tasks: Task[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Validation de base - Structure et types
    validateBasicStructure(tasks, errors);

    // 2. Validation des IDs uniques
    validateUniqueIds(tasks, errors);

    // 3. Validation des tâches obligatoires (start et fin)
    validateMandatoryTasks(tasks, errors);

    // 4. Validation des références de successeurs
    validateSuccessorReferences(tasks, errors);

    // 5. Validation des durées
    validateDurations(tasks, errors, warnings);

    // 6. Détection des cycles
    validateNoCycles(tasks, errors);

    // 7. Validation de la connectivité du graphe
    validateGraphConnectivity(tasks, errors, warnings);

    // 8. Validation des noms
    validateNames(tasks, warnings);

    // 9. Validation de la cohérence logique
    validateLogicalConsistency(tasks, warnings);

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Valide la structure de base des tâches
 */
const validateBasicStructure = (tasks: Task[], errors: ValidationError[]): void => {
    if (!Array.isArray(tasks)) {
        errors.push({
            type: 'error',
            code: 'INVALID_STRUCTURE',
            message: 'Les données doivent être un tableau de tâches'
        });
        return;
    }

    if (tasks.length === 0) {
        errors.push({
            type: 'error',
            code: 'EMPTY_TASKS',
            message: 'La liste des tâches ne peut pas être vide'
        });
        return;
    }

    tasks.forEach((task, index) => {
        // Vérifier que chaque tâche est un objet
        if (!task || typeof task !== 'object') {
            errors.push({
                type: 'error',
                code: 'INVALID_TASK_STRUCTURE',
                message: `La tâche à l'index ${index} n'est pas un objet valide`
            });
            return;
        }

        // Vérifier les propriétés obligatoires
        if (!task.id || typeof task.id !== 'string') {
            errors.push({
                type: 'error',
                code: 'MISSING_TASK_ID',
                message: `La tâche à l'index ${index} n'a pas d'ID valide`,
                taskId: task.id
            });
        }

        if (!task.name || typeof task.name !== 'string') {
            errors.push({
                type: 'error',
                code: 'MISSING_TASK_NAME',
                message: `La tâche "${task.id}" n'a pas de nom valide`,
                taskId: task.id
            });
        }

        if (typeof task.duration !== 'number') {
            errors.push({
                type: 'error',
                code: 'INVALID_DURATION_TYPE',
                message: `La durée de la tâche "${task.id}" doit être un nombre`,
                taskId: task.id
            });
        }

        if (!Array.isArray(task.successors)) {
            errors.push({
                type: 'error',
                code: 'INVALID_SUCCESSORS_TYPE',
                message: `Les successeurs de la tâche "${task.id}" doivent être un tableau`,
                taskId: task.id
            });
        }
    });
};

/**
 * Valide l'unicité des IDs
 */
const validateUniqueIds = (tasks: Task[], errors: ValidationError[]): void => {
    const seenIds = new Set<string>();
    const duplicates = new Set<string>();

    tasks.forEach(task => {
        if (task.id) {
            if (seenIds.has(task.id)) {
                duplicates.add(task.id);
            } else {
                seenIds.add(task.id);
            }
        }
    });

    duplicates.forEach(id => {
        errors.push({
            type: 'error',
            code: 'DUPLICATE_TASK_ID',
            message: `L'ID "${id}" est utilisé par plusieurs tâches`,
            taskId: id
        });
    });
};

/**
 * Valide la présence des tâches obligatoires
 */
const validateMandatoryTasks = (tasks: Task[], errors: ValidationError[]): void => {
    const taskIds = new Set(tasks.map(task => task.id));

    if (!taskIds.has('start')) {
        errors.push({
            type: 'error',
            code: 'MISSING_START_TASK',
            message: 'La tâche de début "start" est obligatoire'
        });
    }

    if (!taskIds.has('fin')) {
        errors.push({
            type: 'error',
            code: 'MISSING_END_TASK',
            message: 'La tâche de fin "fin" est obligatoire'
        });
    }
};

/**
 * Valide les références des successeurs
 */
const validateSuccessorReferences = (tasks: Task[], errors: ValidationError[]): void => {
    const taskIds = new Set(tasks.map(task => task.id));

    tasks.forEach(task => {
        if (task.successors && Array.isArray(task.successors)) {
            task.successors.forEach(successorId => {
                if (typeof successorId !== 'string') {
                    errors.push({
                        type: 'error',
                        code: 'INVALID_SUCCESSOR_TYPE',
                        message: `Successeur invalide dans la tâche "${task.id}": doit être une chaîne de caractères`,
                        taskId: task.id,
                        details: { successor: successorId }
                    });
                    return;
                }

                if (!taskIds.has(successorId)) {
                    errors.push({
                        type: 'error',
                        code: 'INVALID_SUCCESSOR_REFERENCE',
                        message: `La tâche "${task.id}" référence un successeur inexistant: "${successorId}"`,
                        taskId: task.id,
                        details: { successor: successorId }
                    });
                }

                // Vérifier les auto-références
                if (successorId === task.id) {
                    errors.push({
                        type: 'error',
                        code: 'SELF_REFERENCE',
                        message: `La tâche "${task.id}" ne peut pas être son propre successeur`,
                        taskId: task.id
                    });
                }
            });

            // Vérifier les doublons dans les successeurs
            const uniqueSuccessors = new Set(task.successors);
            if (uniqueSuccessors.size !== task.successors.length) {
                errors.push({
                    type: 'error',
                    code: 'DUPLICATE_SUCCESSORS',
                    message: `La tâche "${task.id}" a des successeurs en double`,
                    taskId: task.id
                });
            }
        }
    });
};

/**
 * Valide les durées
 */
const validateDurations = (tasks: Task[], errors: ValidationError[], warnings: ValidationError[]): void => {
    tasks.forEach(task => {
        if (typeof task.duration === 'number') {
            if (task.duration < 0) {
                errors.push({
                    type: 'error',
                    code: 'NEGATIVE_DURATION',
                    message: `La durée de la tâche "${task.id}" ne peut pas être négative`,
                    taskId: task.id,
                    details: { duration: task.duration }
                });
            }

            if (!Number.isFinite(task.duration)) {
                errors.push({
                    type: 'error',
                    code: 'INVALID_DURATION_VALUE',
                    message: `La durée de la tâche "${task.id}" doit être un nombre fini`,
                    taskId: task.id,
                    details: { duration: task.duration }
                });
            }

            // Avertissements pour des durées inhabituelles
            if (task.duration > 1000) {
                warnings.push({
                    type: 'warning',
                    code: 'VERY_LONG_DURATION',
                    message: `La tâche "${task.id}" a une durée très longue (${task.duration})`,
                    taskId: task.id,
                    details: { duration: task.duration }
                });
            }

            // Vérifier les durées spéciales pour start et fin
            if ((task.id === 'start' || task.id === 'fin') && task.duration !== 0) {
                warnings.push({
                    type: 'warning',
                    code: 'NON_ZERO_MILESTONE_DURATION',
                    message: `La tâche "${task.id}" devrait avoir une durée de 0`,
                    taskId: task.id,
                    details: { duration: task.duration }
                });
            }
        }
    });
};

/**
 * Détecte les cycles dans le graphe
 */
const validateNoCycles = (tasks: Task[], errors: ValidationError[]): void => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const taskMap = new Map(tasks.map(task => [task.id, task]));

    const hasCycle = (taskId: string, path: string[]): boolean => {
        if (recursionStack.has(taskId)) {
            const cycleStart = path.indexOf(taskId);
            const cycle = path.slice(cycleStart).concat([taskId]);
            errors.push({
                type: 'error',
                code: 'CIRCULAR_DEPENDENCY',
                message: `Dépendance circulaire détectée: ${cycle.join(' → ')}`,
                details: { cycle }
            });
            return true;
        }

        if (visited.has(taskId)) {
            return false;
        }

        visited.add(taskId);
        recursionStack.add(taskId);

        const task = taskMap.get(taskId);
        if (task && task.successors) {
            for (const successorId of task.successors) {
                if (hasCycle(successorId, [...path, taskId])) {
                    return true;
                }
            }
        }

        recursionStack.delete(taskId);
        return false;
    };

    // Vérifier depuis chaque tâche non visitée
    for (const task of tasks) {
        if (!visited.has(task.id)) {
            hasCycle(task.id, []);
        }
    }
};

/**
 * Valide la connectivité du graphe
 */
const validateGraphConnectivity = (tasks: Task[], errors: ValidationError[], warnings: ValidationError[]): void => {
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    
    // Vérifier que toutes les tâches sont accessibles depuis 'start'
    if (taskMap.has('start')) {
        const reachableFromStart = new Set<string>();
        const visitFromStart = (taskId: string) => {
            if (reachableFromStart.has(taskId)) return;
            reachableFromStart.add(taskId);
            
            const task = taskMap.get(taskId);
            if (task && task.successors) {
                task.successors.forEach(successorId => {
                    if (taskMap.has(successorId)) {
                        visitFromStart(successorId);
                    }
                });
            }
        };

        visitFromStart('start');

        tasks.forEach(task => {
            if (!reachableFromStart.has(task.id)) {
                warnings.push({
                    type: 'warning',
                    code: 'UNREACHABLE_TASK',
                    message: `La tâche "${task.id}" n'est pas accessible depuis le début`,
                    taskId: task.id
                });
            }
        });
    }

    // Vérifier que 'fin' est accessible depuis toutes les tâches
    if (taskMap.has('fin')) {
        const canReachEnd = new Set<string>();
        
        const checkCanReachEnd = (taskId: string): boolean => {
            if (canReachEnd.has(taskId)) return true;
            if (taskId === 'fin') {
                canReachEnd.add(taskId);
                return true;
            }

            const task = taskMap.get(taskId);
            if (task && task.successors) {
                const canReach = task.successors.some(successorId => 
                    taskMap.has(successorId) && checkCanReachEnd(successorId)
                );
                
                if (canReach) {
                    canReachEnd.add(taskId);
                    return true;
                }
            }
            
            return false;
        };

        tasks.forEach(task => {
            if (!checkCanReachEnd(task.id)) {
                warnings.push({
                    type: 'warning',
                    code: 'CANNOT_REACH_END',
                    message: `La tâche "${task.id}" ne peut pas atteindre la fin`,
                    taskId: task.id
                });
            }
        });
    }
};

/**
 * Valide les noms des tâches
 */
const validateNames = (tasks: Task[], warnings: ValidationError[]): void => {
    const seenNames = new Set<string>();

    tasks.forEach(task => {
        if (task.name) {
            // Vérifier les noms en double
            if (seenNames.has(task.name.toLowerCase())) {
                warnings.push({
                    type: 'warning',
                    code: 'DUPLICATE_TASK_NAME',
                    message: `Le nom "${task.name}" est utilisé par plusieurs tâches`,
                    taskId: task.id
                });
            } else {
                seenNames.add(task.name.toLowerCase());
            }

            // Vérifier les noms vides ou trop courts
            if (task.name.trim().length === 0) {
                warnings.push({
                    type: 'warning',
                    code: 'EMPTY_TASK_NAME',
                    message: `La tâche "${task.id}" a un nom vide`,
                    taskId: task.id
                });
            }
        }
    });
};

/**
 * Valide la cohérence logique
 */
const validateLogicalConsistency = (tasks: Task[], warnings: ValidationError[]): void => {
    // Vérifier que 'start' n'a pas de prédécesseurs
    const hasStartAsPredecessor = tasks.some(task => 
        task.successors && task.successors.includes('start')
    );
    
    if (hasStartAsPredecessor) {
        warnings.push({
            type: 'warning',
            code: 'START_HAS_PREDECESSORS',
            message: 'La tâche "start" ne devrait pas avoir de prédécesseurs'
        });
    }

    // Vérifier que 'fin' n'a pas de successeurs
    const finTask = tasks.find(task => task.id === 'fin');
    if (finTask && finTask.successors && finTask.successors.length > 0) {
        warnings.push({
            type: 'warning',
            code: 'END_HAS_SUCCESSORS',
            message: 'La tâche "fin" ne devrait pas avoir de successeurs',
            taskId: 'fin'
        });
    }

    // Vérifier les tâches isolées (sans successeurs ni prédécesseurs)
    const tasksWithPredecessors = new Set<string>();
    tasks.forEach(task => {
        if (task.successors) {
            task.successors.forEach(successorId => {
                tasksWithPredecessors.add(successorId);
            });
        }
    });

    tasks.forEach(task => {
        if (task.id !== 'start' && task.id !== 'fin') {
            const hasSuccessors = task.successors && task.successors.length > 0;
            const hasPredecessors = tasksWithPredecessors.has(task.id);
            
            if (!hasSuccessors && !hasPredecessors) {
                warnings.push({
                    type: 'warning',
                    code: 'ISOLATED_TASK',
                    message: `La tâche "${task.id}" est isolée (pas de prédécesseurs ni de successeurs)`,
                    taskId: task.id
                });
            }
        }
    });
};