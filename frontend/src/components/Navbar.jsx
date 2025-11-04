import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import epeesCroiseesIcon from '../assets/icons/epees-croisees.png';

const Navbar = () => {
  const { isAuthenticated, logout, player } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/profile" style={styles.logo}>
          <img src={epeesCroiseesIcon} alt="RPG Quest" style={styles.logoIcon} />
          RPG Quest
        </Link>

        <div style={styles.links}>
          <Link
            to="/profile"
            style={{
              ...styles.link,
              ...(location.pathname === '/profile' ? styles.activeLink : {}),
            }}
          >
            Profil
          </Link>
          <Link
            to="/quests"
            style={{
              ...styles.link,
              ...(location.pathname === '/quests' ? styles.activeLink : {}),
            }}
          >
            Quêtes
          </Link>
        </div>

        <div style={styles.userInfo}>
          {player && (
            <span style={styles.userName}>{player.nom}</span>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#6B4423',
    backgroundImage: 'linear-gradient(to bottom, #8B4513, #654321)',
    color: '#F5E6D3',
    padding: '15px 0',
    marginBottom: '20px',
    borderBottom: '3px solid #8B0000',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#F5E6D3',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  links: {
    display: 'flex',
    gap: '30px',
  },
  link: {
    color: '#DEB887',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'color 0.3s',
    fontWeight: '500',
  },
  activeLink: {
    color: '#F5E6D3',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    borderBottom: '2px solid #8B0000',
    paddingBottom: '5px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    color: '#DEB887',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#8B0000',
    color: '#F5E6D3',
    border: '2px solid #A52A2A',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
};

export default Navbar;

