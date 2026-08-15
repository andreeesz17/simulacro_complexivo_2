import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Gate, listGatesApi } from "../api/gates.api";
import { type Flight, listFlightsAdminApi, createFlightApi, updateFlightApi, deleteFlightApi } from "../api/flights.api";

export default function AdminFlightsPage() {
  const [items, setItems] = useState<Flight[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [gate, setGate] = useState<number>(0);
  const [flightNumber, setFlightNumber] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [departureTime, setDepartureTime] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listFlightsAdminApi();
      setItems(data.results);
    } catch {
      setError("No se pudo cargar vuelos. ¿Login? ¿Token admin?");
    }
  };

  const loadGates = async () => {
    try {
      const data = await listGatesApi();
      setGates(data.results);
      if (!gate && data.results.length > 0) setGate(data.results[0].id);
    } catch {
      // no bloquea
    }
  };

  useEffect(() => { load(); loadGates(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!gate) return setError("Seleccione una puerta");
      if (!flightNumber.trim() || !destination.trim() || !departureTime.trim()) return setError("Faltan campos requeridos");

      const payload = {
        gate: Number(gate),
        flight_number: flightNumber.trim(),
        destination: destination.trim(),
        status: status,
        departure_time: new Date(departureTime).toISOString(),
      };

      if (editId) await updateFlightApi(editId, payload);
      else await createFlightApi(payload);

      setEditId(null);
      setFlightNumber("");
      setDestination("");
      setStatus("SCHEDULED");
      setDepartureTime("");
      await load();
    } catch {
      setError("No se pudo guardar vuelo. ¿Token admin?");
    }
  };

  const startEdit = (f: Flight) => {
    setEditId(f.id);
    setGate(f.gate);
    setFlightNumber(f.flight_number);
    setDestination(f.destination);
    setStatus(f.status);
    
    // Format datetime for input type="datetime-local" (YYYY-MM-DDThh:mm)
    try {
      const d = new Date(f.departure_time);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setDepartureTime(localISOTime);
    } catch {
      setDepartureTime("");
    }
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteFlightApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar vuelo. ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Vuelos (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl sx={{ width: 260 }}>
              <InputLabel id="gate-label">Puerta</InputLabel>
              <Select labelId="gate-label" label="Puerta" value={gate} onChange={(e) => setGate(Number(e.target.value))}>
                {gates.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.terminal} - {g.code} (#{g.id})</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Número Vuelo" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
            <TextField label="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select labelId="status-label" label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="BOARDING">Boarding</MenuItem>
                <MenuItem value="DEPARTED">Departed</MenuItem>
                <MenuItem value="DELAYED">Delayed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Salida" 
              type="datetime-local" 
              slotProps={{ inputLabel: { shrink: true } }}
              value={departureTime} 
              onChange={(e) => setDepartureTime(e.target.value)} 
            />

            <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
            <Button variant="outlined" onClick={() => { setEditId(null); setFlightNumber(""); setDestination(""); setStatus("SCHEDULED"); setDepartureTime(""); }}>Limpiar</Button>
            <Button variant="outlined" onClick={() => { load(); loadGates(); }}>Refrescar</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vuelo</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Puerta</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Salida</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.flight_number}</TableCell>
                <TableCell>{f.destination}</TableCell>
                <TableCell>{f.gate_code ? `${f.gate_terminal} - ${f.gate_code}` : f.gate}</TableCell>
                <TableCell>{f.status}</TableCell>
                <TableCell>{new Date(f.departure_time).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(f)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(f.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
