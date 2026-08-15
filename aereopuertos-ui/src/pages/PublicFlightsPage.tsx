import { useEffect, useState } from "react";
import { Container, Paper, Typography, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { type Flight, listFlightsPublicApi } from "../api/flights.api";

export default function PublicFlightsPage() {
  const [items, setItems] = useState<Flight[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listFlightsPublicApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar la lista pública. ¿Backend encendido?");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">Lista de Vuelos (Público)</Typography>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vuelo</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Puerta</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Salida</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
