// ==============================================
// Inisialisasi elemen dan variabel utama
const site = document.body;// elemen body dari site tsb
const alarm = document.getElementById("alarm"); // elemen untuk mendeteksi alarm
const display = document.getElementById("Number"); // Elemen untuk menampilkan waktu
let time = [0, 0, 0, 0]; // [Jam, Menit, Detik, Milidetik/10]
let timerInterval; // Variabel untuk menyimpan ID interval timer
let blinkInterval; // Variabel untuk menyimpan ID interval Blink
let mili = 0; // Total waktu dalam milidetik
let isBlinking = false;

// Fungsi untuk mereset timer
function reset() {
    clearInterval(timerInterval); // Hentikan interval yang berjalan
    time = [0, 0, 0, 0]; // Reset array waktu
    mili = 0; // Reset total milidetik
    updateDisplay(); // Perbarui tampilan ke 0
    stopAlarm();
}

function pause(){
    clearInterval(timerInterval)
    updateDisplay()
    stopAlarm();
}

// Fungsi untuk menambahkan atau mengurangi menit
function adjustMinutes(num) {
    time[1] += num; // Tambahkan nilai ke menit
    if (time[1] > 59) {
        time[0]++; // Tambahkan ke jam jika menit lebih dari 59
        time[1] = 0; // Reset menit
    } else if (time[1] < 0) {
        if (time[0] > 0){
            time[1] = 59 + num;
            time[0] = 0;
        }
        else if (time[0] == 0){
            time[1] = 0;
        }
    }
    updateDisplay(); // Perbarui tampilan
}

// Fungsi untuk memulai timer
function start() {
    if (time[1] != 0 || mili != 0){
        stopAlarm();
        mili = convertTimeToMilliseconds(time); // Konversi array waktu ke milidetik
        timerInterval = setInterval(mainLoop, 10); // Jalankan fungsi utama setiap 10ms
    }
}

// Fungsi utama untuk mengurangi waktu
function mainLoop() {
    if (mili <= 0) {
        reset(); // Reset jika waktu habis
        playAlarm()
        return;
    }
    mili -= 10; // Kurangi 10ms
    time = convertMillisecondsToTime(mili); // Perbarui array waktu berdasarkan milidetik
    updateDisplay(); // Perbarui tampilan
}

// Fungsi untuk menampilkan waktu
function updateDisplay() {
    const [hours, minutes, seconds, milliseconds] = time.map((unit) =>
        String(unit).padStart(2, "0")
    ); // Format setiap unit waktu ke 2 digit
    display.textContent = `${hours}:${minutes}:${seconds}:${milliseconds}`; // Tampilkan waktu
}

// Fungsi utilitas untuk mengonversi array waktu ke milidetik
function convertTimeToMilliseconds([hours, minutes, seconds, milliseconds]) {
    return (
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000 +
        milliseconds * 10
    );
}

// Fungsi utilitas untuk mengonversi milidetik ke array waktu
function convertMillisecondsToTime(mili) {
    const hours = Math.floor(mili / (1000 * 60 * 60));
    const minutes = Math.floor((mili / (1000 * 60)) % 60);
    const seconds = Math.floor((mili / 1000) % 60);
    const milliseconds = Math.floor((mili % 1000) / 10);
    return [hours, minutes, seconds, milliseconds];
}

//fungsi memulai alarm
function playAlarm(){
    alarm.play();
    if (!isBlinking){
        isBlinking = true;
        blinkInterval = setInterval(() => {
            site.style.backgroundColor = (site.style.backgroundColor === "black") ? "whitesmoke" : "black";
            console.log("Toggled background color");
        }, 200); // Change color every 500ms
    }
    } // Prevent multiple intervals
            

function stopAlarm(){
    alarm.pause(); // Pause the audio
    alarm.currentTime = 0; // Reset playback position to the start
    clearInterval(blinkInterval);
    isBlinking = false;
    site.style.backgroundColor = "whitesmoke";
}


// Save State to LocalStorage
function saveState() {
    const state = {
        mili,
        isRunning: !!timerInterval,
        lastTimestamp: Date.now(),
    };
    localStorage.setItem("timerState", JSON.stringify(state));
}

// Restore State from LocalStorage
function restoreState() {
    const savedState = localStorage.getItem("timerState");
    if (savedState) {
        const { mili: savedMili, isRunning, lastTimestamp } = JSON.parse(savedState);
        const elapsed = Date.now() - lastTimestamp;
        mili = Math.max(savedMili - elapsed, 0);
        time = convertMillisecondsToTime(mili);
        updateDisplay();

        if (isRunning && mili > 0) {
            start();
        }
    }
}

window.addEventListener("beforeunload", saveState);
window.addEventListener("load", restoreState);