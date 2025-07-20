
import { useState } from 'react';
import { Download, Image, FileText, Share2, Link, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreditActionButton from './CreditActionButton';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DownloadSectionProps {
  cardId: string;
  cardData?: any;
}

const DownloadSection = ({ cardId, cardData }: DownloadSectionProps) => {
  const { CREDIT_COSTS } = useCredits();
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);

  const handleDownloadImage = async () => {
    await downloadAsImage(cardId, 'wedding-card', 'high');
  };

  const handleDownloadPDF = async () => {
    await downloadAsPDF(cardId, 'wedding-card');
  };

  const handleShareableLink = async () => {
    if (!user) {
      toast.error('Please sign in to create shareable links');
      return;
    }

    if (!cardData) {
      toast.error('Card data not available');
      return;
    }

    setShareLoading(true);
    
    try {
      // Save card data to database for sharing
      const shareableCardData = {
        bride_name: cardData.brideName || 'Bride',
        groom_name: cardData.groomName || 'Groom',
        wedding_date: cardData.weddingDate || '',
        venue: cardData.venue || '',
        message: cardData.message || '',
        template_id: cardData.templateId,
        uploaded_images: JSON.stringify(cardData.uploadedImages || []),
        logo_image: cardData.logoImage || null,
        customization: JSON.stringify(cardData.customization || {}),
        element_positions: JSON.stringify(null),
        user_id: user.id,
        is_public: true
      };

      const { data, error } = await supabase
        .from('shared_wedding_cards')
        .insert(shareableCardData)
        .select()
        .single();

      if (error) throw error;
      
      const url = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(url);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setShowShareMessage(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareMessage(false);
        }, 5000);
        toast.success('Shareable link copied to clipboard!');
      } else {
        toast.success('Shareable link generated!');
      }
      
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate shareable link');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download & Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_HIGH_RES}
            actionType="download_image"
            actionName="Download Image"
            onAction={handleDownloadImage}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Image className="mr-2 h-4 w-4" />
            Download Image
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_HIGH_RES}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_PDF}
            actionType="download_pdf"
            actionName="Download PDF"
            onAction={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_PDF}
            </Badge>
          </CreditActionButton>

          <Button
            onClick={handleShareableLink}
            disabled={shareLoading}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {shareLoading ? 'Creating...' : 'Share Card'}
            <Badge variant="secondary" className="ml-auto">
              Free
            </Badge>
          </Button>
        </div>
        
        {/* Share Message */}
        {showShareMessage && shareUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Link copied to clipboard!</span>
            </div>
            <p className="text-sm text-green-700 mb-2">
              See how your card looks to others
            </p>
            <Button
              onClick={() => window.open(shareUrl, '_blank')}
              variant="outline"
              size="sm"
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <Link className="mr-2 h-4 w-4" />
              Visit Shared Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DownloadSection;
