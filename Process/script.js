// ===================================== 
// Data Storage
// ===================================== 
let processes = [];
let processCount = 0;

// ===================================== 
// Process Class
// ===================================== 
class Process {
    constructor() {
        this.soONhoCapPhat = 0;
        this.tongONhoSuDung = 0;
        this.trangThai = {
            state: "RUNNING",
            lyDo: "Normal"
        };
    }

    kiemTraQuaTai(index) {
        const phanTramSuDung = this.soONhoCapPhat > 0 
            ? (this.tongONhoSuDung / this.soONhoCapPhat) * 100 
            : 0;

        if (this.tongONhoSuDung > this.soONhoCapPhat) {
            this.trangThai.state = "BLOCKED";
            this.trangThai.lyDo = "Vượt quá bộ nhớ cấp phát";
            return `P[${index}] đang QUÁ TẢI BỘ NHỚ!`;
        } else if (phanTramSuDung >= 80) {
            this.trangThai.state = "RUNNING";
            this.trangThai.lyDo = "⚠️ WARNING - Sử dụng trên 80%";
            return `P[${index}] CẢNH BÁO BỘ NHỚ!`;
        } else {
            this.trangThai.state = "RUNNING";
            this.trangThai.lyDo = "Normal";
            return `P[${index}] bình thường.`;
        }
    }

    getInfo(index) {
        return {
            index: index,
            soONhoCapPhat: this.soONhoCapPhat,
            tongONhoSuDung: this.tongONhoSuDung,
            state: this.trangThai.state,
            lyDo: this.trangThai.lyDo
        };
    }
}

// ===================================== 
// Event Handlers
// ===================================== 
function handleGenerateProcesses() {
    const input = document.getElementById('processCount');
    if (!input) {
        console.error('Process count input not found');
        return;
    }
    
    const count = parseInt(input.value);

    // Validation
    if (!count || count < 1 || count > 10 || !Number.isInteger(count)) {
        alert('Vui lòng nhập từ 1 đến 10 processes');
        return;
    }

    processCount = count;
    processes = [];

    for (let i = 0; i < count; i++) {
        processes.push(new Process());
    }

    const inputSection = document.getElementById('processInputSection');
    if (!inputSection) {
        console.error('Process input section not found');
        return;
    }
    
    inputSection.style.display = 'block';
    generateProcessInputs();
    requestAnimationFrame(() => inputSection.scrollIntoView({ behavior: 'smooth' }));
}

