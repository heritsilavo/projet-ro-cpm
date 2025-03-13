export const ProjectSummary = ({tasks, criticalPath}) => {
    const endTask = tasks.find((t) => t.id === 'fin');
    const projectDuration = endTask ? endTask.earliest : 0;

    return (
      <div
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
        <h3>Résumé du projet</h3>
        <p>
          <strong>Durée totale:</strong> {projectDuration}
        </p>
        <p>
          <strong>Chemin critique:</strong> {criticalPath.join(' → ')}
        </p>
      </div>
    );
  };