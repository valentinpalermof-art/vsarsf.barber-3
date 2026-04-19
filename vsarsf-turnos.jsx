import { useState, useEffect } from "react";

const HOURS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

const SERVICES = [
  { id: "corte", label: "Corte", icon: "✂️", duration: "30 min" },
  { id: "tenido", label: "Teñido", icon: "🎨", duration: "60 min" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function App() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState({});
  const [step, setStep] = useState("calendar"); // calendar | time | form | confirm
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [name, setName] = useState("");
  const [lastBooking, setLastBooking] = useState(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vsarsf_bookings");
    if (saved) setBookings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setAnimIn(false);
    const t = setTimeout(() => setAnimIn(true), 30);
    return () => clearTimeout(t);
  }, [step]);

  const saveBookings = (updated) => {
    setBookings(updated);
    localStorage.setItem("vsarsf_bookings", JSON.stringify(updated));
  };

  const getBookingsForDate = (dateKey) => bookings[dateKey] || {};

  const isSlotTaken = (dateKey, time) => !!getBookingsForDate(dateKey)[time];

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const dayNames = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayMidnight) return;
    const dow = d.getDay();
    if (dow === 0 || dow === 1) return; // Domingo y Lunes cerrado
    setSelectedDate(toDateKey(viewYear, viewMonth, day));
    setStep("time");
    setSelectedTime(null);
    setSelectedService(null);
    setName("");
  };

  const handleTimeClick = (time) => {
    if (isSlotTaken(selectedDate, time)) return;
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (!name.trim() || !selectedTime || !selectedService) return;
    const updated = {
      ...bookings,
      [selectedDate]: {
        ...getBookingsForDate(selectedDate),
        [selectedTime]: { name: name.trim(), service: selectedService },
      },
    };
    saveBookings(updated);
    setLastBooking({ date: selectedDate, time: selectedTime, service: selectedService, name: name.trim() });
    setStep("confirm");
  };

  const resetAll = () => {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedService(null);
    setName("");
    setLastBooking(null);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const formatDateDisplay = (dateKey) => {
    if (!dateKey) return "";
    const [y, m, d] = dateKey.split("-");
    return `${d} de ${monthNames[parseInt(m) - 1]} ${y}`;
  };

  const freeSlots = selectedDate
    ? HOURS.filter(h => !isSlotTaken(selectedDate, h)).length
    : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #0d2347 40%, #1a3a6b 100%)",
      fontFamily: "'Raleway', sans-serif",
      color: "#e8f0fe",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Background decorative elements */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(96,165,250,0.1) 0%, transparent 50%)`,
        pointerEvents: "none", zIndex: 0
      }}/>
      <div style={{
        position: "fixed", top: "-50%", right: "-20%", width: "600px", height: "600px",
        borderRadius: "50%", border: "1px solid rgba(96,165,250,0.08)",
        pointerEvents: "none", zIndex: 0
      }}/>
      <div style={{
        position: "fixed", bottom: "-30%", left: "-15%", width: "500px", height: "500px",
        borderRadius: "50%", border: "1px solid rgba(96,165,250,0.06)",
        pointerEvents: "none", zIndex: 0
      }}/>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "520px", margin: "0 auto", padding: "0 16px 40px" }}>
        
        {/* Header */}
        <header style={{ textAlign: "center", padding: "40px 0 32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(59,130,246,0.12)", border: "1px solid rgba(96,165,250,0.25)",
            borderRadius: "50px", padding: "6px 20px", marginBottom: "20px",
            backdropFilter: "blur(10px)"
          }}>
            <span style={{ fontSize: "14px", color: "#93c5fd", letterSpacing: "3px", fontWeight: 600 }}>✂ BARBERÍA</span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(42px, 10vw, 64px)",
            fontWeight: 900,
            margin: 0,
            lineHeight: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-1px",
          }}>VSARSF</h1>
          <p style={{ color: "#93c5fd", fontSize: "13px", letterSpacing: "4px", marginTop: "8px", fontWeight: 500 }}>
            RESERVÁ TU TURNO ONLINE
          </p>
        </header>

        {/* Step indicators */}
        {step !== "confirm" && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
            {["calendar","time","form"].map((s, i) => (
              <div key={s} style={{
                width: step === s ? "32px" : "8px", height: "8px", borderRadius: "4px",
                background: step === s ? "#3b82f6" : 
                  (["calendar","time","form"].indexOf(step) > i ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.15)"),
                transition: "all 0.3s ease"
              }}/>
            ))}
          </div>
        )}

        {/* STEP: Calendar */}
        {step === "calendar" && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.4s ease" }}>
            <Card>
              <CardTitle icon="📅">Elegí el día</CardTitle>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <NavBtn onClick={goToPrevMonth}>‹</NavBtn>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  {monthNames[viewMonth]} {viewYear}
                </span>
                <NavBtn onClick={goToNextMonth}>›</NavBtn>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                {dayNames.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#93c5fd", fontWeight: 700, padding: "4px 0", letterSpacing: "1px" }}>{d}</div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = toDateKey(viewYear, viewMonth, day);
                  const d = new Date(viewYear, viewMonth, day);
                  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isPast = d < todayMidnight;
                  const dow = d.getDay();
                  const isClosed = dow === 0 || dow === 1;
                  const isDisabled = isPast || isClosed;
                  const isToday = dateKey === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
                  const hasBookings = Object.keys(getBookingsForDate(dateKey)).length > 0;
                  const isSelected = dateKey === selectedDate;
                  
                  return (
                    <button key={day} onClick={() => !isDisabled && handleDayClick(day)} style={{
                      aspectRatio: "1", borderRadius: "10px", border: "none",
                      background: isSelected ? "#3b82f6" : isToday ? "rgba(59,130,246,0.25)" : isDisabled ? "transparent" : "rgba(255,255,255,0.04)",
                      color: isDisabled ? "rgba(255,255,255,0.18)" : isSelected ? "#fff" : isToday ? "#93c5fd" : "#e8f0fe",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      fontSize: "13px", fontWeight: isToday || isSelected ? 700 : 400,
                      position: "relative",
                      transition: "all 0.2s ease",
                      outline: "none",
                      border: isToday && !isSelected ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
                      textDecoration: isClosed && !isPast ? "line-through" : "none",
                    }}
                    onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = isSelected ? "#3b82f6" : "rgba(59,130,246,0.15)" }}
                    onMouseLeave={e => { if (!isDisabled) e.currentTarget.style.background = isSelected ? "#3b82f6" : isToday ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.04)" }}
                    >
                      {day}
                      {hasBookings && !isDisabled && (
                        <div style={{
                          position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)",
                          width: "4px", height: "4px", borderRadius: "50%",
                          background: isSelected ? "#fff" : "#60a5fa"
                        }}/>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(59,130,246,0.08)", borderRadius: "10px", fontSize: "12px", color: "#93c5fd", textAlign: "center" }}>
                Los puntos azules indican días con turnos agendados · Domingos y lunes cerrado
              </div>
            </Card>
          </div>
        )}

        {/* STEP: Time + Service */}
        {step === "time" && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.4s ease" }}>
            <BackBtn onClick={() => setStep("calendar")} />
            
            <Card>
              <CardTitle icon="🗓️">
                {formatDateDisplay(selectedDate)}
              </CardTitle>
              <div style={{ color: "#60a5fa", fontSize: "12px", marginBottom: "20px", fontWeight: 500 }}>
                {freeSlots} horarios disponibles
              </div>

              <div style={{ marginBottom: "24px" }}>
                <SectionLabel>Elegí el servicio</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {SERVICES.map(s => (
                    <button key={s.id} onClick={() => setSelectedService(s.id)} style={{
                      padding: "16px 12px", borderRadius: "14px", border: "none",
                      background: selectedService === s.id ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.05)",
                      color: selectedService === s.id ? "#fff" : "#93c5fd",
                      cursor: "pointer", textAlign: "center",
                      border: selectedService === s.id ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}>
                      <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>{s.label}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}>{s.duration}</div>
                    </button>
                  ))}
                </div>
              </div>

              <SectionLabel>Elegí el horario</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {HOURS.map(hour => {
                  const taken = isSlotTaken(selectedDate, hour);
                  const isChosen = selectedTime === hour;
                  return (
                    <button key={hour} onClick={() => handleTimeClick(hour)} disabled={taken} style={{
                      padding: "10px 6px", borderRadius: "10px", border: "none",
                      background: isChosen ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : taken ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
                      color: taken ? "rgba(255,255,255,0.2)" : isChosen ? "#fff" : "#e8f0fe",
                      cursor: taken ? "not-allowed" : "pointer",
                      fontSize: "13px", fontWeight: isChosen ? 700 : 400,
                      border: isChosen ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.07)",
                      transition: "all 0.2s ease",
                      textDecoration: taken ? "line-through" : "none",
                      outline: "none",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      {taken && (
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)"
                        }}/>
                      )}
                      {hour}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { if (selectedTime && selectedService) setStep("form"); }}
                disabled={!selectedTime || !selectedService}
                style={{
                  width: "100%", marginTop: "24px", padding: "16px",
                  borderRadius: "14px", border: "none",
                  background: selectedTime && selectedService ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.05)",
                  color: selectedTime && selectedService ? "#fff" : "rgba(255,255,255,0.3)",
                  cursor: selectedTime && selectedService ? "pointer" : "not-allowed",
                  fontSize: "15px", fontWeight: 700, letterSpacing: "1px",
                  transition: "all 0.2s ease", outline: "none",
                  boxShadow: selectedTime && selectedService ? "0 8px 24px rgba(59,130,246,0.3)" : "none",
                }}>
                Continuar →
              </button>
            </Card>
          </div>
        )}

        {/* STEP: Form */}
        {step === "form" && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.4s ease" }}>
            <BackBtn onClick={() => setStep("time")} />
            <Card>
              <CardTitle icon="👤">Tus datos</CardTitle>

              <div style={{
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "12px", padding: "14px 16px", marginBottom: "24px",
              }}>
                <div style={{ fontSize: "12px", color: "#93c5fd", marginBottom: "4px", fontWeight: 600 }}>RESUMEN</div>
                <div style={{ fontSize: "14px", color: "#fff" }}>
                  📅 {formatDateDisplay(selectedDate)} · {selectedTime}
                </div>
                <div style={{ fontSize: "14px", color: "#fff", marginTop: "4px" }}>
                  {SERVICES.find(s => s.id === selectedService)?.icon} {SERVICES.find(s => s.id === selectedService)?.label}
                </div>
              </div>

              <SectionLabel>Tu nombre</SectionLabel>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ingresá tu nombre completo"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", fontSize: "15px", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  fontFamily: "'Raleway', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              />

              <button
                onClick={handleConfirm}
                disabled={!name.trim()}
                style={{
                  width: "100%", marginTop: "24px", padding: "16px",
                  borderRadius: "14px", border: "none",
                  background: name.trim() ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.05)",
                  color: name.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                  cursor: name.trim() ? "pointer" : "not-allowed",
                  fontSize: "15px", fontWeight: 700, letterSpacing: "1px",
                  transition: "all 0.2s ease", outline: "none",
                  boxShadow: name.trim() ? "0 8px 24px rgba(59,130,246,0.35)" : "none",
                }}>
                ✓ Confirmar turno
              </button>
            </Card>
          </div>
        )}

        {/* STEP: Confirm */}
        {step === "confirm" && lastBooking && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.4s ease" }}>
            <Card>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 20px",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "36px",
                  boxShadow: "0 0 40px rgba(59,130,246,0.4)",
                }}>✓</div>
                
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", margin: "0 0 8px", color: "#fff" }}>
                  ¡Turno confirmado!
                </h2>
                <p style={{ color: "#93c5fd", fontSize: "14px", margin: "0 0 28px" }}>
                  Te esperamos, {lastBooking.name} 👋
                </p>

                <div style={{
                  background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                  borderRadius: "16px", padding: "20px", textAlign: "left", marginBottom: "24px",
                }}>
                  <Row label="📅 Fecha" value={formatDateDisplay(lastBooking.date)} />
                  <Row label="🕐 Hora" value={lastBooking.time} />
                  <Row label="💈 Servicio" value={SERVICES.find(s => s.id === lastBooking.service)?.label} />
                  <Row label="👤 Nombre" value={lastBooking.name} last />
                </div>

                <button onClick={resetAll} style={{
                  width: "100%", padding: "14px",
                  borderRadius: "14px", border: "1px solid rgba(59,130,246,0.3)",
                  background: "rgba(59,130,246,0.1)",
                  color: "#93c5fd", cursor: "pointer",
                  fontSize: "14px", fontWeight: 600, outline: "none",
                  transition: "all 0.2s ease",
                }}>
                  Agendar otro turno
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px", color: "rgba(147,197,253,0.4)", fontSize: "12px", letterSpacing: "2px" }}>
          VSARSF © {today.getFullYear()}
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "24px",
      padding: "28px 24px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      {children}
    </div>
  );
}

function CardTitle({ children, icon }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "22px", fontWeight: 700, margin: 0,
        color: "#fff", display: "flex", alignItems: "center", gap: "10px"
      }}>
        <span>{icon}</span> {children}
      </h2>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#60a5fa", marginBottom: "10px", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function NavBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      color: "#93c5fd", width: "36px", height: "36px", borderRadius: "10px",
      cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center",
      outline: "none", transition: "all 0.2s ease",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
    >{children}</button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: "#60a5fa", cursor: "pointer",
      fontSize: "13px", fontWeight: 600, padding: "0 0 16px", display: "flex", alignItems: "center", gap: "6px",
      outline: "none", letterSpacing: "1px",
    }}>
      ← Volver
    </button>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ color: "#93c5fd", fontSize: "13px" }}>{label}</span>
      <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
