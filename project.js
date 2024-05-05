document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    fetch('../data/projects.json')
        .then(response => response.json())
        .then(projects => {
            const project = projects.projects.find(p => p.id.toString() === projectId);

            if (project) {
                document.title += ' - ' + project.title;
                
                const detailSection = document.getElementById('body');
                let content = `<h1>${project.title}</h1>`;
                project.body.forEach(element => {
                    content += `${element}`;
                });
                detailSection.innerHTML = content;
            } else {
                document.getElementById('body').innerHTML = '<p>Project not found.</p>';
            }
        });
});
