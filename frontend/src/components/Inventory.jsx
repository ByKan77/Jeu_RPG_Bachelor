import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { authFetch, isAuthenticated, loadPlayerProfile } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      loadInventory();
    }

    // Écouter les événements de rafraîchissement de l'inventaire
    const handleRefreshInventory = () => {
      if (isAuthenticated()) {
        loadInventory();
      }
    };

    window.addEventListener('refreshProfile', handleRefreshInventory);
    window.addEventListener('refreshInventory', handleRefreshInventory);

    // Nettoyer les écouteurs quand le composant est démonté
    return () => {
      window.removeEventListener('refreshProfile', handleRefreshInventory);
      window.removeEventListener('refreshInventory', handleRefreshInventory);
    };
  }, []);

  // Charger l'inventaire depuis le profil
  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authFetch('/api/player/profile');
      if (data.success) {
        setInventory(data.data.inventaire || []);
      } else {
        setError('Erreur lors du chargement de l\'inventaire');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de l\'inventaire');
    } finally {
      setLoading(false);
    }
  };

  // Utiliser un objet
  const useItem = async (itemId, itemName) => {
    setMessage('');
    setError('');
    
    // Confirmation avant utilisation
    if (!window.confirm(`Êtes-vous sûr de vouloir utiliser "${itemName}" ?`)) {
      return;
    }

    try {
      const { data } = await authFetch(`/api/player/use-item/${itemId}`, {
        method: 'POST',
        body: JSON.stringify({ quantite: 1 }),
      });

      if (data.success) {
        setMessage(data.message || `Objet "${itemName}" utilisé avec succès!`);
        
        // Mettre à jour l'état global du joueur dans AuthContext
        await loadPlayerProfile();
        
        // Recharger l'inventaire après utilisation
        loadInventory();
        
        // Déclencher un événement pour recharger le profil si on est sur la page Profile
        window.dispatchEvent(new CustomEvent('refreshProfile'));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'utilisation de l\'objet');
    }
  };

  // Obtenir l'icône selon le type d'objet
  const getItemIcon = (type) => {
    const icons = {
      potion: '🧪',
      arme: '⚔️',
      armure: '🛡️',
      consommable: '🍖',
      autre: '📦',
    };
    return icons[type?.toLowerCase()] || '📦';
  };

  // Obtenir la couleur du badge selon le type
  const getTypeBadgeColor = (type) => {
    const colors = {
      potion: '#9b59b6',
      arme: '#e74c3c',
      armure: '#3498db',
      consommable: '#27ae60',
      autre: '#95a5a6',
    };
    return colors[type?.toLowerCase()] || '#95a5a6';
  };

  if (!isAuthenticated()) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Vous devez être connecté pour voir votre inventaire
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement de l'inventaire...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

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

      {inventory.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <div style={styles.emptyText}>Votre inventaire est vide</div>
          <div style={styles.emptyHint}>
            Complétez des quêtes pour recevoir des objets !
          </div>
        </div>
      ) : (
        <>
          <div style={styles.summary}>
            Total: <strong>{inventory.length}</strong> type(s) d'objet(s) •{' '}
            <strong>
              {inventory.reduce((sum, invItem) => sum + invItem.quantite, 0)}
            </strong>{' '}
            objet(s) au total
          </div>

          <div style={styles.inventoryGrid}>
            {inventory.map((invItem, index) => {
              const item = invItem.item;
              const itemType = item?.type || 'autre';
              
              return (
                <div key={index} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <div style={styles.itemIcon}>
                      {getItemIcon(itemType)}
                    </div>
                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemName}>
                        {item?.nom || 'Objet inconnu'}
                      </h3>
                      <span
                        style={{
                          ...styles.typeBadge,
                          backgroundColor: getTypeBadgeColor(itemType),
                        }}
                      >
                        {itemType}
                      </span>
                    </div>
                  </div>

                  {item?.description && (
                    <div style={styles.itemDescription}>
                      {item.description}
                    </div>
                  )}

                  <div style={styles.itemQuantity}>
                    Quantité: <strong>x{invItem.quantite}</strong>
                  </div>

                  <button
                    onClick={() => useItem(item?._id || invItem.item, item?.nom || 'Objet')}
                    style={styles.useButton}
                    disabled={loading}
                  >
                    ✨ Utiliser
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    padding: '0',
    backgroundColor: 'transparent',
  },
  header: {
    display: 'none', // Masquer le header car il est déjà dans Profile
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '32px',
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  summary: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
  },
  inventoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  itemCard: {
    backgroundColor: '#F4E4C1',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(107, 68, 35, 0.3), inset 0 0 0 2px #8B4513',
    border: '2px solid #8B4513',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  itemIcon: {
    fontSize: '40px',
    lineHeight: '1',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    margin: 0,
    fontSize: '18px',
    color: '#654321',
    marginBottom: '8px',
    fontWeight: '700',
  },
  typeBadge: {
    padding: '4px 10px',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'capitalize',
    display: 'inline-block',
  },
  itemDescription: {
    color: '#8B4513',
    fontSize: '14px',
    lineHeight: '1.5',
    marginTop: '8px',
    padding: '10px',
    backgroundColor: '#F5E6D3',
    borderRadius: '8px',
    border: '1px solid #DEB887',
  },
  itemQuantity: {
    fontSize: '16px',
    color: '#654321',
    fontWeight: '600',
    padding: '10px',
    backgroundColor: '#F5E6D3',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #8B4513',
  },
  useButton: {
    padding: '12px',
    backgroundColor: '#8B0000',
    backgroundImage: 'linear-gradient(to bottom, #A52A2A, #8B0000)',
    color: '#F5E6D3',
    border: '2px solid #654321',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: 'auto',
    transition: 'background-color 0.3s',
    boxShadow: '0 2px 4px rgba(107, 68, 35, 0.3)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#8B4513',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#8B4513',
    fontSize: '18px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyText: {
    fontSize: '20px',
    marginBottom: '10px',
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: '14px',
    color: '#8B4513',
  },
  success: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    whiteSpace: 'pre-line',
    border: '2px solid #4CAF50',
  },
  error: {
    backgroundColor: '#FDD',
    color: '#8B0000',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '2px solid #8B0000',
  },
};

export default Inventory;

