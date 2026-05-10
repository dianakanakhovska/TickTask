let todos = JSON.parse(localStorage.getItem('todos')) || [];
let filter = 'all';

const list = document.getElementById('list');
const input = document.getElementById('input');
const search = document.getElementById('search');

function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
    list.innerHTML = '';

    let data = todos
        .filter(t => filter==='all'||(filter==='active'&&!t.done)||(filter==='done'&&t.done))
        .filter(t => t.text.toLowerCase().includes(search.value.toLowerCase()));

    document.getElementById('empty').style.display = data.length?'none':'block';

    data.forEach(t => {
        const li = document.createElement('li');
        li.className = `${t.done?'done':''} prio-${t.priority}`;

        if(t.deadline && new Date(t.deadline)<new Date()) {
            li.classList.add('overdue');
        }

        li.innerHTML = `
            <input type="checkbox" ${t.done?'checked':''}>
            <span>${t.text}</span>
            <div class="actions">
                <button>✏️</button>
                <button>🗑</button>
            </div>
        `;

        li.querySelector('input').onclick = () => {
            t.done=!t.done;
            save(); render();
        };

        li.querySelectorAll('button')[0].onclick = () => {
            const txt = prompt('Edit', t.text);
            if(txt){t.text=txt; save(); render();}
        };

        li.querySelectorAll('button')[1].onclick = () => {
            todos = todos.filter(x=>x.id!==t.id);
            save(); render();
        };

        list.appendChild(li);
    });
}

/* ADD */
document.getElementById('form').onsubmit = e=>{
    e.preventDefault();

    todos.unshift({
        id:Date.now(),
        text:input.value,
        done:false,
        priority:document.getElementById('priority').value,
        deadline:document.getElementById('deadline').value
    });

    input.value='';
    save(); render();
};

/* FILTER */
document.querySelectorAll('.filters button').forEach(b=>{
    b.onclick=()=>{
        filter=b.dataset.f;
        document.querySelector('.active').classList.remove('active');
        b.classList.add('active');
        render();
    };
});

search.oninput = render;

/* THEME */
document.getElementById('theme').onclick = ()=>{
    document.body.classList.toggle('light');
};

/* TIMER */
let time=1500;
let total=time;
let interval;

const display = document.getElementById('time');
const inputTime = document.getElementById('time-input');

function update(){
    let m=Math.floor(time/60), s=time%60;
    display.innerText=`${m}:${s<10?'0':''}${s}`;

    document.getElementById('progress-bar').style.width =
        ((total-time)/total)*100 + '%';
}

display.onclick=()=>{
    if(interval) return;

    display.style.display='none';
    inputTime.classList.remove('hidden');

    inputTime.value=Math.floor(time/60);
    inputTime.focus();
};

inputTime.onblur=saveTime;
inputTime.onkeydown=e=>{
    if(e.key==='Enter') saveTime();
};

function saveTime(){
    let val=parseInt(inputTime.value);
    if(val>0){
        time=val*60;
        total=time;
        update();
    }
    inputTime.classList.add('hidden');
    display.style.display='block';
}

/* MODES */
const modes={focus:25, short:5, long:15};

document.querySelectorAll('.mode-btn').forEach(btn=>{
    btn.onclick=()=>{
        document.querySelector('.mode-btn.active').classList.remove('active');
        btn.classList.add('active');

        time=modes[btn.dataset.mode]*60;
        total=time;
        update();
    };
});

/* START */
document.getElementById('start').onclick=()=>{
    if(interval){
        clearInterval(interval);
        interval=null;
        return;
    }

    interval=setInterval(()=>{
        time--;
        update();

        if(time<=0){
            clearInterval(interval);
            interval=null;
            toast('Сесія завершена 🔥');
            time=total;
        }
    },1000);
};

document.getElementById('reset').onclick=()=>{
    clearInterval(interval);
    interval=null;
    time=total;
    update();
};

/* TOAST */
function toast(msg){
    const t=document.createElement('div');
    t.className='toast';
    t.innerText=msg;
    document.body.appendChild(t);

    setTimeout(()=>t.remove(),2000);
}

update();
render();