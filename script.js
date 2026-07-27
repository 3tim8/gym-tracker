// Startdaten / Datenstruktur (Korrektur: "src=" entfernt)
const defaultDevices = [
    { id: 1, name: "Nr 01 - Beinpresse", muscle: "Beine", type: "Beides", image: "imgSport/04_3002_lying_leg_curl.webp", history: [] },
    { id: 2, name: "Nr 02 - Beinbeuger", muscle: "Beine", type: "Beides", image: "imgSport/02_3001_Beinbeuger.webp", history: [] },
    { id: 3, name: "Nr 03 - Beinstrecker", muscle: "Beine", type: "Beides", image: "imgSport/03_5013_Beinstrecker.webp", history: [] },
    { id: 4, name: "Nr 04 - Beinbeuger liegend", muscle: "Beine", type: "Beides", image: "imgSport/04_3002_lying_leg_curl.webp", history: [] },
    { id: 5, name: "Nr 11 - Rudermaschine", muscle: "Rückenmuskulatur", type: "Pull", image: "imgSport/11_3040_Rudermaschine.webp", history: [] },
    { id: 6, name: "Nr 12 - Rückenzugmaschine", muscle: "breiter Rückenmuskel", type: "Pull", image: "imgSport/12_3020_rueckenzugmaschine.webp", history: [] },
    { id: 7, name: "Nr 13 - Reverse Butterfly", muscle: "hintere Schulter", type: "Pull", image: "imgSport/13_3025_reverse_butterfly.webp", history: [] },
    { id: 8, name: "Nr 16 - Brustpresse", muscle: "Brustmuskel", type: "Push", image: "imgSport/16_3016_brustpresse.webp", history: [] },
    { id: 9, name: "Nr 17 - Butterfly", muscle: "Brustmuskel", type: "Push", image: "imgSport/17_3022_butterfly.webp", history: [] },
    { id: 10, name: "Nr 21 - Bizepsmaschine", muscle: "Bizeps brachii", type: "Pull", image: "imgSport/21_3010_bizepsmaschine.webp", history: [] },
    { id: 11, name: "Nr 28 - Rückenzugstation", muscle: "breiter Rückenmuskel", type: "Pull", image: "imgSport/28_4116_rueckenzugstation.webp", history: [] },
    { id: 12, name: "Nr 29 - Ruderstation", muscle: "großer Rückenmuskel", type: "Pull", image: "imgSport/29_4016_ruderstation.webp", history: [] },
    { id: 13, name: "Nr 35 - Unbekannt", muscle: "-", type: "-", image: "imgSport/xxx.webp", history: [] },
    { id: 14, name: "Nr 39 - Bauchmuskelbank", muscle: "Bauchmuskeln", type: "Push", image: "imgSport/39_4307_bauchmuskelbank.webp", history: [] },
    { id: 15, name: "Bench Press", muscle: "großer Brustmuskel", type: "Push", image: "imgSport/Bench_Press.webp", history: [] }    
];

// Füge diese Zeile kurz ein, lade die Seite neu, und lösche sie danach wieder:
// localStorage.setItem('gym_tracker_data', JSON.stringify(defaultDevices));

let devices = JSON.parse(localStorage.getItem('gym_tracker_data')) || defaultDevices;

// Hauptseite rendern
function renderGrid() {
    const grid = document.getElementById('device-grid');
    grid.innerHTML = '';
    devices.forEach(d => {
        grid.innerHTML += `
            <div class="card" onclick="openModal(${d.id})">
                <img src="${d.image}" alt="${d.name}" onerror="this.src='https://placeholder.com'">
                <p>${d.name}</p>
                <span class="badge">${d.muscle} (${d.type})</span>
            </div>
        `;
    });
}

// Modal öffnen & Daten laden
function openModal(id) {
    const device = devices.find(d => d.id === id);
    document.getElementById('active-device-id').value = id;
    document.getElementById('modal-title').innerText = device.name;
    document.getElementById('modal-meta').innerText = `Muskelgruppe: ${device.muscle} | Typ: ${device.type}`;
    
    // Standardwerte im Formular zurücksetzen
    document.getElementById('set1').value = 12;
    document.getElementById('set2').value = 12;
    document.getElementById('set3').value = 12;
    document.getElementById('additional-info').value = 'kein'; // Setzt die Zusatzinfo auf den Standardwert

    // Letztes Gewicht vorschlagen (falls vorhanden)
    document.getElementById('weight').value = device.history[0]?.weight || ''; 

    // Tage seit letztem Training berechnen
    const daysLabel = document.getElementById('last-trained-days');
    if(device.history && device.history.length > 0) {
        const lastDate = new Date(device.history[0].date);
        const diffTime = Math.abs(new Date() - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
        daysLabel.innerText = `Letztes Training: Vor ${diffDays} Tag(en) (${lastDate.toLocaleDateString()})`;
    } else {
        daysLabel.innerText = "Noch nie mit diesem Gerät trainiert.";
    }

    // Historie anzeigen
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';
    device.history.forEach(h => {
        // Prüft, ob eine Info existiert und ungleich 'kein' ist, um sie anzuzeigen
        const infoText = (h.info && h.info !== 'kein') ? ` | Info: ${h.info}` : '';

        historyContainer.innerHTML += `
            <div class="history-item">
                <strong>${new Date(h.date).toLocaleDateString()}</strong> - ${h.weight} kg${infoText}<br>
                Sätze: ${h.sets.join(' / ')} (Wdh.)
            </div>
        `;
    });

    // Macht das Modal-Fenster sichtbar
    document.getElementById('details-modal').style.display = 'flex';
}


function closeModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Workout abspeichern
function saveWorkout(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('active-device-id').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const s1 = parseInt(document.getElementById('set1').value);
    const s2 = parseInt(document.getElementById('set2').value);
    const s3 = parseInt(document.getElementById('set3').value);
    const info = document.getElementById('additional-info').value; // NEU: Wert auslesen
    
    const deviceIndex = devices.findIndex(d => d.id === id);
    
    // Neuen Eintrag erstellen
    const newEntry = {
        date: new Date().toISOString(),
        weight: weight,
        sets: [s1, s2, s3],
        info: info // NEU: In das Trainings-Objekt abspeichern
    };
    
    
    // Den neuen Eintrag ganz OBEN in die Historie einfügen (damit das aktuellste oben steht)
    devices[deviceIndex].history.unshift(newEntry);
    
    // LocalStorage aktualisieren
    localStorage.setItem('gym_tracker_data', JSON.stringify(devices));
    
    // Ansichten aktualisieren und Fenster schließen
    closeModal();
    renderGrid();
}

// App beim Starten initialisieren
renderGrid();
