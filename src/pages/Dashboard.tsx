
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WeddingCardData } from '@/types';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<WeddingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCards();
  }, [user, navigate]);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load your wedding cards');
        console.error('Error fetching cards:', error);
      } else {
        setCards(data || []);
      }
    } catch (error) {
      toast.error('An error occurred while loading your cards');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('wedding_cards')
        .delete()
        .eq('id', cardId);

      if (error) {
        toast.error('Failed to delete the wedding card');
      } else {
        toast.success('Wedding card deleted successfully');
        setCards(cards.filter(card => card.id !== cardId));
      }
    } catch (error) {
      toast.error('An error occurred while deleting the card');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading your wedding cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-3" fill="currentColor" />
              <h1 className="font-serif text-2xl font-semibold">My Wedding Cards</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Card
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Wedding Cards Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first beautiful wedding card to get started
            </p>
            <Button
              onClick={() => navigate('/')}
              className="wedding-gradient text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Card
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">
                    {card.bride_name} & {card.groom_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {card.wedding_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(card.wedding_date)}
                    </div>
                  )}
                  {card.venue && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {card.venue}
                    </div>
                  )}
                  {card.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{card.message}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/?edit=${card.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCard(card.id!)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
