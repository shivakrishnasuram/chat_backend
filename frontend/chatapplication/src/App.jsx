import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receive_message', msg => {
      setMessages(prev => [...prev, msg]);
    });
  }, []);

  const login = async () => {
    const res = await axios.post('http://localhost:5000/login', {
      username: prompt('Username'),
      password: prompt('Password')
    });
    setUser(res.data.username);
  };

  const send = () => {
    socket.emit('send_message', {
      sender: user,
      text
    });
    setText('');
  };

  return (
    <div style={{ padding: 20 }}>
      {!user ? (
        <button onClick={login}>Login</button>
      ) : (
        <>
          <h2>Welcome {user}</h2>
          <div>
            {messages.map((m, i) => (
              <p key={i}><strong>{m.sender}</strong>: {m.text}</p>
            ))}
          </div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={send}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
