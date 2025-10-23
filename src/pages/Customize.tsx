import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, Save } from "lucide-react";
import Header from "@/components/Header";
import PremiumCustomizationForm from "@/components/PremiumCustomizationForm";
import EnhancedCardEditor from "@/components/EnhancedCardEditor";
import DownloadSection from "@/components/DownloadSection";
import { WeddingCardData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useWeddingCards } from "@/hooks/useWeddingCards";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Customize = () => {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  const isMobile = useIsMobile();

  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
    message: "",
    templateId: templateId || "",
    uploadedImage: "",
  });

  // Load card for editing if editId is provided
  useEffect(() => {
    if (editId && user) {
      loadCard(editId).then((card) => {
        if (card) {
          setCardData(card);
        }
      });
    }
  }, [editId, user, loadCard]);

  // Update templateId when route param changes
  useEffect(() => {
    if (templateId) {
      setCardData((prev) => ({ ...prev, templateId }));
    }
  }, [templateId]);

  const handleDataChange = (newData: Partial<WeddingCardData>) => {
    setCardData((prev) => ({ ...prev, ...newData }));
  };

  const handleSaveCard = async () => {
    if (!user) {
      toast.error("Please sign in to save your wedding card");
      return;
    }

    if (!cardData.templateId) {
      toast.error("Please select a template first");
      return;
    }

    // Set default names if empty
    const cardToSave = {
      ...cardData,
      brideName: cardData.brideName || "Bride",
      groomName: cardData.groomName || "Groom",
    };

    await saveCard(cardToSave);
  };

  if (!cardData.templateId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">No Template Selected</h1>
          <p className="text-muted-foreground mb-6">Please select a template first.</p>
          <Button onClick={() => navigate("/templates")}>Choose Template</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {isMobile ? (
        /* Mobile Layout - Preview on top, controls in bottom sheet */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="flex-none px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate("/templates")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {user && (
                <Button
                  onClick={handleSaveCard}
                  disabled={saving}
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editId ? "Update" : "Save"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/20">
            <div className="w-full max-w-md">
              <EnhancedCardEditor cardData={cardData} onDataChange={handleDataChange} />
            </div>
          </div>

          {/* Bottom Controls Sheet */}
          <div className="flex-none border-t bg-card/80 backdrop-blur-sm">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full rounded-none h-14 text-base">
                  Customize Card
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
                <div className="flex-1 overflow-auto p-6">
                  <PremiumCustomizationForm cardData={cardData} onDataChange={handleDataChange} />
                </div>
                <div className="flex-none p-4 border-t bg-background">
                  <DownloadSection cardId="card-preview" cardData={cardData} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ) : (
        /* Desktop Layout - 3 Column Premium Design */
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Left Sidebar - Customization */}
            <aside className="w-[400px] border-r bg-card/30 backdrop-blur-sm overflow-auto">
              <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => navigate("/templates")} className="w-full justify-start">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Templates
                </Button>

                <PremiumCustomizationForm cardData={cardData} onDataChange={handleDataChange} />
              </div>
            </aside>

            {/* Center - Live Preview */}
            <main className="flex-1 overflow-auto bg-muted/10">
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full max-w-[440px]">
                  <EnhancedCardEditor cardData={cardData} onDataChange={handleDataChange} />
                </div>
              </div>
            </main>

            {/* Right Sidebar - Actions */}
            <aside className="w-[400px] border-l bg-card/30 backdrop-blur-sm overflow-auto">
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Actions</h3>

                  {user && (
                    <Button
                      onClick={handleSaveCard}
                      disabled={saving}
                      className="w-full bg-primary text-primary-foreground h-11"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editId ? "Update Card" : "Save Card"}
                        </>
                      )}
                    </Button>
                  )}

                  <DownloadSection cardId="card-preview" cardData={cardData} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customize;
