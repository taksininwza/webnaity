import React, { useEffect, useState } from "react";
import { database, ref, onValue, set, remove, push } from "./firebase";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import "react-calendar/dist/Calendar.css";

function App() {
  const [reservations, setReservations] = useState({});
  const [barbers, setBarbers] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState("");
  const [newBarberName, setNewBarberName] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null); // 🆕

  useEffect(() => {
    const resRef = ref(database, "reservations");
    onValue(resRef, (snapshot) => {
      setReservations(snapshot.val() || {});
    });
  }, []);

  useEffect(() => {
    const barberRef = ref(database, "barbers");
    onValue(barberRef, (snapshot) => {
      setBarbers(snapshot.val() || {});
    });
  }, []);

  const getReservationsForDateAndBarber = (date, barberId) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    return Object.values(reservations).filter(
      (res) =>
        res.appointment_date === formatted &&
        (barberId === "" || res.barber_id === barberId)
    );
  };

  const selectedReservations = getReservationsForDateAndBarber(
    selectedDate,
    selectedBarber
  ).sort((a, b) => {
    const timeA = a.appointment_time.split(":").map(Number);
    const timeB = b.appointment_time.split(":").map(Number);
    return timeA[0] - timeB[0] || timeA[1] - timeB[1];
  });

  const addBarber = () => {
    if (!newBarberName.trim()) return;
    const barberRef = ref(database, "barbers");
    const newBarberRef = push(barberRef);
    set(newBarberRef, { name: newBarberName.trim() });
    setNewBarberName("");
  };

  const deleteBarber = (barberId) => {
    if (!window.confirm("ยืนยันการลบช่างนี้? การลบอาจส่งผลกับการจองด้วย")) return;
    remove(ref(database, `barbers/${barberId}`));
  };

  const getBarberName = (id) => barbers[id]?.name || id || "ไม่ระบุช่าง";

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: 900, margin: "auto" }}>
      <h1>📅 ปฏิทินการจอง</h1>

      {/* ส่วนช่าง */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="ชื่อช่างใหม่"
          value={newBarberName}
          onChange={(e) => setNewBarberName(e.target.value)}
          style={{ marginRight: 10, padding: "5px" }}
        />
        <button onClick={addBarber} style={{ padding: "5px 10px", cursor: "pointer" }}>
          เพิ่มช่าง
        </button>
      </div>

      {/* รายชื่อช่าง */}
      <div style={{ marginBottom: 10 }}>
        <h3>รายชื่อช่าง</h3>
        <ul style={{ paddingLeft: 0 }}>
          {Object.entries(barbers).map(([id, barber]) => (
            <li
              key={id}
              style={{
                listStyle: "none",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f0f4f8",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              <span>{barber.name}</span>
              <button
                onClick={() => deleteBarber(id)}
                style={{
                  color: "white",
                  backgroundColor: "red",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                ลบ
              </button>
            </li>
          ))}
          {Object.keys(barbers).length === 0 && <li>ยังไม่มีช่าง</li>}
        </ul>

        <div style={{ marginTop: 10 }}>
          <label>
            เลือกช่าง:{" "}
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {Object.entries(barbers).map(([id, barber]) => (
                <option key={id} value={id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileContent={({ date }) => {
              const count = getReservationsForDateAndBarber(date, selectedBarber).length;
              return count > 0 ? (
                <div
                  style={{
                    fontSize: "0.7em",
                    color: "white",
                    background: "#4caf50",
                    borderRadius: "5px",
                    padding: "2px",
                  }}
                >
                  {count} รายการ
                </div>
              ) : null;
            }}
          />
        </div>

        {/* รายละเอียดการจอง */}
        <div
          style={{
            flex: 1,
            maxHeight: 450,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 15,
            backgroundColor: "#fafafa",
          }}
        >
          <h2>การจองวันที่ {dayjs(selectedDate).format("DD/MM/YYYY")}</h2>

          {selectedReservations.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
              {selectedReservations.map((res, idx) => (
                <li
                  key={idx}
                  onClick={() => setSelectedReservation(res)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 15px",
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontWeight: "600" }}>{getBarberName(res.barber_id)}</div>
                  <div>🧑 {res.customer_name} ⏰ {res.appointment_time}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>ไม่มีการจอง</p>
          )}
        </div>
      </div>

      {/* MODAL ดูรายละเอียดลูกค้า */}
      {selectedReservation && (
        <div
          onClick={() => setSelectedReservation(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h3>📋 รายละเอียดการจอง</h3>
            <p><strong>ชื่อ:</strong> {selectedReservation.customer_name}</p>
            <p><strong>เบอร์โทร:</strong> {selectedReservation.phone || "-"}</p>
            <p><strong>ช่าง:</strong> {getBarberName(selectedReservation.barber_id)}</p>
            <p><strong>เวลา:</strong> {selectedReservation.appointment_time}</p>
            <p><strong>หมายเหตุ:</strong> {selectedReservation.note || "-"}</p>
            <button
              onClick={() => setSelectedReservation(null)}
              style={{
                marginTop: 15,
                padding: "6px 12px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