function generateProcessInputs() {
    const container = document.getElementById('processInputContainer');
    if (!container) {
        console.error('Process input container not found');
        return;
    }
    
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < processCount; i++) {
        const item = document.createElement('div');
        item.className = 'process-input-item';
        
        const label1 = document.createElement('label');
        label1.textContent = `Số ô nhớ cấp phát P[${i + 1}]:`;
        
        const input1 = document.createElement('input');
        input1.type = 'number';
        input1.id = `capPhat_${i}`;
        input1.min = '0';
        input1.placeholder = 'VD: 100';
        
        const label2 = document.createElement('label');
        label2.textContent = `Tổng số ô nhớ sử dụng P[${i + 1}]:`;
        
        const input2 = document.createElement('input');
        input2.type = 'number';
        input2.id = `suDung_${i}`;
        input2.min = '0';
        input2.placeholder = 'VD: 80';
        
        item.appendChild(label1);
        item.appendChild(input1);
        item.appendChild(label2);
        item.appendChild(input2);
        fragment.appendChild(item);
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function handleCheckOverload() {
    for (let i = 0; i < processCount; i++) {
        const capPhatInput = document.getElementById(`capPhat_${i}`);
        const suDungInput = document.getElementById(`suDung_${i}`);

        if (!capPhatInput.value || !suDungInput.value) {
            alert(`Vui lòng nhập đầy đủ thông tin cho P[${i + 1}]`);
            return;
        }

        const capPhat = parseInt(capPhatInput.value);
        const suDung = parseInt(suDungInput.value);

        if (capPhat < 0 || suDung < 0) {
            alert(`Giá trị không hợp lệ cho P[${i + 1}]. Nhập số dương`);
            return;
        }

        processes[i].soONhoCapPhat = capPhat;
        processes[i].tongONhoSuDung = suDung;
    }

    executeMemoryManagement();
}

function executeMemoryManagement() {
    const executionSection = document.getElementById('executionSection');
    executionSection.style.display = 'block';

    const executionLog = document.getElementById('executionLog');
    let logContent = '';

    logContent += '═══════════════════════════════════════════════════════════\n';
    logContent += '          PROCESS MEMORY MANAGEMENT EXECUTION\n';
    logContent += '═══════════════════════════════════════════════════════════\n\n';

    logContent += '[NHẬP DỮ LIỆU]\n';
    logContent += '───────────────────────────────────────────────────────────\n';
    for (let i = 0; i < processCount; i++) {
        logContent += `P[${i + 1}] Cấp phát: ${processes[i].soONhoCapPhat} | Sử dụng: ${processes[i].tongONhoSuDung}\n`;
    }
    logContent += '\n';

    logContent += '[KIỂM TRA QUÁ TẢI]\n';
    logContent += '───────────────────────────────────────────────────────────\n';
    for (let i = 0; i < processCount; i++) {
        const message = processes[i].kiemTraQuaTai(i + 1);
        logContent += message + '\n';
    }
    logContent += '\n';

    logContent += '[DANH SÁCH PROCESS]\n';
    logContent += '───────────────────────────────────────────────────────────\n';
    for (let i = 0; i < processCount; i++) {
        const p = processes[i];
        logContent += `P[${i + 1}]: Cấp=${p.soONhoCapPhat} | Dùng=${p.tongONhoSuDung} | Trạng=${p.trangThai.state}\n`;
    }
    logContent += '\n═══════════════════════════════════════════════════════════\n';
    logContent += 'THỰC HIỆN HOÀN THÀNH\n';
    logContent += '═══════════════════════════════════════════════════════════\n';

    executionLog.textContent = logContent;
    requestAnimationFrame(() => executionLog.scrollIntoView({ behavior: 'smooth' }));

    displayResults();
    displayWarnings();
    displayStatistics();
    document.getElementById('controlSection').style.display = 'flex';
}

function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('processResults');
    
    if (!resultsSection || !resultsContainer) {
        console.error('Results section not found');
        return;
    }
    
    resultsSection.style.display = 'block';

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < processCount; i++) {
        const p = processes[i];
        const info = p.getInfo(i + 1);

        const card = document.createElement('div');
        card.className = `process-card ${info.state.toLowerCase()}`;

        const statusClass = info.state === 'RUNNING' ? 'status-running' : 'status-blocked';
        const statusText = info.state === 'RUNNING' ? '✓ RUNNING' : '✗ BLOCKED';

        const header = document.createElement('div');
        header.className = 'process-card-header';
        
        const name = document.createElement('div');
        name.className = 'process-name';
        name.textContent = `P[${info.index}]`;
        
        const status = document.createElement('div');
        status.className = `process-status ${statusClass}`;
        status.textContent = statusText;
        
        header.appendChild(name);
        header.appendChild(status);

        const details = document.createElement('div');
        details.className = 'process-details';

        const usedPercentage = info.soONhoCapPhat > 0 
            ? ((info.tongONhoSuDung / info.soONhoCapPhat) * 100).toFixed(2)
            : '0';
        
        const rows = [
            ['Cấp phát:', `${info.soONhoCapPhat} unit`],
            ['Sử dụng:', `${info.tongONhoSuDung} unit`],
            ['Sử dụng %:', `${usedPercentage}%`],
            ['Lý do:', info.lyDo]
        ];

        for (const [label, value] of rows) {
            const row = document.createElement('div');
            row.className = 'detail-row';
            
            const labelEl = document.createElement('span');
            labelEl.className = 'detail-label';
            labelEl.textContent = label;
            
            const valueEl = document.createElement('span');
            valueEl.className = 'detail-value';
            valueEl.textContent = value;
            
            row.appendChild(labelEl);
            row.appendChild(valueEl);
            details.appendChild(row);
        }

        card.appendChild(header);
        card.appendChild(details);
        fragment.appendChild(card);
    }

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(fragment);
    requestAnimationFrame(() => resultsSection.scrollIntoView({ behavior: 'smooth' }));
}

