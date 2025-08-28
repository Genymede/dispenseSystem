const ws = new WebSocket('ws://localhost:3001/ws?userId=8');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.error('Error:', e);
ws.onclose = (e) => console.log('Closed, code:', e.code, 'reason:', e.reason);