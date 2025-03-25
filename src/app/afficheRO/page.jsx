"use client"

import { useCallback, useState } from 'react'
import './page.css'

export default function tableau() {
    const [cacher, setCacher] = useState(true);
    const [taches, setTaches] = useState([]);
    const onClickResoudre = useCallback(()=>{
        const debut={ id: 'start', name: 'Début', duration: 0, successors: [taches[0].id] };
        const fin={ id: 'fin', name: 'fin', duration: 0, successors: [] };

        var Tmp = [...taches];
            Tmp.push(fin);
            Tmp.shift(debut);
            setTaches(Tmp);
            console.log(Tmp);
    },[taches]);
    const onClickEnregistrer = useCallback(() => {
        const Tanterieur = document.getElementById("Tanterieur").value;
        const Duree = document.getElementById("duree").value;
        const Tsuc = Array.from(document.getElementById("Tsuc").selectedOptions).map(option => option.value);
        console.log("Tanterieur, duree, Tsuc", Tanterieur, Duree, Tsuc);
        const tache = { id: Tanterieur, name: Tanterieur, duration: Duree, successors: Tsuc };

        var Tmp = [...taches];
        Tmp.push(tache);
        setTaches(Tmp);
    },[taches]);
    return <div>
        <h1>Ajout des données d'un Algo CPM</h1>

        <button className="btn"
            onClick={() => { setCacher(false) }}>
            Ajouter
        </button>

        <div className={cacher ? 'cacher' : 'NonCacher'}>
            <div>
                <label>Tache Antérieur</label>
                <input type="texte" id='Tanterieur'></input>
            </div>
            <div>
                <label>Durée des Taches</label>
                <input type="number" id='duree' defaultValue={0}></input>
            </div>
            <div>
                <label>Tache Succéssive</label>
                <select multiple id='Tsuc'>
                    <option value="a">a</option>
                    <option value="b">b</option>
                    <option value="c">c</option>
                    <option value="d">d</option>
                </select>
            </div>

            <button className='btn'
                onClick={onClickEnregistrer}>
                Enregistrer
            </button>
        </div>
        <table> 
            <thead>
                <tr>
                    <th>Tache</th>
                    {
                    taches.map(tache=><th key={tache.id}>{tache.name}</th>) 
                    }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Durée</td>
                    {
                    taches.map(tache=><td key={tache.id}>{tache.duration}</td>) 
                    }
                </tr>
                <tr>
                    <td>Succésseur</td>
                    {
                    taches.map(tache=><td key={tache.id}>{tache.successors}</td>) 
                    }
                </tr>
            </tbody>
        </table>

            <button className='btn' onClick={onClickResoudre}>
                Résoudre
                </button>

    </div>
}

