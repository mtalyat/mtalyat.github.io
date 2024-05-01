fetch('../data/projects.json')
    .then(response => response.json())
    .then(projects => {
        const container = document.getElementById('projects-container');
        
        projects.forEach(project => {
            let contents = `<section class="project">
            <img src="${project.image}" alt="${project.title} Image">
            <div>
                <h2><a href="project.html?id=${project.id}">${project.title}</a></h2>
                <p>${project.description}</p>
                <p><b>Date:</b> ${project.date}</p>
                <p><b>Motivation:</b> ${project.motivation}</p>
                <p><b>Technologies:</b> ${project.tech}</p>`;
            // omit these if empty
            if(project.link.length > 0) {
                contents += `<p><b>Link:</b> <a href="${project.link}">${project.link}</a></p>`;
            }
            if(project.repo.length > 0) {
                contents += `<p><b>Repository:</b> <a href="${project.repo}">${project.repo}</a></p>`;
            }
            contents += `</div>
            </section>`;
            
            container.innerHTML += contents;
        });
    });
