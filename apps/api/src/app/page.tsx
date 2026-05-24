export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', background: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#6366f1' }}>Permis AI — API</h1>
      <p style={{ color: '#a1a1aa' }}>Backend API v1.0.0</p>
      <ul style={{ color: '#a1a1aa', lineHeight: '2' }}>
        <li>GET /api/health — Health check</li>
        <li>POST /api/auth/verify — Auth</li>
        <li>GET /api/questions — Questions</li>
        <li>POST /api/sessions — Sessions</li>
        <li>POST /api/chat — AI Chat</li>
        <li>GET /api/progress — Progress</li>
      </ul>
    </main>
  )
}
