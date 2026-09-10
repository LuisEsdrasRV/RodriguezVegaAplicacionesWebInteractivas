const API_URL = 'https://imdb236.p.rapidapi.com/title/v2/get-top-meter'; // Ajusta al endpoint exacto
const API_KEY = 'TU_API_KEY_AQUI'; 
let allMovies = [];
let favorites = JSON.parse(localStorage.getItem('favMovies')) || [];

$(document).ready(function() {
    updateFavCounter();
    
    // index.html: Carga inicial
    if ($('#movie-grid').length) {
        loadMovies();
        
        // Búsqueda en tiempo real
        $('#searchInput').on('keyup', function() {
            const term = $(this).val().toLowerCase();
            const filtered = allMovies.filter(m => m.primaryTitle.toLowerCase().includes(term));
            renderMovies(filtered);
        });

        // Filtros por década
        $('.btn-filter').on('click', function() {
            const range = $(this).data('range');
            if (range === 'all') {
                renderMovies(allMovies);
            } else {
                const [min, max] = range.split('-').map(Number);
                const filtered = allMovies.filter(m => m.startYear >= min && m.startYear <= max);
                renderMovies(filtered);
            }
        });
    }

    // reseña.html: Carga de detalles
    if ($('#movie-details').length) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        loadMovieDetails(movieId);
    }

    // Eventos del Modal de Favoritos
    $('#favModal').on('show.bs.modal', renderFavorites);
    $('#clear-favs').on('click', clearFavorites);
    $(document).on('click', '.remove-fav', removeFavoriteIndividual);
});

// Consumo de API con Fallback (Soporta Callback para asegurar la carga en reseña.html)
function loadMovies(callback) {
    $('#loading-spinner').show();
    $.ajax({
        url: API_URL,
        headers: { 'X-RapidAPI-Key': API_KEY }
    }).done(function(data) {
        allMovies = data.edges || data; 
        if ($('#movie-grid').length) renderMovies(allMovies);
        if (callback) callback();
    }).fail(function() {
        // Fallback a JSON local
        $.getJSON('PELICULAS.json').done(function(data) {
            allMovies = data.edges || data; 
            if ($('#movie-grid').length) renderMovies(allMovies);
            if (callback) callback();
        }).fail(function() {
            if ($('#movie-grid').length) {
                $('#movie-grid').html('<p class="text-danger">Error al cargar las películas. <button class="btn btn-primary" onclick="loadMovies()">Reintentar</button></p>');
            }
            if (callback) callback();
        });
    }).always(function() {
        $('#loading-spinner').hide();
    });
}

