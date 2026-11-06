import Organizador from "./organizador";

function App() {
  return (
    <div>
      {/* ===== ENCABEZADO ===== */}
      <header>
        <h1 className="marca"><i className="fa-solid fa-champagne-glasses"></i> Plan <span>Fest</span></h1>
      </header>

      {/* ===== PORTADA ===== */}
      <section className="portada">
        <div className="portada-texto">
          <h2>Organiza tus eventos sin complicaciones</h2>
          <p>Registra tus celebraciones, controla invitados y confirmados, y calcula el presupuesto en un solo lugar.</p>
          <a href="#nuevo" className="boton-portada"><i className="fa-solid fa-plus"></i> Crear evento</a>
        </div>
      </section>

      {/* ===== FORMULARIO Y LISTA (están en organizador.jsx) ===== */}
      <Organizador />

      {/* ===== PIE DE PÁGINA ===== */}
      <footer>
        <p className="marca"><i className="fa-solid fa-champagne-glasses"></i> Plan <span>Fest</span></p>
        <p>Organiza tus eventos de forma fácil</p>
        <p className="derechos">© 2026 Plan Fest</p>
      </footer>
    </div>
  );
}

export default App;
