document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    fetch('../data/projects.json')
        .then(response => response.json())
        .then(projects => {
            const project = projects.find(p => p.id.toString() === projectId);
            if (project) {
                const detailSection = document.getElementById('project-detail');
                detailSection.innerHTML = `<h2>${project.title}</h2>
                                           <img src="${project.image}" alt="${project.title}">
                                           <p>${project.description}</p>`;
            } else {
                document.getElementById('project-detail').innerHTML = '<p>Project not found.</p>';
            }
        });
});