// Renderizado de Grid en Inicio
function renderMovies(movies) {
    const grid = $('#movie-grid');
    grid.empty();
    movies.forEach(m => {
        const isFav = favorites.find(f => String(f.id) === String(m.id)) ? 'text-danger' : '';
        const card = `
            <div class="col-12 col-md-6 col-lg-3 mb-4">
                <div class="card h-100 movie-card shadow-sm">
                    <img src="${m.primaryImage || 'placeholder.jpg'}" class="card-img-top" alt="${m.primaryTitle}" style="height: 350px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${m.primaryTitle}">${m.primaryTitle}</h5>
                        <p class="card-text">${m.startYear} | ⭐ ${m.averageRating}</p>
                        <div class="mt-auto">
                            <a href="reseña.html?id=${m.id}" class="btn btn-primary btn-sm w-100 mb-2">Ver reseña</a>
                            <button class="btn btn-outline-secondary w-100 toggle-fav" data-id="${m.id}" data-title="${m.primaryTitle}" data-year="${m.startYear}" data-img="${m.primaryImage}" data-rating="${m.averageRating}">
                                <i class="bi bi-heart-fill ${isFav}"></i> Favorito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.append(card);
    });

    // Efecto Hover con jQuery
    $('.movie-card').hover(
        function() { $(this).css('transform', 'translateY(-5px)').css('transition', '0.3s'); },
        function() { $(this).css('transform', 'translateY(0)'); }
    );

    // Evento Favoritos
    $('.toggle-fav').off('click').on('click', toggleFavorite);
}

// Lógica de Favoritos (Agregar/Quitar general)
function toggleFavorite(e) {
    const btn = $(e.currentTarget);
    const movie = {
        id: btn.data('id'),
        title: btn.data('title'),
        year: btn.data('year'),
        img: btn.data('img'),
        rating: btn.data('rating')
    };

    const index = favorites.findIndex(f => String(f.id) === String(movie.id));
    if (index === -1) {
        favorites.push(movie);
        btn.find('i').addClass('text-danger');
    } else {
        favorites.splice(index, 1);
        btn.find('i').removeClass('text-danger');
    }
    localStorage.setItem('favMovies', JSON.stringify(favorites));
    updateFavCounter();
}

function updateFavCounter() {
    $('#fav-count').text(favorites.length);
}

// Renderizar el Modal de Favoritos en Grid
function renderFavorites() {
    const modalBody = $('#fav-modal-body');
    modalBody.empty();

    if (favorites.length === 0) {
        modalBody.html('<div class="alert alert-info text-center m-0">No tienes películas favoritas todavía. ¡Agrega algunas!</div>');
        return;
    }

    let gridHtml = '<div class="row g-3">';
    favorites.forEach(m => {
        gridHtml += `
            <div class="col-12 col-sm-6 col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${m.img || 'placeholder.jpg'}" class="card-img-top" alt="${m.title}" style="height: 220px; object-fit: cover;">
                    <div class="card-body p-3 text-center d-flex flex-column">
                        <h6 class="card-title text-truncate mb-1" title="${m.title}">${m.title}</h6>
                        <p class="card-text small mb-2 text-muted">${m.year} | ⭐ ${m.rating}</p>
                        <div class="mt-auto d-flex justify-content-between gap-2">
                            <a href="reseña.html?id=${m.id}" class="btn btn-sm btn-primary flex-grow-1"><i class="bi bi-eye"></i> Ver</a>
                            <button class="btn btn-sm btn-outline-danger remove-fav" data-id="${m.id}" title="Eliminar favorito"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    gridHtml += '</div>';
    modalBody.html(gridHtml);
}

// Eliminar un favorito individual desde el modal
function removeFavoriteIndividual(e) {
    const idToRemove = $(e.currentTarget).data('id');
    favorites = favorites.filter(f => String(f.id) !== String(idToRemove));
    localStorage.setItem('favMovies', JSON.stringify(favorites));
    updateFavCounter();
    renderFavorites(); // Re-renderizar el modal dinámicamente
    
    // Si la pantalla de fondo es la principal, actualizar ícono
    if ($('#movie-grid').length) {
        $(`.toggle-fav[data-id='${idToRemove}'] i`).removeClass('text-danger');
    }
}

// Eliminar todos los favoritos
function clearFavorites() {
    if (favorites.length === 0) return;
    if (confirm('¿Estás seguro de que deseas eliminar todos los favoritos?')) {
        favorites = [];
        localStorage.setItem('favMovies', JSON.stringify(favorites));
        updateFavCounter();
        renderFavorites();
        if ($('#movie-grid').length) {
            $('.toggle-fav i').removeClass('text-danger');
        }
    }
}

// Cargar detalles de la película seleccionada
function loadMovieDetails(id) {
    // Si la página se recargó y no tenemos el array, lo volvemos a descargar primero
    if (allMovies.length === 0) {
        loadMovies(() => displayMovieDetails(id));
    } else {
        displayMovieDetails(id);
    }
}

// Mostrar los datos en pantalla
function displayMovieDetails(id) {
    const movie = allMovies.find(m => String(m.id) === String(id));
    
    if (movie) {
        $('#detail-img').attr('src', movie.primaryImage || 'placeholder.jpg');
        $('#detail-title').text(movie.primaryTitle || 'Título desconocido');
        $('#detail-year').text(movie.startYear || 'N/A');
        $('#detail-runtime').text(movie.runtimeMinutes ? movie.runtimeMinutes : 'N/A');
        $('#detail-rating').text(movie.averageRating || 'N/A');
        $('#detail-description').text(movie.description || 'No hay descripción disponible para esta película.');
        
        // Renderizar géneros
        if (movie.genres && Array.isArray(movie.genres)) {
            $('#detail-genres').html(movie.genres.map(g => `<span class="badge bg-secondary me-1">${g}</span>`).join(''));
        }

        // Metascore
        if (typeof setMetascore === 'function') {
            setMetascore(movie.metascore || Math.floor(Math.random() * 40) + 60); 
        }

        // Estado del botón de favoritos en reseña
        const isFav = favorites.find(f => String(f.id) === String(movie.id));
        if (isFav) {
            $('#detail-fav-btn').html('<i class="bi bi-heart-fill text-danger"></i> Favorito').addClass('active-fav');
        } else {
            $('#detail-fav-btn').html('<i class="bi bi-heart"></i> Favorito').removeClass('active-fav');
        }

        // Manejar el toggle dentro de reseña
        $('#detail-fav-btn').off('click').on('click', function() {
            const mockBtn = $('<button>')
                .data('id', movie.id)
                .data('title', movie.primaryTitle)
                .data('year', movie.startYear)
                .data('img', movie.primaryImage)
                .data('rating', movie.averageRating)
                .append($('<i>').addClass($(this).hasClass('active-fav') ? 'text-danger' : ''));
            
            toggleFavorite({ currentTarget: mockBtn[0] });
            
            if ($(this).hasClass('active-fav')) {
                $(this).html('<i class="bi bi-heart"></i> Favorito').removeClass('active-fav');
            } else {
                $(this).html('<i class="bi bi-heart-fill text-danger"></i> Favorito').addClass('active-fav');
            }
        });

        $('#movie-details').fadeIn(); // Mostrar div 
    } else {
        $('#movie-details').html(`
            <div class="text-center mt-5">
                <h3 class="text-danger">Película no encontrada</h3>
                <a href="index.html" class="btn btn-primary mt-3">Volver al inicio</a>
            </div>
        `).fadeIn();
    }
}