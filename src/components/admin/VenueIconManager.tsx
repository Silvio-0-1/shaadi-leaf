import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const VenueIconManager = () => {
  const { allVenueIcons, createVenueIcon, updateVenueIcon, deleteVenueIcon, isCreating, isUpdating, isDeleting } = useVenueIcons();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    svg_path: '',
    category: 'location',
    is_filled: false,
    is_active: true,
    display_order: 0,
  });

  const handleCreate = () => {
    if (!formData.name || !formData.svg_path) {
      toast.error('Name and SVG path are required');
      return;
    }

    createVenueIcon(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!formData.name || !formData.svg_path) {
      toast.error('Name and SVG path are required');
      return;
    }

    updateVenueIcon({ id, updates: formData });
    setEditingIcon(null);
    resetForm();
  };

  const handleEdit = (icon: typeof allVenueIcons[0]) => {
    setFormData({
      name: icon.name,
      description: icon.description || '',
      svg_path: icon.svg_path,
      category: icon.category,
      is_filled: icon.is_filled,
      is_active: icon.is_active,
      display_order: icon.display_order,
    });
    setEditingIcon(icon.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      svg_path: '',
      category: 'location',
      is_filled: false,
      is_active: true,
      display_order: 0,
    });
  };

  const renderIcon = (svgPath: string, isFilled: boolean) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-8 h-8 text-primary"
        style={{
          fill: isFilled ? 'currentColor' : 'none',
          stroke: isFilled ? 'none' : 'currentColor',
          strokeWidth: isFilled ? 0 : 2,
        }}
      >
        <path d={svgPath} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Venue Icon Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Icon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Venue Icon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Icon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Elegant Map Pin"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the icon"
                />
              </div>

              <div>
                <Label htmlFor="svg_path">SVG Path * (24x24 viewBox)</Label>
                <Textarea
                  id="svg_path"
                  value={formData.svg_path}
                  onChange={(e) => setFormData({ ...formData, svg_path: e.target.value })}
                  placeholder="M12 2C8.13 2 5 5.13 5 9c0 5.25..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy the 'd' attribute from an SVG path element
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="building">Building</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="decorative">Decorative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_filled">Filled Icon Style</Label>
                <Switch
                  id="is_filled"
                  checked={formData.is_filled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_filled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              {formData.svg_path && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="flex justify-center">
                    {renderIcon(formData.svg_path, formData.is_filled)}
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Icon'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allVenueIcons.map((icon) => (
          <Card key={icon.id} className={!icon.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {renderIcon(icon.svg_path, icon.is_filled)}
                  <div>
                    <CardTitle className="text-base">{icon.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{icon.category}</p>
                  </div>
                </div>
                {!icon.is_active && <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {icon.description && (
                <p className="text-sm text-muted-foreground">{icon.description}</p>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(icon)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteVenueIcon(icon.id)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingIcon} onOpenChange={() => setEditingIcon(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Venue Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Icon Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-svg_path">SVG Path *</Label>
              <Textarea
                id="edit-svg_path"
                value={formData.svg_path}
                onChange={(e) => setFormData({ ...formData, svg_path: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="decorative">Decorative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="edit-display_order">Display Order</Label>
                <Input
                  id="edit-display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-is_filled">Filled Icon Style</Label>
              <Switch
                id="edit-is_filled"
                checked={formData.is_filled}
                onCheckedChange={(checked) => setFormData({ ...formData, is_filled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-is_active">Active</Label>
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            {formData.svg_path && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="flex justify-center">
                  {renderIcon(formData.svg_path, formData.is_filled)}
                </div>
              </div>
            )}

            <Button
              onClick={() => editingIcon && handleUpdate(editingIcon)}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Icon'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
