import { useStep } from "../CPMGraph/CPMGraph";
import React from "react";
import { Task } from "../CPMGraph/types";
import { useRouter } from 'next/navigation';
import "./ProjectSummary.css"

type ProjectSummaryProps = { tasks: Task[], criticalPath: string[] }

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({ tasks, criticalPath }) => {
  const router = useRouter();
  const endTask = tasks?.find((t) => t.id === 'fin');
  const projectDuration = endTask ? endTask.earliest : 0;

  const { step } = useStep();

  const handleEdit = () => {
    // Encoder les tâches pour les passer en paramètres
    const tasksParam = encodeURIComponent(JSON.stringify(tasks));
    router.push(`/?tasks=${tasksParam}`);
  };

  return <>
    {
      (step >= 1) && <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'white',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          zIndex: 5,
        }}
      >
        <h3 className="font-bold text-center">Résumé du projet</h3>
        
        <table>
          <thead>
            <tr>
              <th className="table-headers">Taches</th>
              {
                tasks.filter(t => (t.id != "deb") && (t.name != "fin")).map((t, i) => <td key={i} className="table-content">{t.name}</td>)
              }
            </tr>
          </thead>
          <tbody>
              <tr>
                <th className="table-headers">Durrée</th>
                {
                  tasks.filter(t => (t.id != "deb") && (t.name != "fin")).map((t, i) => <td key={i} className="table-content">{t.duration}</td>)
                }
              </tr>
              <tr>
                <th className="table-headers">T. ant</th>
                {
                  tasks.filter(t => (t.id != "deb") && (t.name != "fin")).map((t, i) => <td key={i} className="table-content">{t.predecessors?.join("-")}</td>)
                }
              </tr>
              <tr>
                <th className="table-headers">T. succ</th>
                {
                  tasks.filter(t => (t.id != "deb") && (t.name != "fin")).map((t, i) => <td key={i} className="table-content">{t.successors?.join("-")}</td>)
                }
              </tr>
          </tbody>
        </table>
        
        {
          (step >= 2) && <p>
          Durée totale: <strong> {projectDuration} </strong>
          </p>
        }
        
        {
          (step >= 3) && <p>
            Chemin critique:  <strong>{criticalPath.join(' → ')} </strong> 
          </p>
        }

        <button 
          className="botton-edit"
          onClick={handleEdit}
        >
          Modifier les données
        </button>
      
      </div>
    }
  </>;
};