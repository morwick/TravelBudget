/**
 * TravelBudget SPA - 3-Tab RBAC Edition
 * Author: Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Config ---
    const SUPABASE_URL = 'https://zismpmledpjddaczvbjw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppc21wbWxlZHBqZGRhY3p2Ymp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDIyNjgsImV4cCI6MjA4NzI3ODI2OH0.Ibo4frRQpyyG215ubxrcqDY86DAVgZakr0cyQW5QN5M';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- State Management ---
    let transactions = [];
    let categories = [];
    let globalBudget = 10000000;
    let isAdmin = false;
    let currentView = 'overview';

    // --- Data Fetching (Supabase Edition) ---
    async function initData() {
        try {
            const { data, error } = await _supabase
                .from('travel_data')
                .select('payload')
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (data && data.payload) {
                const p = data.payload;
                transactions = p.transactions || [];
                categories = p.categories || [];
                globalBudget = p.global_budget || 10000000;
            } else {
                // Fallback if table is empty
                transactions = [];
                categories = [
                    { id: '1', name: 'Makan', budget: 1000000, icon: 'utensils' },
                    { id: '2', name: 'Transportasi', budget: 2000000, icon: 'car' },
                    { id: '3', name: 'Penginapan', budget: 5000000, icon: 'home' },
                    { id: '4', name: 'Wisata', budget: 2000000, icon: 'map-pin' }
                ];
                globalBudget = 10000000;
                await saveData(true); // Create initial record
            }
        } catch (err) {
            console.error("Supabase load failed:", err);
            // Local fallback logic if needed
        }
        renderAll();
    }

    async function saveData(isInitial = false) {
        const payload = {
            transactions: transactions,
            categories: categories,
            global_budget: globalBudget
        };

        if (lastUpdateDisp) lastUpdateDisp.textContent = 'Menyimpan...';

        try {
            const { error } = await _supabase
                .from('travel_data')
                .upsert({ id: 1, payload: payload });

            if (error) throw error;

            if (lastUpdateDisp) lastUpdateDisp.textContent = 'Simpan Berhasil';
            updateLastTime();
            setTimeout(() => { updateLastTime(); }, 2000);
        } catch (err) {
            console.error("Supabase Save failed:", err);
            if (lastUpdateDisp) lastUpdateDisp.textContent = 'Gagal menyimpan!';
            alert('Gagal menyimpan ke Supabase: ' + err.message);
        }
    }

    // --- DOM Elements ---

    // Navbar & Views
    const navOverview = document.getElementById('nav-overview');
    const navCategories = document.getElementById('nav-categories');
    const navHistory = document.getElementById('nav-history');
    const viewOverview = document.getElementById('view-overview');
    const viewCategories = document.getElementById('view-categories');
    const viewHistory = document.getElementById('view-history');

    // Auth
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const modalLogin = document.getElementById('modal-login');
    const loginPassword = document.getElementById('login-password');
    const btnAuth = document.getElementById('btn-auth');
    const loginError = document.getElementById('login-error');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const adminBadge = document.getElementById('admin-badge');

    // Displays
    const dispGlobalBudget = document.getElementById('disp-global-budget');
    const dispTotalSpent = document.getElementById('disp-total-spent');
    const progGlobal = document.getElementById('prog-global');
    const dispRemaining = document.getElementById('disp-remaining');
    const dispPercent = document.getElementById('disp-percent');
    const dispTrxCount = document.getElementById('disp-trx-count');
    const dispEfficiency = document.getElementById('disp-efficiency');
    const btnEditGlobal = document.getElementById('btn-edit-global');
    const lastUpdateDisp = document.getElementById('last-update');

    // Category Page
    const categoryFullGrid = document.getElementById('category-full-grid');
    const btnAddCategory = document.getElementById('btn-add-category');

    // History Page
    const listActivities = document.getElementById('list-activities');
    const filterCategory = document.getElementById('filter-category');
    const formActivity = document.getElementById('form-activity');
    const editId = document.getElementById('edit-id');
    const inputNama = document.getElementById('input-nama');
    const inputKategori = document.getElementById('input-kategori');
    const inputBiaya = document.getElementById('input-biaya');
    const inputTanggal = document.getElementById('input-tanggal');
    const formTitle = document.getElementById('form-title');
    const btnSubmit = document.getElementById('btn-submit');
    const btnCancel = document.getElementById('btn-cancel');
    const btnReport = document.getElementById('btn-report');

    // Modals
    const modalGlobalBudget = document.getElementById('modal-global-budget');
    const inputGlobalBudget = document.getElementById('input-global-budget');
    const btnSaveGlobalBudget = document.getElementById('btn-save-global-budget');
    const btnCloseGlobal = document.getElementById('btn-close-global');

    const modalCategory = document.getElementById('modal-category');
    const catEditId = document.getElementById('cat-edit-id');
    const inputCatName = document.getElementById('input-cat-name');
    const inputCatLimit = document.getElementById('input-cat-limit');
    const inputCatIcon = document.getElementById('input-cat-icon');
    const btnSaveCategory = document.getElementById('btn-save-category');
    const btnCloseCatModal = document.getElementById('btn-close-cat-modal');
    const modalCatTitle = document.getElementById('modal-cat-title');

    // --- Initialization ---
    initData();

    // --- Core Functions ---


    function updateLastTime() {
        if (lastUpdateDisp) {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
            lastUpdateDisp.textContent = timeStr + " WIB";
        }
    }

    function renderAll() {
        renderOverview();
        renderCategories();
        renderHistory();
        updateFormCategories();
    }

    function switchView(viewName) {
        currentView = viewName;
        [viewOverview, viewCategories, viewHistory].forEach(v => v.classList.remove('active'));
        [navOverview, navCategories, navHistory].forEach(n => {
            n.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
            n.classList.add('text-slate-400');
        });

        const activeView = document.getElementById(`view-${viewName}`);
        const activeNav = document.getElementById(`nav-${viewName}`);

        if (activeView) activeView.classList.add('active');
        if (activeNav) {
            activeNav.classList.remove('text-slate-400');
            activeNav.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
        }

        lucide.createIcons();
    }

    function renderOverview() {
        const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.biaya), 0);
        const remaining = globalBudget - totalSpent;
        const percent = globalBudget > 0 ? (totalSpent / globalBudget) * 100 : 0;

        if (dispGlobalBudget) dispGlobalBudget.textContent = formatIDR(globalBudget);
        if (dispTotalSpent) dispTotalSpent.textContent = formatIDR(totalSpent);
        if (progGlobal) progGlobal.style.width = `${Math.min(percent, 100)}%`;
        if (dispRemaining) dispRemaining.textContent = formatIDR(remaining);
        if (dispPercent) dispPercent.textContent = `${Math.round(percent)}%`;
        if (dispTrxCount) dispTrxCount.textContent = `${transactions.length} Items`;

        if (dispEfficiency) {
            if (percent > 100) {
                dispEfficiency.textContent = 'Limit Exceeded';
                dispEfficiency.className = 'px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100';
                progGlobal.className = 'prog-red h-full rounded-full transition-all duration-1000';
            } else if (percent > 80) {
                dispEfficiency.textContent = 'Warning: Near Limit';
                dispEfficiency.className = 'px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100';
                progGlobal.className = 'prog-orange h-full rounded-full transition-all duration-1000';
            } else {
                dispEfficiency.textContent = 'Normal Spending';
                dispEfficiency.className = 'px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px) font-black uppercase tracking-widest border border-blue-100';
                progGlobal.className = 'prog-blue h-full rounded-full transition-all duration-1000';
            }
        }
    }

    function renderCategories() {
        if (!categoryFullGrid) return;
        categoryFullGrid.innerHTML = '';

        categories.forEach(cat => {
            const used = transactions.filter(t => t.kategori === cat.name).reduce((sum, t) => sum + parseFloat(t.biaya), 0);
            const percent = cat.budget > 0 ? (used / cat.budget) * 100 : 0;
            const isOver = used > cat.budget;

            const card = document.createElement('div');
            card.className = "bg-white p-10 rounded-[3rem] premium-shadow border border-slate-100 relative overflow-hidden group animate-scale-in";
            card.innerHTML = `
                <div class="absolute -right-6 -top-6 text-blue-50/50 opacity-10 group-hover:scale-110 transition-transform">
                    <i data-lucide="${cat.icon || 'tag'}" class="w-32 h-32"></i>
                </div>
                <div class="flex justify-between items-start mb-8 relative z-10">
                    <div class="p-4 bg-slate-50 text-blue-600 rounded-2xl border border-slate-100">
                        <i data-lucide="${cat.icon || 'tag'}" class="w-6 h-6"></i>
                    </div>
                    <div class="admin-only ${isAdmin ? '' : 'hidden'} flex gap-1">
                        <button class="btn-edit-cat p-2 text-slate-300 hover:text-blue-600 transition hover:bg-slate-50 rounded-xl" data-id="${cat.id}">
                            <i data-lucide="edit-3" class="w-5 h-5"></i>
                        </button>
                        <button class="btn-delete-cat p-2 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl" data-id="${cat.id}">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
                <h4 class="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter">${cat.name}</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Limit: ${formatIDR(cat.budget)}</p>
                
                <div class="flex justify-between items-end mb-3">
                    <p class="text-3xl font-black ${isOver ? 'text-red-600' : 'text-slate-800'} tracking-tighter">${formatIDR(used)}</p>
                    <p class="text-[10px] font-black ${isOver ? 'text-red-500' : 'text-slate-400'}">${Math.round(percent)}%</p>
                </div>
                <div class="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-1 border border-slate-100">
                    <div class="${isOver ? 'prog-red' : 'prog-blue'} h-full rounded-full transition-all duration-1000" style="width: ${Math.min(percent, 100)}%"></div>
                </div>
            `;
            categoryFullGrid.appendChild(card);
        });

        lucide.createIcons();
        attachCategoryActionEvents();
    }

    function renderHistory(filter = 'all') {
        if (!listActivities) return;
        listActivities.innerHTML = '';

        let filtered = filter === 'all' ? transactions : transactions.filter(t => t.kategori === filter);
        filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        if (filtered.length === 0) {
            listActivities.innerHTML = `<tr><td colspan="6" class="px-8 py-20 text-center text-slate-200 font-black uppercase tracking-tighter text-2xl opacity-20">No Data</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const cat = categories.find(c => c.name === item.kategori);
            const catUsed = transactions.filter(t => t.kategori === item.kategori).reduce((sum, t) => sum + parseFloat(t.biaya), 0);
            const isOver = cat && catUsed > cat.budget;

            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition-all group";
            tr.innerHTML = `
                <td class="px-10 py-6 font-black text-slate-800 tracking-tight">${item.nama}</td>
                <td class="px-10 py-6">
                    <span class="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">${item.kategori}</span>
                </td>
                <td class="px-10 py-6 text-right font-black text-slate-900">${formatIDR(item.biaya)}</td>
                <td class="px-10 py-6 text-center">
                    <span class="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isOver ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}">
                        ${isOver ? 'Over' : 'Safe'}
                    </span>
                </td>
                <td class="px-10 py-6 text-slate-400 text-[10px] font-bold uppercase tracking-wider">${formatDate(item.tanggal)}</td>
                <td class="admin-only ${isAdmin ? '' : 'hidden'} px-10 py-6 text-center">
                    <div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button class="btn-edit-trx p-2 text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-50" data-id="${item.id}">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button class="btn-delete-trx p-2 text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-50" data-id="${item.id}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            `;
            listActivities.appendChild(tr);
        });

        lucide.createIcons();
        attachTransactionEvents();
    }

    function updateFormCategories() {
        if (!inputKategori || !filterCategory) return;
        const currentFilter = filterCategory.value;
        const currentInput = inputKategori.value;

        inputKategori.innerHTML = '';
        filterCategory.innerHTML = '<option value="all">Semua Kategori</option>';

        categories.sort((a, b) => a.name.localeCompare(b.name)).forEach(cat => {
            const opt1 = document.createElement('option');
            opt1.value = cat.name;
            opt1.textContent = cat.name;
            inputKategori.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = cat.name;
            opt2.textContent = cat.name;
            filterCategory.appendChild(opt2);
        });

        if (categories.some(c => c.name === currentFilter)) filterCategory.value = currentFilter;
        if (categories.some(c => c.name === currentInput)) inputKategori.value = currentInput;
    }

    function formatIDR(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function toggleAdminMode(mode) {
        isAdmin = mode;
        if (mode) {
            btnLogin.classList.add('hidden');
            adminBadge.classList.remove('hidden');
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
            document.querySelectorAll('.user-only').forEach(el => el.classList.add('hidden'));
        } else {
            btnLogin.classList.remove('hidden');
            adminBadge.classList.add('hidden');
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.user-only').forEach(el => el.classList.remove('hidden'));
            resetTrxForm();
        }
        renderAll();
    }

    function resetTrxForm() {
        if (formActivity) {
            formActivity.reset();
            editId.value = '';
            formTitle.innerHTML = `<i data-lucide="plus" class="text-blue-500 w-5 h-5"></i> Input Transaksi`;
            btnSubmit.textContent = 'Simpan Transaksi';
            btnCancel.classList.add('hidden');
            lucide.createIcons();
        }
    }

    // --- Interaction Listeners ---

    navOverview.addEventListener('click', () => switchView('overview'));
    navCategories.addEventListener('click', () => switchView('categories'));
    navHistory.addEventListener('click', () => switchView('history'));

    btnLogin.addEventListener('click', () => { modalLogin.classList.remove('hidden'); loginPassword.focus(); });
    btnCloseLogin.addEventListener('click', () => { modalLogin.classList.add('hidden'); loginError.classList.add('hidden'); loginPassword.value = ''; });
    btnAuth.addEventListener('click', () => {
        if (loginPassword.value === 'admin123') {
            toggleAdminMode(true);
            modalLogin.classList.add('hidden');
            loginPassword.value = '';
            loginError.classList.add('hidden');
        } else {
            loginError.classList.remove('hidden');
            loginPassword.value = '';
        }
    });
    btnLogout.addEventListener('click', () => toggleAdminMode(false));

    btnEditGlobal.addEventListener('click', () => {
        inputGlobalBudget.value = globalBudget;
        modalGlobalBudget.classList.remove('hidden');
    });
    btnCloseGlobal.addEventListener('click', () => modalGlobalBudget.classList.add('hidden'));
    btnSaveGlobalBudget.addEventListener('click', async () => {
        const newVal = parseInt(inputGlobalBudget.value);
        if (isNaN(newVal)) return alert('Masukkan angka yang valid');

        globalBudget = newVal;
        renderOverview();
        modalGlobalBudget.classList.add('hidden');
        await saveData();
    });

    btnAddCategory.addEventListener('click', () => {
        catEditId.value = '';
        inputCatName.value = '';
        inputCatLimit.value = '';
        inputCatIcon.value = 'tag';
        modalCatTitle.textContent = 'Kategori Baru';
        modalCategory.classList.remove('hidden');
    });
    btnCloseCatModal.addEventListener('click', () => modalCategory.classList.add('hidden'));
    btnSaveCategory.addEventListener('click', () => {
        const id = catEditId.value || Date.now().toString();
        const newCat = {
            id: id,
            name: inputCatName.value,
            budget: parseInt(inputCatLimit.value) || 0,
            icon: inputCatIcon.value || 'tag'
        };

        if (catEditId.value) {
            const idx = categories.findIndex(c => c.id === id);
            const oldName = categories[idx].name;
            if (oldName !== newCat.name) {
                transactions.forEach(t => { if (t.kategori === oldName) t.kategori = newCat.name; });
            }
            categories[idx] = newCat;
        } else {
            categories.push(newCat);
        }

        saveData();
        renderAll();
        modalCategory.classList.add('hidden');
    });

    function attachCategoryActionEvents() {
        document.querySelectorAll('.btn-edit-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const cat = categories.find(c => c.id === id);
                catEditId.value = cat.id;
                inputCatName.value = cat.name;
                inputCatLimit.value = cat.budget;
                inputCatIcon.value = cat.icon;
                modalCatTitle.textContent = 'Edit Kategori';
                modalCategory.classList.remove('hidden');
            });
        });

        document.querySelectorAll('.btn-delete-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const cat = categories.find(c => c.id === id);
                if (confirm(`Hapus kategori "${cat.name}"?`)) {
                    transactions = transactions.filter(t => t.kategori !== cat.name);
                    categories = categories.filter(c => c.id !== id);
                    saveData();
                    renderAll();
                }
            });
        });
    }

    if (formActivity) {
        formActivity.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                id: editId.value || Date.now().toString(),
                nama: inputNama.value,
                kategori: inputKategori.value,
                biaya: parseFloat(inputBiaya.value),
                tanggal: inputTanggal.value
            };

            if (editId.value) {
                const idx = transactions.findIndex(t => t.id === editId.value);
                transactions[idx] = data;
            } else {
                transactions.push(data);
            }

            saveData();
            renderAll();
            resetTrxForm();
        });
    }
    if (btnCancel) btnCancel.addEventListener('click', resetTrxForm);

    function attachTransactionEvents() {
        document.querySelectorAll('.btn-edit-trx').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const trx = transactions.find(t => t.id === id);
                editId.value = trx.id;
                inputNama.value = trx.nama;
                inputKategori.value = trx.kategori;
                inputBiaya.value = trx.biaya;
                inputTanggal.value = trx.tanggal;
                formTitle.innerHTML = `<i data-lucide="edit-3" class="text-blue-500 w-5 h-5"></i> Edit Riwayat`;
                btnSubmit.textContent = 'UPDATE';
                btnCancel.classList.remove('hidden');
                lucide.createIcons();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        document.querySelectorAll('.btn-delete-trx').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Hapus item riwayat ini?')) {
                    transactions = transactions.filter(t => t.id !== id);
                    saveData();
                    renderAll();
                }
            });
        });
    }

    filterCategory.addEventListener('change', (e) => renderHistory(e.target.value));
    btnReport.addEventListener('click', () => window.print());
});
