// El jquery se repetia con lo de aqui y lo quite

$(document).ready(function () {
    console.log('Tienda interactiva cargada (jQuery)');

    // Estado del Carrito (Arreglo en Memoria)
    let cart = [];

    // Instancias seguras de los modales Bootstrap (Evitan romper el código si falta el HTML)
    const cartEl = document.getElementById('carritoModal');
    const alertModal = cartEl ? new bootstrap.Modal(cartEl) : null;

    const subEl = document.getElementById('suscripcionModal');
    const subModal = subEl ? new bootstrap.Modal(subEl) : null;

    const errorEl = document.getElementById('errorModal');
    const errorModal = errorEl ? new bootstrap.Modal(errorEl) : null;

    // --- 1. LÓGICA DEL CARRITO DE COMPRAS --- //
    function renderCart() {
        const cartList = $('#cart-items-list');
        const emptyMsg = $('#cart-empty-msg');
        const badge = $('#cart-badge');
        let total = 0;

        cartList.empty(); // Limpiar lista actual

        if (cart.length === 0) {
            emptyMsg.show();
            badge.fadeOut();
            $('#btn-checkout').prop('disabled', true);
        } else {
            emptyMsg.hide();
            badge.text(cart.length).fadeIn().addClass('cart-bounce');
            
            setTimeout(() => badge.removeClass('cart-bounce'), 400);

            $('#btn-checkout').prop('disabled', false);

            cart.forEach((item, index) => {
                total += item.price;
                cartList.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center py-3 animate-pop">
                        <div>
                            <h6 class="my-0">${item.product}</h6>
                            <small class="text-muted">$${item.price.toFixed(2)}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger btn-remove-item" data-index="${index}" title="Eliminar">
                            ×
                        </button>
                    </li>
                `);
            });
        }
        $('#cart-total-price').text('$' + total.toFixed(2));
    }

    // Añadir producto al carrito
    $('.btn-add-to-cart').on('click', function (e) {
        e.preventDefault();
        const btn = $(this);
        const card = btn.closest('.card');
        
        // Animación de clic en la tarjeta
        card.addClass('card-clicked');
        setTimeout(() => card.removeClass('card-clicked'), 150);

        const product = btn.data('product');
        const price = parseFloat(btn.data('price'));

        cart.push({ product, price });
        renderCart();

        if (alertModal) {
            $('#modalProductName').text(product);
            alertModal.show();
        }
    });

    // Eliminar producto del carrito (Uso de delegación de eventos)
    $('#cart-items-list').on('click', '.btn-remove-item', function () {
        const index = $(this).data('index');
        cart.splice(index, 1); 
        renderCart();          
    });


    // --- 2. LÓGICA DE FILTROS Y ETIQUETAS --- //
    $('.filter-btn').on('click', function () {
        const filterValue = $(this).data('filter');

        $('.filter-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');

        if (filterValue === 'all') {
            $('.product-item').stop().fadeIn(400);
        } else {
            $('.product-item').stop().hide(); 
            $(`.product-item[data-category="${filterValue}"]`).fadeIn(400); 
        }
    });

    $('#btn-clear-filters').on('click', function () {
        $('.filter-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        $('.filter-btn[data-filter="all"]').removeClass('btn-outline-primary').addClass('btn-primary');
        $('.product-item').stop().fadeIn(400);
    });


    // --- 3. SUSCRIPCIÓN Y SCROLL SUAVE --- //
    $('#btnSubscribe').on('click', function () {
        const email = $('#emailInput').val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && emailRegex.test(email)) {
            if (subModal) {
                $('#modalEmailSubscription').text(email);
                subModal.show();
            }
            $('#emailInput').val('');
        } else {
            if (errorModal) errorModal.show();
        }
    });

    $('a[href^="#"]').on('click', function (e) {
        const target = $($(this).attr('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 600);
        }
    });
});