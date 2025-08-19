
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
        uploaded_images: cardData.uploadedImages || [],
        logo_image: cardData.logoImage || null,
        customization: cardData.customization || {},
        element_positions: null,
        user_id: user.id,
        is_public: true
      };

      const { data, error } = await supabase
        .from('shared_wedding_cards')
        .insert(shareableCardData)
        .select()
        .single();

      if (error) throw error;
      
      // Generate a short shareable link using custom domain
      const shortId = data.id.substring(0, 8); // Use first 8 characters of UUID
      const isLocalhost = window.location.hostname === 'localhost';
      const domain = isLocalhost ? window.location.origin : 'https://shaadileaf.com';
      const url = `${domain}/shared/${shortId}`;
      
      console.log('Generated share URL:', url);
      console.log('Card ID:', data.id);
      console.log('Short ID:', shortId);
      setShareUrl(url);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setShowShareMessage(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Options Grid */}
        <div className="grid gap-3">
          {/* Download Image */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2.5 bg-blue-100 rounded-lg shrink-0">
                  <Image className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-blue-900">High-Res Image</h4>
                  <p className="text-xs text-blue-700/80">PNG • Perfect for printing</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  {CREDIT_COSTS.DOWNLOAD_HIGH_RES} credits
                </Badge>
                <CreditActionButton
                  creditCost={CREDIT_COSTS.DOWNLOAD_HIGH_RES}
                  actionType="download_image"
                  actionName="Download Image"
                  onAction={handleDownloadImage}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Download
                </CreditActionButton>
              </div>
            </div>
          </div>

          {/* Download PDF */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-red-50/50 to-red-100/30 hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2.5 bg-red-100 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-red-900">PDF Document</h4>
                  <p className="text-xs text-red-700/80">PDF • Ready to print</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
                  {CREDIT_COSTS.DOWNLOAD_PDF} credits
                </Badge>
                <CreditActionButton
                  creditCost={CREDIT_COSTS.DOWNLOAD_PDF}
                  actionType="download_pdf"
                  actionName="Download PDF"
                  onAction={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                >
                  Download
                </CreditActionButton>
              </div>
            </div>
          </div>

          {/* Create Magic Link */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/30 hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2.5 bg-purple-100 rounded-lg shrink-0">
                  <Share2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-purple-900">Magic Link</h4>
                  <p className="text-xs text-purple-700/80">Share instantly with anyone</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  {CREDIT_COSTS.SHARE_MAGIC_LINK} credits
                </Badge>
                <CreditActionButton
                  creditCost={CREDIT_COSTS.SHARE_MAGIC_LINK}
                  actionType="share_magic_link"
                  actionName="Create Magic Link"
                  onAction={handleShareableLink}
                  variant="outline"
                  size="sm"
                  disabled={shareLoading}
                  className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {shareLoading ? 'Creating...' : 'Create'}
                </CreditActionButton>
              </div>
            </div>
          </div>
        </div>
        
        {/* Share Message */}
        {showShareMessage && shareUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Link copied to clipboard!</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              See how your card looks to others
            </p>
            <Button
              onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
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
