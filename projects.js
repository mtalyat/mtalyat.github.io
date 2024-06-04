fetch('../data/projects.json')
    .then(response => response.json())
    .then(projects => {
        const highlightedContainer = document.getElementById('highlighted-projects-container');
        const allContainer = document.getElementById('all-projects-container');

        const highlightedSet = new Set(projects.highlighted);

        function getProjectContents(project)
        {
            return `<div class="project">
            <img src="${project.image}" alt="${project.title} image">
            <a href="project.html?id=${project.id}">
            <div class="overlay">
            <h2>${project.title}</h2>
            <p>${project.description}</p>
            <p>${project.body.length > 0 ? "" : "No blog yet :("}</p>
            </div>
            </a>
            </div>`;
        }
        
        projects.projects.forEach(project => {
            let contents = getProjectContents(project);

            if(highlightedSet.has(project.id)) highlightedContainer.innerHTML += contents;
            
            allContainer.innerHTML += contents;
        });
    });
