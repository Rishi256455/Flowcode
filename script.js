// ========== Navigation ==========
const navHome = document.getElementById('nav-home');
const navC2F = document.getElementById('nav-code2flow');
const navF2C = document.getElementById('nav-flow2code');
const homePanel = document.getElementById('home-panel');
const panelC2F = document.getElementById('code2flow');
const panelF2C = document.getElementById('flow2code');
const panelSignin = document.getElementById('signin');
const panelSignup = document.getElementById('signup');

function hideAll() {
  [homePanel, panelC2F, panelF2C, panelSignin, panelSignup]
    .forEach(el => el.classList.add('hidden'));
}
function show(panel) {
  hideAll();
  if (panel === 'home') homePanel.classList.remove('hidden');
  if (panel === 'c2f') panelC2F.classList.remove('hidden');
  if (panel === 'f2c') panelF2C.classList.remove('hidden');
  if (panel === 'signin') panelSignin.classList.remove('hidden');
  if (panel === 'signup') panelSignup.classList.remove('hidden');
}
show('home');

navHome.onclick = e => { e.preventDefault(); show('home'); };
navC2F.onclick = e => { e.preventDefault(); show('c2f'); };
navF2C.onclick = e => { e.preventDefault(); show('f2c'); };
document.getElementById('btn-to-code2flow').onclick = () => show('c2f');
document.getElementById('btn-to-flow2code').onclick = () => show('f2c');

// Sign-in/up
document.getElementById('btn-signin-top').onclick = () => show('signin');
document.getElementById('btn-signup-top').onclick = () => show('signup');
document.getElementById('signin-cancel').onclick = () => show('home');
document.getElementById('signup-cancel').onclick = () => show('home');
document.getElementById('signin-submit').onclick = () => {
  alert('Sign in simulated — no backend in this demo.');
  show('home');
};
document.getElementById('signup-submit').onclick = () => {
  alert('Account created (simulated).');
  show('home');
};

// ========== Code → Flowchart ==========
const codeEditor = document.getElementById('code-editor');
const flowSvg = document.getElementById('flow-svg');
document.getElementById('btn-parse').addEventListener('click', parseCodeAndRender);
// Continue from: function parseCodeAndRender()
function parseCodeAndRender() {
  const code = codeEditor.value.trim();
  if (!code) {
    alert('Please paste or write some code first.');
    return;
  }

  // Clear previous chart
  flowSvg.innerHTML = '';

  // Split code into lines (very naive parser)
  const lines = code.split('\n').map(l => l.trim()).filter(l => l);

  const nodeHeight = 40;
  const spacing = 60;
  let y = 30;

  lines.forEach((line, i) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    rect.setAttribute('x', 40);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 260);
    rect.setAttribute('height', nodeHeight);
    rect.setAttribute('rx', 8);
    rect.setAttribute('class', 'node-rect');

    text.setAttribute('x', 60);
    text.setAttribute('y', y + 25);
    text.setAttribute('class', 'node-text');
    text.textContent = line.length > 36 ? line.slice(0, 36) + '…' : line;

    group.appendChild(rect);
    group.appendChild(text);
    flowSvg.appendChild(group);

    if (i > 0) {
      const prevY = y - spacing + nodeHeight;
      const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineEl.setAttribute('x1', 170);
      lineEl.setAttribute('y1', prevY + 10);
      lineEl.setAttribute('x2', 170);
      lineEl.setAttribute('y2', y - 10);
      lineEl.setAttribute('class', 'arrow');
      flowSvg.appendChild(lineEl);
    }
    y += spacing;
  });
}

// Clear code
document.getElementById('btn-clear-code').onclick = () => {
  codeEditor.value = '';
  flowSvg.innerHTML = '';
};

// ========== Flowchart → Code ==========
const drawSvg = document.getElementById('draw-svg');
const codeOutput = document.getElementById('code-output');
let nodes = [];
let connections = [];
let selectedNodes = [];

