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
                let content = `<h1>${project.title}</h1>
                <p>${project.date}</p>
                <p><b>Dates worked on:</b> ${project.date}</p>
                <p><b>Motivation:</b> ${project.motivation}</p>
                <p><b>Technology:</b> ${project.tech}</p>`;
                if(project.link.length > 0) content += `<p><b>Link:</b> <a href="${project.link}">${project.link}</a></p>`;
                if(project.repo.length > 0) content += `<p><b>Repository:</b> <a href="${project.repo}">${project.repo}</a></p>`;
                content += `<h2>Blog</h2>`;

                project.body.forEach(element => {
                    content += `${element}`;
                });
                detailSection.innerHTML = content;
            } else {
                document.getElementById('body').innerHTML = '<p>Project not found.</p>';
            }
        });
});
