import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Events from "./pages/Events";
import BookTicket from "./pages/BookTicket";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/events" element={<Events />} />
        <Route path="/book/:eventId" element={<BookTicket />} />
      </Routes>
    </BrowserRouter>
  );
}