function addNode(type) {
  const id = 'n' + Math.random().toString(36).slice(2, 7);
  const x = 60 + nodes.length * 30;
  const y = 40 + nodes.length * 60;

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('data-id', id);
  group.setAttribute('transform', `translate(${x},${y})`);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', 140);
  rect.setAttribute('height', 50);
  rect.setAttribute('rx', 10);
  rect.setAttribute('class', 'node-rect');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', 10);
  text.setAttribute('y', 28);
  text.setAttribute('class', 'node-text');
  text.textContent = type;

  group.appendChild(rect);
  group.appendChild(text);
  drawSvg.appendChild(group);

  nodes.push({ id, type, textEl: text, group });

  // Select / edit
  group.addEventListener('click', e => {
    e.stopPropagation();
    if (selectedNodes.includes(id)) {
      selectedNodes = selectedNodes.filter(n => n !== id);
      rect.setAttribute('stroke', '#cbd5e1');
      rect.setAttribute('stroke-width', '1');
    } else {
      selectedNodes.push(id);
      rect.setAttribute('stroke', '#0ea5a8');
      rect.setAttribute('stroke-width', '2');
    }
  });

  group.addEventListener('dblclick', () => {
    const newText = prompt('Edit node text:', text.textContent);
    if (newText !== null) text.textContent = newText;
  });
}

document.getElementById('add-start').onclick = () => addNode('Start');
document.getElementById('add-process').onclick = () => addNode('Process');
document.getElementById('add-decision').onclick = () => addNode('Decision');

document.getElementById('connect-selected').onclick = () => {
  if (selectedNodes.length !== 2) {
    alert('Select exactly two nodes to connect.');
    return;
  }
  const [a, b] = selectedNodes.map(id => nodes.find(n => n.id === id));
  const aTransform = a.group.getAttribute('transform').match(/translate\((.*?),(.*?)\)/);
  const bTransform = b.group.getAttribute('transform').match(/translate\((.*?),(.*?)\)/);
  const ax = parseFloat(aTransform[1]) + 70;
  const ay = parseFloat(aTransform[2]) + 50;
  const bx = parseFloat(bTransform[1]) + 70;
  const by = parseFloat(bTransform[2]);

  const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineEl.setAttribute('x1', ax);
  lineEl.setAttribute('y1', ay);
  lineEl.setAttribute('x2', bx);
  lineEl.setAttribute('y2', by);
  lineEl.setAttribute('class', 'arrow');
  drawSvg.appendChild(lineEl);

  connections.push({ from: a.id, to: b.id });
  selectedNodes = [];
  nodes.forEach(n =>
    n.group.querySelector('rect').setAttribute('stroke', '#cbd5e1')
  );
};

document.getElementById('btn-clear-canvas').onclick = () => {
  drawSvg.innerHTML = '';
  nodes = [];
  connections = [];
  selectedNodes = [];
  codeOutput.textContent = '';
};

document.getElementById('btn-generate-code').onclick = () => {
  const lang = document.getElementById('lang-flow2code').value;
  let code = '';
  nodes.forEach(n => {
    const line = n.textEl.textContent;
    if (n.type === 'Start') code += startTemplate(lang);
    else if (n.type === 'Decision') code += decisionTemplate(line, lang);
    else code += processTemplate(line, lang);
  });
  codeOutput.textContent = code;
};

function startTemplate(lang) {
  if (lang === 'python') return '# Start of program\n';
  if (lang === 'java') return 'public class Main {\n  public static void main(String[] args) {\n';
  return '// Start of program\n';
}
function processTemplate(line, lang) {
  if (lang === 'python') return `  ${line}\n`;
  if (lang === 'java') return `    ${line};\n`;
  return `  ${line};\n`;
}
function decisionTemplate(line, lang) {
  if (lang === 'python') return `  if ${line}:\n    pass\n`;
  if (lang === 'java') return `    if (${line}) {\n      // ...\n    }\n`;
  return `  if (${line}) {\n    // ...\n  }\n`;
}

