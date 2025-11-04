import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Inventory from '../components/Inventory';
// Import des icônes
import experienceIcon from '../assets/icons/experience.png';
import parcheminIcon from '../assets/icons/parchemin.png';
import coffreIcon from '../assets/icons/coffre.png';
import cibleIcon from '../assets/icons/cible.png';
import saintGraalIcon from '../assets/icons/saint-graal.png';
import chevalierIcon from '../assets/icons/chevalier.png';
import carteIcon from '../assets/icons/carte.png';

const Profile = () => {
  const { token, authFetch, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadProfile();

    // Écouter les événements de rafraîchissement du profil
    const handleRefreshProfile = () => {
      loadProfile();
    };

    window.addEventListener('refreshProfile', handleRefreshProfile);

    // Nettoyer l'écouteur quand le composant est démonté
    return () => {
      window.removeEventListener('refreshProfile', handleRefreshProfile);
    };
  }, [token]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authFetch('/api/player/profile');
      if (data.success) {
        setProfile(data.data);
      } else {
        setError('Erreur lors du chargement du profil');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du profil');
      if (err.message.includes('Session expirée')) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement du profil...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={loadProfile} style={styles.button}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const { stats, inventaire, quetes } = profile;

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.title}>
          <img src={chevalierIcon} alt="Profil" style={styles.profileIcon} />
          Profil du Joueur
        </h1>
        <div style={styles.playerInfo}>
          <div style={styles.playerName}>{stats.nom}</div>
          <div style={styles.playerLevel}>Niveau {stats.niveau}</div>
        </div>
      </div>

      {/* Stats et Progression en ligne */}
      <div style={styles.statsRow}>
        <div style={styles.statCardLarge}>
          <img src={experienceIcon} alt="Expérience" style={styles.statIconImg} />
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Expérience</div>
            <div style={styles.statValueLarge}>{stats.experience.toLocaleString()}</div>
            <div style={styles.statSubtext}>
              {stats.expNeeded} XP jusqu'au niveau {stats.niveau + 1}
            </div>
          </div>
        </div>

        <div style={styles.statCardLarge}>
          <img src={parcheminIcon} alt="Progression" style={styles.statIconImg} />
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Progression</div>
            <div style={styles.statValueLarge}>{stats.progressPercentage}%</div>
            <div style={styles.statSubtext}>Vers le niveau suivant</div>
          </div>
        </div>

        <div style={styles.statCardLarge}>
          <img src={cibleIcon} alt="Quêtes en cours" style={styles.statIconImg} />
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Quêtes en cours</div>
            <div style={styles.statValueLarge}>{quetes.enCours.length}</div>
            <div style={styles.statSubtext}>Active</div>
          </div>
        </div>

        <div style={styles.statCardLarge}>
          <img src={saintGraalIcon} alt="Quêtes complétées" style={styles.statIconImg} />
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Quêtes complétées</div>
            <div style={styles.statValueLarge}>{quetes.completes.length}</div>
            <div style={styles.statSubtext}>Terminées</div>
          </div>
        </div>
      </div>

      {/* Barre de progression améliorée */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Progression vers le niveau {stats.niveau + 1}</h2>
        <div style={styles.progressContainerLarge}>
          <div style={styles.progressBarLarge}>
            <div
              style={{
                ...styles.progressFillLarge,
                width: `${stats.progressPercentage}%`,
              }}
            />
            <div style={styles.progressTextOverlay}>
              {stats.experience} / {stats.expForNextLevel} XP
            </div>
          </div>
        </div>
      </div>

      {/* Layout en 2 colonnes : Inventaire et Quêtes */}
      <div style={styles.twoColumnLayout}>
        {/* Colonne gauche : Inventaire */}
        <div style={styles.leftColumn}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <img src={coffreIcon} alt="Inventaire" style={styles.titleIcon} />
              Inventaire
            </h2>
            <Inventory />
          </div>
        </div>

        {/* Colonne droite : Quêtes */}
        <div style={styles.rightColumn}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <img src={carteIcon} alt="Quêtes" style={styles.titleIcon} />
              Quêtes
            </h2>
            <div style={styles.questsContainer}>
              <div style={styles.questsSection}>
                <h3 style={styles.questsSubtitle}>
                  <img src={cibleIcon} alt="En cours" style={styles.questIcon} />
                  En cours ({quetes.enCours.length})
                </h3>
                {quetes.enCours.length === 0 ? (
                  <div style={styles.empty}>Aucune quête en cours</div>
                ) : (
                  <div style={styles.questsList}>
                    {quetes.enCours.map((quest, index) => (
                      <div key={index} style={styles.questCard}>
                        <div style={styles.questTitle}>{quest.titre}</div>
                        <div style={styles.questDescription}>
                          {quest.description}
                        </div>
                        <div style={styles.questReward}>
                          <img src={experienceIcon} alt="Expérience" style={styles.rewardIcon} />
                          {quest.recompenses?.experience || 0} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.questsSection}>
                <h3 style={styles.questsSubtitle}>
                  <img src={saintGraalIcon} alt="Complétées" style={styles.questIcon} />
                  Complétées ({quetes.completes.length})
                </h3>
                {quetes.completes.length === 0 ? (
                  <div style={styles.empty}>Aucune quête complétée</div>
                ) : (
                  <div style={styles.questsList}>
                    {quetes.completes.map((complete, index) => (
                      <div key={index} style={styles.questCard}>
                        <div style={styles.questTitle}>
                          {complete.quest?.titre || 'Quête complétée'}
                        </div>
                        <div style={styles.questDate}>
                          📅 {new Date(complete.dateCompletion).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto',
    padding: '40px',
    backgroundColor: '#F5E6D3',
    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.08) 0%, transparent 50%)',
    minHeight: 'calc(100vh - 120px)',
    boxSizing: 'border-box',
  },
  headerSection: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '30px 40px',
    marginBottom: '30px',
    boxShadow: '0 6px 12px rgba(107, 68, 35, 0.3), inset 0 0 0 2px #8B4513',
    border: '3px solid #8B4513',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    margin: 0,
    color: '#654321',
    fontSize: '36px',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(139, 69, 19, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  profileIcon: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  playerInfo: {
    textAlign: 'right',
  },
  playerName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#654321',
    marginBottom: '5px',
  },
  playerLevel: {
    fontSize: '18px',
    color: '#8B0000',
    fontWeight: '600',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  statCardLarge: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.3), inset 0 0 0 2px #8B4513',
    border: '2px solid #8B4513',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIcon: {
    fontSize: '48px',
    lineHeight: '1',
  },
  statIconImg: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  titleIcon: {
    width: '32px',
    height: '32px',
    marginRight: '12px',
    verticalAlign: 'middle',
    objectFit: 'contain',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#8B4513',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  statValueLarge: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#654321',
    marginBottom: '4px',
  },
  statSubtext: {
    fontSize: '12px',
    color: '#8B4513',
  },
  section: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '35px',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.3), inset 0 0 0 2px #8B4513',
    border: '2px solid #8B4513',
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '25px',
    color: '#654321',
    fontSize: '24px',
    fontWeight: '700',
    textShadow: '1px 1px 2px rgba(139, 69, 19, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressContainerLarge: {
    marginTop: '15px',
  },
  progressBarLarge: {
    width: '100%',
    height: '32px',
    backgroundColor: '#DEB887',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 2px 4px rgba(107, 68, 35, 0.3)',
    border: '2px solid #8B4513',
  },
  progressFillLarge: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B0000 0%, #A52A2A 100%)',
    transition: 'width 0.5s ease',
    borderRadius: '14px',
  },
  progressTextOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '14px',
    fontWeight: '700',
    color: '#F5E6D3',
    zIndex: 1,
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  questsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  questsSection: {
    flex: 1,
  },
  questsSubtitle: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#654321',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  questIcon: {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
  },
  questsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  questCard: {
    padding: '20px',
    backgroundColor: '#F5E6D3',
    borderRadius: '12px',
    border: '2px solid #8B4513',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.2)',
  },
  questTitle: {
    fontWeight: '600',
    marginBottom: '10px',
    fontSize: '16px',
    color: '#654321',
  },
  questDescription: {
    fontSize: '14px',
    color: '#8B4513',
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  questReward: {
    fontSize: '13px',
    color: '#8B0000',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  rewardIcon: {
    width: '16px',
    height: '16px',
    objectFit: 'contain',
  },
  questDate: {
    fontSize: '13px',
    color: '#8B4513',
  },
  empty: {
    textAlign: 'center',
    color: '#8B4513',
    padding: '40px 20px',
    fontSize: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '20px',
    color: '#8B4513',
  },
  error: {
    backgroundColor: '#FDD',
    color: '#8B0000',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '16px',
    border: '2px solid #8B0000',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#8B0000',
    backgroundImage: 'linear-gradient(to bottom, #A52A2A, #8B0000)',
    color: '#F5E6D3',
    border: '2px solid #654321',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.3)',
  },
};

export default Profile;
