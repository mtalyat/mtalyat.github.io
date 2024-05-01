document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    fetch('../data/projects.json')
        .then(response => response.json())
        .then(projects => {
            const project = projects.find(p => p.id.toString() === projectId);
            if (project) {
                const detailSection = document.getElementById('body');
                detailSection.innerHTML = `<h1>${project.title}</h1>
                                           <p>${project.body}</p>`;
            } else {
                document.getElementById('project-detail').innerHTML = '<p>Project not found.</p>';
            }
        });
});
