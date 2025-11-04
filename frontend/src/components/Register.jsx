import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!nom || !email || !motDePasse || !confirmMotDePasse) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (nom.length > 50) {
      setError('Le nom ne peut pas dépasser 50 caractères');
      return;
    }

    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (motDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      await register(nom, email, motDePasse);
      // Rediriger vers le profil après inscription (connexion automatique)
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>✨ Créer un compte</h1>
          <p style={styles.subtitle}>
            Rejoignez l'aventure et commencez votre quête dans le monde du RPG
          </p>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="nom" style={styles.label}>
              👤 Nom de joueur
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              maxLength={50}
              style={styles.input}
              placeholder="Votre nom de héros"
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              📧 Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="votre@email.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="motDePasse" style={styles.label}>
              🔒 Mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Minimum 6 caractères"
              autoComplete="new-password"
              disabled={loading}
            />
            <small style={styles.helpText}>
              Le mot de passe doit contenir au moins 6 caractères
            </small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmMotDePasse" style={styles.label}>
              🔒 Confirmer le mot de passe
            </label>
            <input
              id="confirmMotDePasse"
              type="password"
              value={confirmMotDePasse}
              onChange={(e) => setConfirmMotDePasse(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Création en cours...' : '🎮 Créer le compte'}
          </button>
        </form>

        <div style={styles.switch}>
          <span>Déjà un compte ? </span>
          <Link to="/login" style={styles.link}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5E6D3',
    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(165, 42, 42, 0.1) 0%, transparent 50%)',
    padding: '40px',
  },
  card: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '50px 60px',
    boxShadow: '0 8px 16px rgba(107, 68, 35, 0.4), inset 0 0 0 3px #8B4513',
    width: '100%',
    maxWidth: '700px',
    border: '4px solid #8B4513',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    margin: '0 0 15px 0',
    color: '#654321',
    fontSize: '36px',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(139, 69, 19, 0.3)',
  },
  subtitle: {
    margin: 0,
    color: '#8B4513',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontWeight: '600',
    color: '#654321',
    fontSize: '16px',
  },
  input: {
    padding: '16px 18px',
    border: '3px solid #8B4513',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#F5E6D3',
    color: '#654321',
  },
  helpText: {
    fontSize: '13px',
    color: '#8B4513',
    marginTop: '4px',
  },
  button: {
    padding: '16px 32px',
    backgroundColor: '#8B0000',
    backgroundImage: 'linear-gradient(to bottom, #A52A2A, #8B0000)',
    color: '#F5E6D3',
    border: '3px solid #654321',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.4)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  buttonDisabled: {
    backgroundColor: '#654321',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  error: {
    backgroundColor: '#FDD',
    color: '#8B0000',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    fontSize: '16px',
    boxShadow: '0 2px 4px rgba(139, 0, 0, 0.2)',
    border: '2px solid #8B0000',
  },
  switch: {
    marginTop: '35px',
    textAlign: 'center',
    color: '#8B4513',
    fontSize: '16px',
    paddingTop: '25px',
    borderTop: '3px solid #8B4513',
  },
  link: {
    color: '#8B0000',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '5px',
    transition: 'color 0.3s',
  },
};

export default Register;
