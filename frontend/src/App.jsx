import { useState } from 'react';
import axios from 'axios';

function App() {
  const [date, setDate] = useState('');
  const [barberId, setBarberId] = useState('barber1');
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const res = await axios.post('http://localhost:5000/api/reservations', {
      appointment_date: date
    });

    const rawData = res.data;
    const result = Object.entries(rawData)
      .map(([id, value]) => ({ id, ...value }))
      .filter(item => item.barber_id === barberId);

    setReservations(result);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📋 ตารางการจอง</h1>

      <div>
        <label>📅 วันที่: </label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <br /><br />

        <label>✂️ เลือกช่าง: </label>
        <select value={barberId} onChange={e => setBarberId(e.target.value)}>
          <option value="barber1">ช่าง A</option>
          <option value="barber2">ช่าง B</option>
          <option value="barber3">ช่าง C</option>
        </select>
        <br /><br />

        <button onClick={fetchReservations}>📤 โหลดข้อมูล</button>
      </div>

      <hr />

      <h2>📌 รายการจองของ {barberId}</h2>
      {reservations.length === 0 ? (
        <p>ไม่มีข้อมูลการจอง</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ชื่อผู้จอง</th>
              <th>เวลา</th>
              <th>บริการ</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td>{r.customer_name || 'ไม่ระบุ'}</td>
                <td>{r.appointment_time}</td>
                <td>{r.service || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;