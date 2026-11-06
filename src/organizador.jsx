import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Calcula los datos que se muestran (presupuesto, faltan, etc.)
function completar(e) {
  const presupuesto = e.invitados * e.costo;
  const descuento = e.pago_anticipado ? presupuesto * 0.1 : 0;
  return {
    ...e,
    fechaBonita: e.fecha.split("-").reverse().join("/"),
    porConfirmar: e.invitados - e.confirmados,
    faltan: Math.max(e.minima - e.confirmados, 0),
    presupuesto,
    descuento,
    total: presupuesto - descuento,
  };
}

function Organizador() {
  
  //Estados
   const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [organizador, setOrganizador] = useState("");
  const [invitados, setInvitados] = useState("");
  const [confirmados, setConfirmados] = useState("");
  const [minima, setMinima] = useState("");
  const [costo, setCosto] = useState("");
  const [pagoAnticipado, setPagoAnticipado] = useState(false);

  // Mensaje debajo del formulario y si es de error
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // La lista de eventos empieza vacía
  const [eventos, setEventos] = useState([]);

  // Texto del buscador
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
  fetch(API + "/api/eventos")
    .then((r) => r.json())
    .then((datos) => setEventos(datos.map(completar)))
    .catch(() => { setMensaje("No se pudo conectar con el servidor."); setError(true); });
}, []);

  // Funciones

  // Agregar un evento
  async function agregarEvento(e) {
    e.preventDefault(); 

    // Validar que no falten datos
    if (nombre === "" || fecha === "" || lugar === "" || organizador === "" ||
        invitados <= 0 || minima <= 0 || costo <= 0) {
      setMensaje("Por favor completa todos los campos.");
      setError(true);
      return;
    }

    const respuesta = await fetch(API + "/api/eventos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombre, fecha, lugar, organizador,
    invitados: Number(invitados),
    confirmados: Number(confirmados),
    minima: Number(minima),
    costo: Number(costo),
    pagoAnticipado,
  }),
});
const guardado = await respuesta.json();
setEventos([...eventos, completar(guardado)]);

    setMensaje("Evento agregado.");
    setError(false);

    // Limpiar el formulario
    setNombre("");
    setFecha("");
    setLugar("");
    setOrganizador("");
    setInvitados("");
    setConfirmados("");
    setMinima("");
    setCosto("");
    setPagoAnticipado(false);
  }

  async function eliminarEvento(id) {
  await fetch(API + "/api/eventos/" + id, { method: "DELETE" });
  setEventos(eventos.filter((evento) => evento.id !== id));
}

