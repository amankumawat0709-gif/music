// Aman Music - Local HTML Player
const audio = document.getElementById('audio');
const libraryEl = document.getElementById('library');
const queueEl = document.getElementById('queue');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const artEl = document.getElementById('art');
const curEl = document.getElementById('cur');
const durEl = document.getElementById('dur');
const seekEl = document.getElementById('seek');
const volEl = document.getElementById('vol');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const searchInput = document.getElementById('search');
const folderInput = document.getElementById('folder');
const addFilesBtn = document.getElementById('addFiles');
const filesInput = document.getElementById('files');

let tracks = []; // {name, url, size}
let queue = [];
let index = -1;
let shuffle = false;
let repeat = 'off'; // off | one | all

function fmtTime(s){
  s = Math.floor(s || 0);
  const m = Math.floor(s/60);
  const r = String(s%60).padStart(2,'0');
  return `${m}:${r}`;
}

function initialsFrom(name){
  const base = name.replace(/\.[^/.]+$/,'').trim();
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if(parts.length === 0) return "AM";
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderLibrary(list){
  libraryEl.innerHTML = '';
  list.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="artwork">${initialsFrom(t.name)}</div>
      <div class="track-title" title="${t.name}">${t.name}</div>
      <div class="track-sub">${(t.size/1024/1024).toFixed(1)} MB</div>
    `;
    card.onclick = () => addToQueueAndPlay(i);
    libraryEl.appendChild(card);
  });
}

function renderQueue(){
  queueEl.innerHTML = '';
  queue.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = i === index ? 'active' : '';
    li.innerHTML = `<div class="art">${initialsFrom(t.name)}</div><div>${t.name}</div>`;
    li.onclick = () => playAt(i);
    queueEl.appendChild(li);
  });
}

function loadAndPlay(t){
  audio.src = t.url;
  audio.play().catch(()=>{});
  titleEl.textContent = t.name;
  artistEl.textContent = 'Local file';
  artEl.textContent = initialsFrom(t.name);
  playBtn.textContent = '⏸';
}

function addToQueueAndPlay(libIndex){
  const t = tracks[libIndex];
  queue.push(t);
  index = queue.length - 1;
  renderQueue();
  loadAndPlay(t);
  persistState();
}

function playAt(i){
  index = i;
  renderQueue();
  loadAndPlay(queue[index]);
  persistState();
}

function next(){
  if(queue.length === 0) return;
  if(repeat === 'one'){ return loadAndPlay(queue[index]); }
  if(shuffle){
    index = Math.floor(Math.random()*queue.length);
  }else{
    index = (index + 1) % queue.length;
    if(index === 0 && repeat === 'off') { audio.pause(); playBtn.textContent='⏯'; return; }
  }
  renderQueue();
  loadAndPlay(queue[index]);
  persistState();
}

function prev(){
  if(queue.length === 0) return;
  if(audio.currentTime > 3){ audio.currentTime = 0; return; }
  index = (index - 1 + queue.length) % queue.length;
  renderQueue();
  loadAndPlay(queue[index]);
  persistState();
}

playBtn.onclick = () => {
  if(audio.paused){ audio.play(); playBtn.textContent='⏸'; } else { audio.pause(); playBtn.textContent='⏯'; }
};
nextBtn.onclick = next;
prevBtn.onclick = prev;

shuffleBtn.onclick = () => {
  shuffle = !shuffle;
  shuffleBtn.style.outline = shuffle ? '2px solid var(--accent)' : 'none';
  persistState();
};

repeatBtn.onclick = () => {
  repeat = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
  repeatBtn.textContent = repeat === 'one' ? '🔂' : '🔁';
  repeatBtn.style.outline = repeat !== 'off' ? '2px solid var(--accent)' : 'none';
  persistState();
};

audio.addEventListener('timeupdate', () => {
  seekEl.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  curEl.textContent = fmtTime(audio.currentTime);
  durEl.textContent = fmtTime(audio.duration || 0);
});
seekEl.oninput = () => {
  if(!isFinite(audio.duration)) return;
  audio.currentTime = (seekEl.value / 100) * audio.duration;
};

volEl.oninput = () => audio.volume = parseFloat(volEl.value);

audio.addEventListener('ended', () => {
  if(repeat === 'one'){ loadAndPlay(queue[index]); return; }
  if(repeat === 'all' || shuffle || index < queue.length - 1){ next(); }
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  const list = tracks.filter(t => t.name.toLowerCase().includes(q));
  renderLibrary(list);
});

// Folder picking
folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  addTracks(files);
});
addFilesBtn.onclick = () => filesInput.click();
filesInput.onchange = (e) => {
  const files = Array.from(e.target.files || []);
  addTracks(files);
};

function addTracks(files){
  const supported = ['.mp3','.m4a','.wav','.ogg'];
  const fresh = files.filter(f => supported.some(ext => f.name.toLowerCase().endsWith(ext)));
  fresh.forEach(f => {
    const url = URL.createObjectURL(f);
    tracks.push({ name: f.name, url, size: f.size });
  });
  tracks.sort((a,b)=> a.name.localeCompare(b.name));
  renderLibrary(tracks);
  persistState();
}

// Persist lightweight state
function persistState(){
  const state = {
    queueNames: queue.map(t => t.name),
    current: index,
    shuffle, repeat, vol: audio.volume, title: titleEl.textContent
  };
  localStorage.setItem('aman-music-state', JSON.stringify(state));
}

function restoreState(){
  try{
    const s = JSON.parse(localStorage.getItem('aman-music-state') || '{}');
    shuffle = !!s.shuffle;
    repeat = s.repeat || 'off';
    volEl.value = s.vol ?? 1; audio.volume = parseFloat(volEl.value);
    shuffleBtn.style.outline = shuffle ? '2px solid var(--accent)' : 'none';
    repeatBtn.textContent = repeat === 'one' ? '🔂' : '🔁';
    repeatBtn.style.outline = repeat !== 'off' ? '2px solid var(--accent)' : 'none';
  }catch(e){}
}
restoreState();

// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  if(e.target.matches('input')) return;
  if(e.code === 'Space'){ e.preventDefault(); playBtn.click(); }
  if(e.code === 'ArrowRight'){ next(); }
  if(e.code === 'ArrowLeft'){ prev(); }
});

// Nice: allow dropping files onto the grid
document.addEventListener('dragover', e => { e.preventDefault(); });
document.addEventListener('drop', e => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files || []);
  addTracks(files);
});
