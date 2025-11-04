import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Import des icônes
import questIcon from '../assets/icons/quête.png';
import cibleIcon from '../assets/icons/cible.png';
import saintGraalIcon from '../assets/icons/saint-graal.png';
import experienceIcon from '../assets/icons/experience.png';
import sacADosIcon from '../assets/icons/sac-a-dos.png';

const QuestJournal = () => {
  const { authFetch, isAuthenticated, loadPlayerProfile } = useAuth();
  const [availableQuests, setAvailableQuests] = useState([]);
  const [inProgressQuests, setInProgressQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' ou 'inProgress'

  // Charger les quêtes disponibles depuis l'API
  const loadQuests = async () => {
    setError('');
    try {
      const { data } = await authFetch('/api/quests?statut=disponible');
      if (data.success) {
        setAvailableQuests(data.data || []);
      } else {
        setError('Erreur lors du chargement des quêtes disponibles');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des quêtes disponibles');
    }
  };

  // Charger les quêtes en cours du joueur depuis le profil
  const loadPlayerQuests = async () => {
    try {
      const { data } = await authFetch('/api/player/profile');
      if (data.success && data.data.quetes) {
        setInProgressQuests(data.data.quetes.enCours || []);
      }
    } catch (err) {
      console.error('Error loading player quests:', err);
    }
  };

  // Accepter une quête
  const acceptQuest = async (questId) => {
    setMessage('');
    setError('');
    try {
      const { data } = await authFetch(`/api/player/accept-quest/${questId}`, {
        method: 'POST',
      });

      if (data.success) {
        setMessage(`Quête "${data.data.quest.titre}" acceptée avec succès!`);
        
        // Mettre à jour l'état global du joueur dans AuthContext
        await loadPlayerProfile();
        
        // Recharger les listes après acceptation
        loadQuests();
        loadPlayerQuests();
        // Passer à l'onglet "En cours" pour voir la nouvelle quête
        setActiveTab('inProgress');
        // Déclencher un événement pour recharger le profil si on est sur la page Profile
        window.dispatchEvent(new CustomEvent('refreshProfile'));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'acceptation de la quête');
    }
  };

  // Compléter une quête
  const completeQuest = async (questId, questTitle) => {
    setMessage('');
    setError('');
    
    // Confirmation avant complétion
    if (!window.confirm(`Êtes-vous sûr de vouloir compléter la quête "${questTitle}" ?`)) {
      return;
    }

    try {
      const { data } = await authFetch(`/api/player/complete-quest/${questId}`, {
        method: 'POST',
      });

      if (data.success) {
        const rewards = data.data.rewards;
        let messageParts = [`Quête "${questTitle}" complétée avec succès !`];
        
        if (rewards.experience > 0) {
          messageParts.push(`Expérience reçue: ${rewards.experience} XP`);
          if (rewards.levelUp) {
            messageParts.push(`🎉 Level Up ! Vous êtes maintenant niveau ${data.data.player.niveau}`);
          }
        }
        
        if (rewards.items && rewards.items.length > 0) {
          messageParts.push(`Objets reçus:`);
          rewards.items.forEach(item => {
            messageParts.push(`   - ${item.item?.nom || 'Objet'} x${item.quantite}`);
          });
        }
        
        setMessage(messageParts.join('\n'));
        
        // Mettre à jour l'état global du joueur dans AuthContext
        await loadPlayerProfile();
        
        // Recharger les listes après complétion
        loadQuests();
        loadPlayerQuests();
        // Déclencher un événement pour recharger le profil si on est sur la page Profile
        window.dispatchEvent(new CustomEvent('refreshProfile'));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la complétion de la quête');
    }
  };

  // Recharger toutes les quêtes
  const refreshQuests = async () => {
    setLoading(true);
    await Promise.all([loadQuests(), loadPlayerQuests()]);
    setLoading(false);
  };

  // Déterminer le style de badge selon le statut
  const getStatusBadgeStyle = (statut) => {
    const styles = {
      disponible: {
        backgroundColor: '#28a745',
        color: 'white',
      },
      'en cours': {
        backgroundColor: '#007bff',
        color: 'white',
      },
      terminée: {
        backgroundColor: '#6c757d',
        color: 'white',
      },
      abandonnée: {
        backgroundColor: '#dc3545',
        color: 'white',
      },
    };
    return styles[statut?.toLowerCase()] || styles.disponible;
  };

  // Formatage du statut pour affichage
  const formatStatus = (statut) => {
    const statusMap = {
      disponible: 'Disponible',
      'en cours': 'En cours',
      terminée: 'Terminée',
      abandonnée: 'Abandonnée',
    };
    return statusMap[statut?.toLowerCase()] || statut;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      setLoading(true);
      Promise.all([loadQuests(), loadPlayerQuests()]).finally(() => {
        setLoading(false);
      });
    }

    // Écouter les événements de rafraîchissement des quêtes
    const handleRefreshQuests = () => {
      if (isAuthenticated()) {
        loadPlayerQuests();
      }
    };

    window.addEventListener('refreshProfile', handleRefreshQuests);

    // Nettoyer l'écouteur quand le composant est démonté
    return () => {
      window.removeEventListener('refreshProfile', handleRefreshQuests);
    };
  }, []);

  if (!isAuthenticated()) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Vous devez être connecté pour voir le journal de quêtes
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.title}>
          <img src={questIcon} alt="Quêtes" style={styles.titleIcon} />
          Journal de Quêtes
        </h1>
        <button onClick={refreshQuests} style={styles.refreshButton}>
          🔄 Actualiser
        </button>
      </div>

      {message && (
        <div style={styles.success} role="alert">
          {message}
        </div>
      )}

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Section avec onglets */}
      <div style={styles.tabsSection}>
        {/* Onglets */}
        <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            ...styles.tab,
            ...(activeTab === 'available' ? styles.activeTab : {}),
          }}
        >
          Quêtes Disponibles ({availableQuests.length})
        </button>
        <button
          onClick={() => setActiveTab('inProgress')}
          style={{
            ...styles.tab,
            ...(activeTab === 'inProgress' ? styles.activeTab : {}),
          }}
        >
          Mes Quêtes ({inProgressQuests.length})
        </button>
      </div>

        {loading ? (
          <div style={styles.loading}>Chargement des quêtes...</div>
        ) : (
          <>
            {/* Quêtes Disponibles */}
            {activeTab === 'available' && (
              <div style={styles.questsSection}>
              {availableQuests.length === 0 ? (
                <div style={styles.empty}>
                  Aucune quête disponible pour le moment
                </div>
              ) : (
                <div style={styles.questsGrid}>
                  {availableQuests.map((quest) => (
                    <div key={quest._id} style={styles.questCard}>
                      <div style={styles.questHeader}>
                        <h2 style={styles.questTitle}>{quest.titre}</h2>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusBadgeStyle(quest.statut),
                          }}
                        >
                          {formatStatus(quest.statut)}
                        </span>
                      </div>

                      <div style={styles.questDescription}>
                        {quest.description}
                      </div>

                      <div style={styles.questRewards}>
                        <h3 style={styles.rewardsTitle}>Récompenses</h3>
                        <div style={styles.rewardItem}>
                          <span style={styles.rewardLabel}>
                            <img src={experienceIcon} alt="Expérience" style={styles.rewardIcon} />
                            Expérience:
                          </span>
                          <span style={styles.rewardValue}>
                            {quest.recompenses?.experience || 0} XP
                          </span>
                        </div>

                        {quest.recompenses?.objets &&
                          quest.recompenses.objets.length > 0 && (
                            <div style={styles.rewardItems}>
                              <span style={styles.rewardLabel}>
                                <img src={sacADosIcon} alt="Objets" style={styles.rewardIcon} />
                                Objets:
                              </span>
                              <div style={styles.itemsList}>
                                {quest.recompenses.objets.map(
                                  (reward, index) => (
                                    <div key={index} style={styles.itemReward}>
                                      {reward.item?.nom || 'Objet'} x
                                      {reward.quantite}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <button
                        onClick={() => acceptQuest(quest._id)}
                        style={styles.acceptButton}
                        disabled={loading}
                      >
                        ✓ Accepter la quête
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quêtes En Cours */}
          {activeTab === 'inProgress' && (
            <div style={styles.questsSection}>
              {inProgressQuests.length === 0 ? (
                <div style={styles.empty}>
                  <img src={cibleIcon} alt="Pas de quêtes en cours" style={styles.emptyIcon} />
                  <div>Vous n'avez aucune quête en cours</div>
                  <span style={styles.emptyHint}>
                    Acceptez une quête depuis l'onglet "Quêtes Disponibles"
                  </span>
                </div>
              ) : (
                <div style={styles.questsGrid}>
                  {inProgressQuests.map((quest) => (
                    <div key={quest._id} style={styles.questCard}>
                      <div style={styles.questHeader}>
                        <h2 style={styles.questTitle}>
                          <img src={cibleIcon} alt="En cours" style={styles.questTitleIcon} />
                          {quest.titre}
                        </h2>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusBadgeStyle(quest.statut),
                          }}
                        >
                          {formatStatus(quest.statut)}
                        </span>
                      </div>

                      <div style={styles.questDescription}>
                        {quest.description}
                      </div>

                      <div style={styles.questRewards}>
                        <h3 style={styles.rewardsTitle}>Récompenses</h3>
                        <div style={styles.rewardItem}>
                          <span style={styles.rewardLabel}>
                            <img src={experienceIcon} alt="Expérience" style={styles.rewardIcon} />
                            Expérience:
                          </span>
                          <span style={styles.rewardValue}>
                            {quest.recompenses?.experience || 0} XP
                          </span>
                        </div>

                        {quest.recompenses?.objets &&
                          quest.recompenses.objets.length > 0 && (
                            <div style={styles.rewardItems}>
                              <span style={styles.rewardLabel}>
                                <img src={sacADosIcon} alt="Objets" style={styles.rewardIcon} />
                                Objets:
                              </span>
                              <div style={styles.itemsList}>
                                {quest.recompenses.objets.map(
                                  (reward, index) => (
                                    <div key={index} style={styles.itemReward}>
                                      {reward.item?.nom || 'Objet'} x
                                      {reward.quantite}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <button
                        onClick={() => completeQuest(quest._id, quest.titre)}
                        style={styles.completeButton}
                        disabled={loading}
                      >
                        ✓ Compléter la quête
                      </button>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}
          </>
        )}
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
    gap: '15px',
  },
  titleIcon: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  questTitleIcon: {
    width: '24px',
    height: '24px',
    marginRight: '10px',
    verticalAlign: 'middle',
    objectFit: 'contain',
  },
  questTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#654321',
    flex: 1,
    fontWeight: '700',
    textShadow: '1px 1px 2px rgba(139, 69, 19, 0.2)',
    display: 'flex',
    alignItems: 'center',
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: '#8B0000',
    backgroundImage: 'linear-gradient(to bottom, #A52A2A, #8B0000)',
    color: '#F5E6D3',
    border: '2px solid #654321',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.3)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  tabsSection: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '35px',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.3), inset 0 0 0 2px #8B4513',
    border: '2px solid #8B4513',
    width: '100%',
    boxSizing: 'border-box',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    marginBottom: '30px',
    backgroundColor: '#DEB887',
    borderRadius: '8px',
    padding: '5px',
    border: '2px solid #8B4513',
  },
  tab: {
    padding: '14px 32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#654321',
    transition: 'all 0.3s',
    flex: 1,
  },
  activeTab: {
    color: '#F5E6D3',
    backgroundColor: '#8B0000',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.4)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  questsSection: {
    marginTop: '0',
    minHeight: '500px', // Hauteur minimale uniforme pour les deux onglets
    display: 'flex',
    flexDirection: 'column',
  },
  questsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '25px',
    flex: 1,
    alignContent: 'start',
  },
  questCard: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.3)',
    border: '2px solid #8B4513',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '10px',
  },
  statusBadge: {
    padding: '8px 14px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  questDescription: {
    color: '#8B4513',
    lineHeight: '1.7',
    flex: 1,
    minHeight: '60px',
    fontSize: '15px',
  },
  questRewards: {
    padding: '20px',
    backgroundColor: '#F5E6D3',
    borderRadius: '8px',
    border: '2px solid #8B4513',
    boxShadow: 'inset 0 2px 4px rgba(107, 68, 35, 0.2)',
  },
  rewardsTitle: {
    marginTop: 0,
    marginBottom: '12px',
    fontSize: '16px',
    color: '#654321',
    fontWeight: '700',
  },
  rewardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  rewardLabel: {
    color: '#8B4513',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  rewardValue: {
    fontWeight: 'bold',
    color: '#8B0000',
    fontSize: '16px',
  },
  rewardItems: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '2px solid #8B4513',
  },
  itemsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  itemReward: {
    padding: '6px 12px',
    backgroundColor: '#F5E6D3',
    color: '#8B0000',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #8B4513',
  },
  acceptButton: {
    padding: '14px 24px',
    backgroundColor: '#654321',
    backgroundImage: 'linear-gradient(to bottom, #8B4513, #654321)',
    color: '#F5E6D3',
    border: '2px solid #8B0000',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: 'auto',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.4)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  inProgressBadge: {
    padding: '10px',
    backgroundColor: '#F5E6D3',
    color: '#8B0000',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 'auto',
    border: '2px solid #8B4513',
  },
  completeButton: {
    padding: '14px 24px',
    backgroundColor: '#8B0000',
    backgroundImage: 'linear-gradient(to bottom, #A52A2A, #8B0000)',
    color: '#F5E6D3',
    border: '2px solid #654321',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: 'auto',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.4)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '20px',
    color: '#8B4513',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#8B4513',
    fontSize: '18px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    marginBottom: '10px',
  },
  emptyHint: {
    fontSize: '14px',
    color: '#8B4513',
    marginTop: '10px',
    display: 'block',
  },
  success: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    fontSize: '16px',
    whiteSpace: 'pre-line',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.2)',
    border: '2px solid #4CAF50',
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
  rewardIcon: {
    width: '18px',
    height: '18px',
    objectFit: 'contain',
  },
};

export default QuestJournal;