function displayWarnings() {
    const warningsSection = document.getElementById('warningsSection');
    const warningsList = document.getElementById('warningsList');
    
    if (!warningsSection || !warningsList) {
        console.error('Warnings section not found');
        return;
    }
    
    const warnings = [];
    for (let i = 0; i < processCount; i++) {
        const p = processes[i];
        const phanTramSuDung = p.soONhoCapPhat > 0 
            ? (p.tongONhoSuDung / p.soONhoCapPhat) * 100 
            : 0;

        if (phanTramSuDung >= 80 && p.tongONhoSuDung <= p.soONhoCapPhat) {
            warnings.push({
                index: i + 1,
                percentage: phanTramSuDung.toFixed(2),
                allocated: p.soONhoCapPhat,
                used: p.tongONhoSuDung
            });
        }
    }

    if (warnings.length === 0) {
        warningsSection.style.display = 'none';
        return;
    }

    warningsSection.style.display = 'block';
    const fragment = document.createDocumentFragment();

    for (const warning of warnings) {
        const warningItem = document.createElement('div');
        warningItem.className = 'warning-item';
        warningItem.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
                <div class="warning-title">P[${warning.index}] - Sử dụng ${warning.percentage}%</div>
                <div class="warning-detail">Cấp phát: ${warning.allocated} unit | Sử dụng: ${warning.used} unit</div>
                <div class="warning-message">Bộ nhớ đang sử dụng trên 80%, cần theo dõi!</div>
            </div>
        `;
        fragment.appendChild(warningItem);
    }

    warningsList.innerHTML = '';
    warningsList.appendChild(fragment);
    requestAnimationFrame(() => warningsSection.scrollIntoView({ behavior: 'smooth' }));
}

function displayStatistics() {
    const statsSection = document.getElementById('statisticsSection');
    if (!statsSection) {
        console.error('Statistics section not found');
        return;
    }
    
    statsSection.style.display = 'block';

    let runningCount = 0;
    let blockedCount = 0;
    let totalAllocated = 0;

    for (let i = 0; i < processCount; i++) {
        if (processes[i].trangThai.state === 'RUNNING') {
            runningCount++;
        } else {
            blockedCount++;
        }
        totalAllocated += processes[i].soONhoCapPhat;
    }

    const overloadRate = processCount > 0 
        ? ((blockedCount / processCount) * 100).toFixed(2) 
        : '0';

    const runCountEl = document.getElementById('runningCount');
    const blockCountEl = document.getElementById('blockedCount');
    const overloadEl = document.getElementById('overloadRate');
    const memoryEl = document.getElementById('totalMemory');
    
    if (runCountEl) runCountEl.textContent = runningCount;
    if (blockCountEl) blockCountEl.textContent = blockedCount;
    if (overloadEl) overloadEl.textContent = overloadRate + '%';
    if (memoryEl) memoryEl.textContent = totalAllocated + ' unit';
}

function handleReset() {
    processes = [];
    processCount = 0;
    document.getElementById('processCount').value = '';
    document.getElementById('processInputSection').style.display = 'none';
    document.getElementById('executionSection').style.display = 'none';
    document.getElementById('warningsSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('statisticsSection').style.display = 'none';
    document.getElementById('controlSection').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadReport() {
    let content = 'PROCESS MEMORY MANAGEMENT REPORT\n';
    content += '='.repeat(60) + '\n\n';
    content += 'PROCESS DETAILS:\n';
    content += '-'.repeat(60) + '\n';

    for (let i = 0; i < processCount; i++) {
        const p = processes[i];
        content += `\nP[${i + 1}]:\n  Cấp phát: ${p.soONhoCapPhat}\n`;
        content += `  Sử dụng: ${p.tongONhoSuDung}\n`;
        content += `  Trạng thái: ${p.trangThai.state}\n`;
        content += `  Lý do: ${p.trangThai.lyDo}\n`;
    }

    content += '\n' + '='.repeat(60) + '\n';
    content += 'STATISTICS:\n' + '-'.repeat(60) + '\n';

    let running = 0, blocked = 0, total = 0;
    for (let i = 0; i < processCount; i++) {
        if (processes[i].trangThai.state === 'RUNNING') running++;
        else blocked++;
        total += processes[i].soONhoCapPhat;
    }

    content += `Running: ${running}\nBlocked: ${blocked}\n`;
    const overloadRate = processCount > 0 
        ? ((blocked / processCount) * 100).toFixed(2) 
        : '0';
    content += `Overload: ${overloadRate}%\n`;
    content += `Total Memory: ${total} unit\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'process_memory_report.txt';
    link.click();
}
