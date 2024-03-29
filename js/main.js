
let carrito = cargarCarrito();
let products = [];
let cantidadTotalCompra = carrito.length;
$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  $("#btn-finalizar").on('click', function () {
    Swal.fire({
      title: '¿Seguro que queres finalizar tu compra?',
      text: `Total a abonar: $${calcularTotalCarrito()}`,
      showCancelButton: true,
      confirmButtonColor: '#008f39',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Compra confirmada',
          '¡Muchas gracias!',
          'success'
        )
        vaciarCarrito();
      }
    })
  });
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  obtenerJSON();
  renderizarProductos();
  mostrarEnTabla();
});
function renderizarProductos() {
  for (const producto of products) {
    $("#section-productos").append(`<div class="card-product"> 
                                    <div class="img-container">
                                    <img src="${producto.img}" alt="${producto.nombre}" class="img-product"/>
                                    </div>
                                    <div class="info-producto">
                                    <p class="font">${producto.nombre}</p>
                                    <p class="font">${producto.categoria}</p>
                                    <strong class="font">$${producto.precio}</strong>
                                    <button class="botones" id="btn${producto.id}"> + </button>
                                    </div>
                                    </div>`);
    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
      $(`#btn${producto.id}`).fadeOut(200).fadeIn(200);
    });
  }
};
function obtenerJSON() {
  $.getJSON("./json/products.json", function (respuesta, estado) {
    if (estado == "success") {
      products = respuesta;
      renderizarProductos();
    }
  })
  .fail(function() {
    console.log("Error al obtener el archivo JSON");
  });
}
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "nombre") {
    products.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre)
    });
  } else if (seleccion == "categoria") {
    products.sort(function (a, b) {
      return a.categoria.localeCompare(b.categoria);
    });
  }
  $(".card-product").remove();
  renderizarProductos();
}
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.categoria = prod.categoria;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.img = prod.img;
    this.cantidad = 1;
  }
}

function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire(
      'Nuevo producto agregado al carrito',
      productoAgregado.categoria + ": " +productoAgregado.nombre,
      'success'
    );
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.categoria}</td>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);
  } else {
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
  }
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}
function mostrarEnTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                          <td>${prod.categoria} ": "${prod.nombre} </td>
                          <td><input type='number' id='cantidad${prod.id}' value='${prod.cantidad}'></td>
                          <td> ${prod.precio}</td>
                          <td>
                            <button class='btn btn-primary actualizar' id="actualizar${prod.id}">✅</button>
                            <button class='btn btn-light eliminar' id="eliminar${prod.id}">🗑️</button>
                          </td>
                        </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })

    $(`#actualizar${prod.id}`).click(function () {
      let nuevaCantidad = parseInt($(`#cantidad${prod.id}`).val());
      carrito.find(p => p.id == prod.id).cantidad = nuevaCantidad;
      $(`#${prod.id}`).html(nuevaCantidad);
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};

function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}
function vaciarCarrito() {
  $("#gastoTotal").text("Total: $0");
  $("#cantidad-compra").text("0");
  $(".tabla-carrito").remove();
  localStorage.clear();
  carrito = [];
}
function cargarCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (carrito == null) {
    return [];
  } else {
    return carrito;
  }
}
