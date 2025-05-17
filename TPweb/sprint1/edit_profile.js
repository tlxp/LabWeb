document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-profile-form');
    const profilePicInput = document.getElementById('profile-pic');
    const previewCanvas = document.getElementById('preview-canvas');
    const ctx = previewCanvas.getContext('2d');

    // Load existing profile data from localStorage
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    document.getElementById('name').value = savedProfile.name || 'Zé Teste';
    document.getElementById('dob').value = savedProfile.dob || '1990-01-01';
    document.getElementById('gender').value = savedProfile.gender || 'Masculino';
    document.getElementById('description').value = savedProfile.description || 'Zé Teste é um cliente dedicado à produção de energia renovável, utilizando painéis solares para contribuir para um futuro sustentável.';
    if (savedProfile.profilePic) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        };
        img.src = savedProfile.profilePic;
    }

    // Handle profile picture preview
    profilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                    ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const profileData = {
            name: formData.get('name'),
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            description: formData.get('description'),
            profilePic: previewCanvas.toDataURL('image/png')
        };

        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profileData));

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });

    // Sidebar functionality
    window.toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const burger = document.querySelector('.burger');
        sidebar.classList.toggle('sidebar-active');
        burger.classList.toggle('toggle');
    };

    window.showSection = (sectionId) => {
        window.location.href = `dashboard.html#${sectionId}`;
    };

    window.logout = () => {
        localStorage.removeItem('userProfile');
        window.location.href = 'index.html';
    };
});