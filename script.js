// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileCloseBtn = document.querySelector('.mobile-close');
const searchInput = document.querySelector('.search-input');
const toolCards = document.querySelectorAll('.tool-card');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

mobileCloseBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Search Functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        toolCards.forEach(card => {
            const title = card.querySelector('.tool-title').textContent.toLowerCase();
            const description = card.querySelector('.tool-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Tool Card Animation
toolCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// File Upload Functionality
function initFileUpload(uploadAreaId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = uploadArea?.querySelector('.file-input');
    const uploadBtn = uploadArea?.querySelector('.upload-btn');
    const uploadedFiles = uploadArea?.parentElement.querySelector('.uploaded-files');
    const processBtn = uploadArea?.parentElement.querySelector('.process-btn');
    
    if (!uploadArea || !fileInput || !uploadBtn) return;
    
    // Click on upload area or button to trigger file input
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== fileInput && e.target !== uploadBtn) {
            fileInput.click();
        }
    });
    
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        handleFiles(files);
    });
    
    function handleFiles(files) {
        files.forEach(file => {
            if (file.type === 'application/pdf' || file.type === '') {
                addFileToList(file);
            } else {
                showToast('Please upload PDF files only', 'error');
            }
        });
        
        // Enable process button if files are uploaded
        if (uploadedFiles && uploadedFiles.children.length > 0 && processBtn) {
            processBtn.disabled = false;
        }
    }
    
    function addFileToList(file) {
        if (!uploadedFiles) return;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        uploadedFiles.appendChild(fileItem);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(button) {
    const fileItem = button.parentElement;
    fileItem.remove();
    
    // Check if no files remain
    const uploadedFiles = document.querySelector('.uploaded-files');
    const processBtn = document.querySelector('.process-btn');
    
    if (uploadedFiles && uploadedFiles.children.length === 0 && processBtn) {
        processBtn.disabled = true;
    }
}

// Toast Notification System
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Process PDF Function (Mock - Replace with actual API call)
function processPDF(toolName, options = {}) {
    const processBtn = document.querySelector('.process-btn');
    const resultSection = document.querySelector('.result-section');
    const loadingOverlay = document.querySelector('.loading-overlay');
    
    if (!processBtn || !resultSection) return;
    
    // Show loading
    processBtn.disabled = true;
    processBtn.classList.add('processing');
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    // Simulate API call
    setTimeout(() => {
        // Hide loading
        processBtn.disabled = false;
        processBtn.classList.remove('processing');
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        
        // Show result
        resultSection.classList.add('active');
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Show success message
        showToast(`PDF ${toolName} completed successfully!`, 'success');
    }, 2000);
}

// Tool-specific functions
function mergePDF() {
    const files = document.querySelectorAll('.file-item');
    if (files.length < 2) {
        showToast('Please upload at least 2 PDF files to merge', 'warning');
        return;
    }
    processPDF('merged');
}

function splitPDF() {
    const pageRange = document.getElementById('pageRange')?.value;
    if (!pageRange || pageRange.trim() === '') {
        showToast('Please specify page range to split', 'warning');
        return;
    }
    processPDF('split');
}

function compressPDF() {
    const quality = document.getElementById('compressionQuality')?.value;
    processPDF('compressed');
}

function convertPDF(format) {
    const files = document.querySelectorAll('.file-item');
    if (files.length === 0) {
        showToast('Please upload a PDF file to convert', 'warning');
        return;
    }
    processPDF(`converted to ${format}`);
}

// Initialize all tool pages
document.addEventListener('DOMContentLoaded', () => {
    // Initialize file upload for all upload areas
    document.querySelectorAll('.upload-area').forEach((area, index) => {
        initFileUpload(area.id || `upload-area-${index}`);
    });
    
    // Language selector
    const langSelect = document.querySelector('.lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            showToast(`Language changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
    }
    
    // Filter functionality for all tools page
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter tools
            const filter = button.dataset.filter || 'all';
            filterTools(filter);
        });
    });
    
    // Tool search functionality
    const toolSearch = document.querySelector('.tool-search');
    if (toolSearch) {
        toolSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const toolCards = document.querySelectorAll('.all-tools-grid .tool-card');
            
            toolCards.forEach(card => {
                const title = card.querySelector('.tool-title').textContent.toLowerCase();
                const description = card.querySelector('.tool-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

function filterTools(category) {
    const toolCards = document.querySelectorAll('.all-tools-grid .tool-card');
    
    toolCards.forEach(card => {
        const cardCategory = card.dataset.category || 'all';
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Dark Mode Toggle (Optional)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    showToast(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`, 'info');
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Add dark mode styles
const style = document.createElement('style');
style.textContent = `
    body.dark-mode {
        background-color: #1a1a1a;
        color: #e0e0e0;
    }
    
    body.dark-mode .header,
    body.dark-mode .tool-card,
    body.dark-mode .feature-card,
    body.dark-mode .testimonial-card,
    body.dark-mode .upload-area,
    body.dark-mode .tool-options,
    body.dark-mode .result-section {
        background-color: #2d2d2d;
        color: #e0e0e0;
    }
    
    body.dark-mode .section-title,
    body.dark-mode .tool-title,
    body.dark-mode .feature-title,
    body.dark-mode .step-title,
    body.dark-mode .file-name {
        color: #ffffff;
    }
    
    body.dark-mode .nav-link,
    body.dark-mode .tool-description,
    body.dark-mode .feature-description,
    body.dark-mode .step-description,
    body.dark-mode .file-size {
        color: #b0b0b0;
    }
    
    body.dark-mode .dropdown-content,
    body.dark-mode .mobile-menu {
        background-color: #2d2d2d;
    }
`;
document.head.appendChild(style);
