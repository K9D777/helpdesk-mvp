import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
};

type Ticket = {
  id: string;
  protocol: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  source: string;
  urgency: number;
  impact: number;
  requester: User;
  assignee?: User;
  comments?: any[];
  createdAt: string;
};

const API_URL = 'http://localhost:3001';

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('admin@helpdesk.local');
  const [password, setPassword] = useState('admin123');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState('');

  const socket = useMemo(() => io(API_URL), []);

  useEffect(() => {
    if (!isLogged) return;

    socket.on('ticket:new', (payload) => {
      setTickets((prev) => [payload, ...prev]);
      alert(`Novo chamado: ${payload.title}`);
    });

    socket.on('ticket:updated', (payload) => {
      setTickets((prev) => prev.map((t) => (t.id === payload.id ? payload : t)));
      if (selectedTicket?.id === payload.id) setSelectedTicket(payload);
    });

    return () => socket.disconnect();
  }, [isLogged, selectedTicket, socket]);

  const loadTickets = async () => {
    const response = await axios.get(`${API_URL}/tickets`);
    setTickets(response.data);
  };

  const loadSummary = async () => {
    const response = await axios.get(`${API_URL}/tickets/summary`);
    setSummary(response.data);
  };

  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const currentUser = response.data.user;
      localStorage.setItem('helpdesk_token', response.data.accessToken);
      localStorage.setItem('helpdesk_user', JSON.stringify(currentUser));
      setUser(currentUser);
      setIsLogged(true);
      loadTickets();
      loadSummary();
    } catch (error) {
      alert('Credenciais inválidas');
    }
  };

  const createTestTicket = async () => {
    if (!user) return;

    const response = await axios.post(`${API_URL}/tickets`, {
      title: 'Solicitação de acesso ao sistema de gestão',
      description: 'Preciso de acesso ao portal de gestão.',
      requesterId: user.id,
      queueId: null,
      categoryId: null,
      priority: 'MEDIA',
      urgency: 2,
      impact: 2,
      status: 'NEW',
      source: 'PORTAL',
    });

    setTickets((prev) => [response.data, ...prev]);
    alert(`Chamado criado: ${response.data.protocol}`);
  };

  const changeStatus = async (ticketId: string, status: string) => {
    const response = await axios.patch(`${API_URL}/tickets/${ticketId}/status`, { status });
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? response.data : t)));
    if (selectedTicket?.id === ticketId) setSelectedTicket(response.data);
  };

  const addComment = async () => {
    if (!selectedTicket || !comment.trim() || !user) return;

    await axios.post(`${API_URL}/tickets/${selectedTicket.id}/comments`, {
      userId: user.id,
      body: comment,
      isInternal: false,
    });

    const response = await axios.get(`${API_URL}/tickets/${selectedTicket.id}`);
    setSelectedTicket(response.data);
    setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? response.data : t)));
    setComment('');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('helpdesk_user');
    const savedToken = localStorage.getItem('helpdesk_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLogged(true);
      loadTickets();
      loadSummary();
    }
  }, []);

  if (!isLogged) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <h1>Help Desk</h1>
          <div className="field">
            <label>E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Help Desk</h2>
        <p>{user?.name}</p>
        <small>{user?.role}</small>
        <button onClick={createTestTicket}>Abrir chamado</button>
        <button onClick={loadTickets}>Atualizar fila</button>
        <button onClick={() => {
          localStorage.clear();
          setIsLogged(false);
        }}>
          Sair
        </button>
      </aside>

      <main className="main-panel">
        <div className="cards">
          <div className="card">
            <span>Total</span>
            <strong>{summary?.total || tickets.length}</strong>
          </div>
          <div className="card">
            <span>Novos</span>
            <strong>{summary?.newTickets || 0}</strong>
          </div>
          <div className="card">
            <span>Em atendimento</span>
            <strong>{summary?.inProgress || 0}</strong>
          </div>
          <div className="card">
            <span>Resolvidos</span>
            <strong>{summary?.resolved || 0}</strong>
          </div>
        </div>

        <div className="content-grid">
          <section className="list-panel">
            <h3>Fila</h3>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-head">
                  <strong>{ticket.protocol}</strong>
                  <span>{ticket.status}</span>
                </div>
                <div>{ticket.title}</div>
                <small>{ticket.requester?.name}</small>
              </div>
            ))}
          </section>

          <section className="detail-panel">
            {selectedTicket ? (
              <>
                <div className="detail-header">
                  <h3>{selectedTicket.title}</h3>
                  <span>{selectedTicket.protocol}</span>
                </div>

                <p>{selectedTicket.description}</p>

                <div className="actions">
                  <button onClick={() => changeStatus(selectedTicket.id, 'IN_PROGRESS')}>Em atendimento</button>
                  <button onClick={() => changeStatus(selectedTicket.id, 'RESOLVED')}>Resolvido</button>
                  <button onClick={() => changeStatus(selectedTicket.id, 'NEW')}>Novo</button>
                </div>

                <div className="comments-box">
                  <h4>Comentários</h4>
                  {(selectedTicket.comments || []).map((commentItem) => (
                    <div key={commentItem.id} className="comment-item">
                      <strong>{commentItem.user?.name}</strong>
                      <p>{commentItem.body}</p>
                    </div>
                  ))}
                </div>

                <div className="comment-form">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicionar comentário"
                  />
                  <button onClick={addComment}>Salvar comentário</button>
                </div>
              </>
            ) : (
              <div>Selecione um chamado</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
