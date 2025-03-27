"use client"; // Ajouter cette ligne si vous utilisez le App Router

import CustomEdge from '@/components/CustomEdge/CustomEdge';
import dynamic from 'next/dynamic';

// Import dynamique côté client pour éviter les erreurs de SSR
const CPMGraph = dynamic(() => import('../components/CPMGraph/CPMGraph'), {
  ssr: false,
});

export default function CPMPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Graphe CPM - Méthode du Chemin Critique</h1>
      <div className='w-full h-[80%] border-2'>
        <CPMGraph />
      </div>
    </div>
  );
}