async function cambiarEstado(id) {
  const r = await fetch(API + "/api/eventos/" + id + "/estado", { method: "PATCH" });
  const actualizado = completar(await r.json());
  setEventos(eventos.map((evento) => (evento.id === id ? actualizado : evento)));
}


  // Mostrar dinero bonito, ej: $500.000
  function dinero(valor) {
    return "$" + valor.toLocaleString("es-CO");
  }

  // Calculos del resumen
  const realizados = eventos.filter((evento) => evento.realizado).length;
  const pendientes = eventos.length - realizados;

  // Solo los eventos cuyo nombre contiene lo que se escribió en el buscador
  const eventosFiltrados = eventos.filter((evento) =>
    evento.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  // Pantalla
  return (
    <main>
      {/* ===== FORMULARIO ===== */}
      <section id="nuevo" className="tarjeta">
        <h2><i className="fa-solid fa-calendar-plus"></i> Nuevo evento</h2>

        <form onSubmit={agregarEvento}>
          <label htmlFor="nombre"><i className="fa-solid fa-tag"></i> Nombre del evento</label>
          <input type="text" placeholder="Ej: Cumpleaños de Ana"
            id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />

          <label htmlFor="fecha"><i className="fa-solid fa-calendar"></i> Fecha</label>
          <input type="date"
            id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />

          <label htmlFor="lugar"><i className="fa-solid fa-location-dot"></i> Lugar</label>
          <input type="text" placeholder="Ej: Parque Lleras"
            id="lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} />

          <label htmlFor="organizador"><i className="fa-solid fa-user"></i> Organizador</label>
          <input type="text" placeholder="Ej: JP"
            id="organizador" value={organizador} onChange={(e) => setOrganizador(e.target.value)} />

          <div className="campos-dobles">
            <div>
              <label htmlFor="invitados"><i className="fa-solid fa-users"></i> Invitados</label>
              <input type="number" min="1" placeholder="Ej: 10"
                id="invitados" value={invitados} onChange={(e) => setInvitados(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirmados"><i className="fa-solid fa-user-check"></i> Confirmados</label>
              <input type="number" min="0" placeholder="Ej: 8"
                id="confirmados" value={confirmados} onChange={(e) => setConfirmados(e.target.value)} />
            </div>
            <div>
              <label htmlFor="minima"><i className="fa-solid fa-people-group"></i> Cantidad mínima</label>
              <input type="number" min="1" placeholder="Ej: 9"
                id="minima" value={minima} onChange={(e) => setMinima(e.target.value)} />
            </div>
            <div>
              <label htmlFor="costo"><i className="fa-solid fa-money-bill-wave"></i> Costo por persona</label>
              <input type="number" min="0" step="1000" placeholder="Ej: 50000"
                id="costo" value={costo} onChange={(e) => setCosto(e.target.value)} />
            </div>
          </div>

          <label className="opcion" htmlFor="pagoAnticipado">
            <input type="checkbox" id="pagoAnticipado"
              checked={pagoAnticipado} onChange={(e) => setPagoAnticipado(e.target.checked)} />
            <i className="fa-solid fa-percent"></i> Pago anticipado (10% de descuento)
          </label>

          <button type="submit"><i className="fa-solid fa-plus"></i> Agregar evento</button>
        </form>

        <p className={error ? "mensaje error" : "mensaje"}>{mensaje}</p>
      </section>

      {/* ===== LISTA DE EVENTOS ===== */}
      <section id="eventos" className="tarjeta">
        <h2><i className="fa-solid fa-calendar-days"></i> Mis eventos</h2>

        <div className="resumen">
          <p>Total: {eventos.length} eventos</p>
          <p>Pendientes: {pendientes} | Realizados: {realizados}</p>
        </div>

        <label htmlFor="buscar"><i className="fa-solid fa-magnifying-glass"></i> Buscar por nombre</label>
        <div className="herramientas">
          <input type="text" placeholder="Escribe para buscar"
            id="buscar" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>

        <div id="lista">
          {/* Si no hay eventos, se muestra este mensaje */}
          {eventos.length === 0 && (
            <div className="vacio">
              <p>Aún no tienes eventos. ¡Crea el primero con el formulario!</p>
            </div>
          )}

          {/* Una tarjeta por cada evento */}
          {eventosFiltrados.map((evento) => (
            <article key={evento.id} className={evento.realizado ? "evento realizado" : "evento"}>
              <h3>{evento.nombre}</h3>

              <p className="detalle">
                <span><i className="fa-solid fa-calendar"></i> {evento.fechaBonita}</span>
                <span><i className="fa-solid fa-location-dot"></i> {evento.lugar}</span>
                <span><i className="fa-solid fa-user"></i> Organiza: {evento.organizador}</span>
              </p>

              {evento.faltan === 0 ? (
                <p className="aviso listo"><i className="fa-solid fa-circle-check"></i> Ya se alcanzó la cantidad mínima</p>
              ) : (
                <p className="aviso">
                  <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                  {evento.faltan === 1 ? "Falta 1 confirmado" : "Faltan " + evento.faltan + " confirmados"} para poder realizarlo (mínimo {evento.minima})
                </p>
              )}

              <div className="datos">
                <p><span><i className="fa-solid fa-users"></i> Invitados</span><strong>{evento.invitados}</strong></p>
                <p><span><i className="fa-solid fa-user-check"></i> Confirmados</span><strong>{evento.confirmados}</strong></p>
                <p><span><i className="fa-solid fa-hourglass-half"></i> Por confirmar</span><strong>{evento.porConfirmar}</strong></p>
              </div>

              <div className="datos dinero">
                <p><span><i className="fa-solid fa-wallet"></i> Presupuesto</span><strong>{dinero(evento.presupuesto)}</strong></p>
                <p><span><i className="fa-solid fa-percent"></i> Descuento</span><strong>{dinero(evento.descuento)}</strong></p>
                <p><span><i className="fa-solid fa-money-bill-wave"></i> Total</span><strong>{dinero(evento.total)}</strong></p>
              </div>

              <button onClick={() => cambiarEstado(evento.id)}>
                {evento.realizado ? (
                  <span><i className="fa-solid fa-rotate-left"></i> Volver a pendiente</span>
                ) : (
                  <span><i className="fa-solid fa-check"></i> Marcar como realizado</span>
                )}
              </button>
              <button onClick={() => eliminarEvento(evento.id)}><i className="fa-solid fa-trash"></i> Eliminar</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Organizador;
