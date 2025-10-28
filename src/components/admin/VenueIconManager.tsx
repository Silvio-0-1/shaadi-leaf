import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';
import { toast } from 'sonner';

export const VenueIconManager = () => {
  const { allVenueIcons, createVenueIcon, updateVenueIcon, deleteVenueIcon, isCreating, isUpdating, isDeleting } = useVenueIcons();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const [categories, setCategories] = useState(['location', 'building', 'nature', 'decorative']);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    svg_path_outline: '',
    svg_path_filled: '',
    category: 'location',
    is_active: true,
  });

  const handleCreate = () => {
    if (!formData.name || !formData.svg_path_outline || !formData.svg_path_filled) {
      toast.error('Name and both SVG paths (outline & filled) are required');
      return;
    }

    // Create both versions
    const outlineIcon = {
      name: formData.name,
      svg_path: formData.svg_path_outline,
      category: formData.category,
      is_filled: false,
      is_active: formData.is_active,
    };
    
    const filledIcon = {
      name: formData.name,
      svg_path: formData.svg_path_filled,
      category: formData.category,
      is_filled: true,
      is_active: formData.is_active,
    };

    createVenueIcon(outlineIcon);
    createVenueIcon(filledIcon);
    
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    updateVenueIcon({ 
      id, 
      updates: {
        name: formData.name,
        category: formData.category,
        is_active: formData.is_active,
      }
    });
    setEditingIcon(null);
    resetForm();
  };

  const handleEdit = (icon: typeof allVenueIcons[0]) => {
    setFormData({
      name: icon.name,
      svg_path_outline: '',
      svg_path_filled: '',
      category: icon.category,
      is_active: icon.is_active,
    });
    setEditingIcon(icon.id);
  };

  const handleSvgUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFilled: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      const pathElements = svgDoc.querySelectorAll('path');
      
      if (pathElements.length === 0) {
        toast.error('No path found in SVG file');
        return;
      }

      // Combine all paths if there are multiple
      const paths = Array.from(pathElements).map(p => p.getAttribute('d')).filter(Boolean);
      const combinedPath = paths.join(' ');

      if (isFilled) {
        setFormData({ ...formData, svg_path_filled: combinedPath });
      } else {
        setFormData({ ...formData, svg_path_outline: combinedPath });
      }
      
      toast.success('SVG uploaded successfully');
    } catch (error) {
      console.error('Error parsing SVG:', error);
      toast.error('Failed to parse SVG file');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      svg_path_outline: '',
      svg_path_filled: '',
      category: 'location',
      is_active: true,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (categories.includes(newCategory.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    setCategories([...categories, newCategory.toLowerCase()]);
    setNewCategory('');
    toast.success('Category added');
  };

  const handleDeleteCategory = (cat: string) => {
    if (allVenueIcons.some(icon => icon.category === cat)) {
      toast.error('Cannot delete category with existing icons');
      return;
    }
    setCategories(categories.filter(c => c !== cat));
    toast.success('Category deleted');
  };

  const handleEditCategory = (oldCat: string) => {
    setEditingCategory(oldCat);
    setEditCategoryValue(oldCat);
  };

  const handleSaveCategoryEdit = () => {
    if (!editCategoryValue.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (categories.includes(editCategoryValue.toLowerCase()) && editCategoryValue.toLowerCase() !== editingCategory) {
      toast.error('Category already exists');
      return;
    }
    setCategories(categories.map(c => c === editingCategory ? editCategoryValue.toLowerCase() : c));
    setEditingCategory(null);
    setEditCategoryValue('');
    toast.success('Category updated');
  };

  const renderIcon = (svgPath: string, isFilled: boolean) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-10 h-10 text-primary"
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
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
            <div className="space-y-6">
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
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="is_active">Visible to Users</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/20">
                  <Label htmlFor="svg_file_outline" className="text-base font-semibold">Outline Version *</Label>
                  <p className="text-xs text-muted-foreground mb-3">Upload SVG file for outline style</p>
                  <Input
                    id="svg_file_outline"
                    type="file"
                    accept=".svg"
                    onChange={(e) => handleSvgUpload(e, false)}
                    className="cursor-pointer"
                  />
                  {formData.svg_path_outline && (
                    <div className="mt-3 flex justify-center p-3 bg-background rounded border">
                      {renderIcon(formData.svg_path_outline, false)}
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <Label htmlFor="svg_file_filled" className="text-base font-semibold">Filled Version *</Label>
                  <p className="text-xs text-muted-foreground mb-3">Upload SVG file for filled style</p>
                  <Input
                    id="svg_file_filled"
                    type="file"
                    accept=".svg"
                    onChange={(e) => handleSvgUpload(e, true)}
                    className="cursor-pointer"
                  />
                  {formData.svg_path_filled && (
                    <div className="mt-3 flex justify-center p-3 bg-background rounded border">
                      {renderIcon(formData.svg_path_filled, true)}
                    </div>
                  )}
                </div>
              </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allVenueIcons.map((icon) => (
          <Card key={icon.id} className={!icon.is_active ? 'opacity-60 border-dashed' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{icon.name}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{icon.category}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Outline</p>
                  {renderIcon(icon.svg_path, false)}
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Filled</p>
                  {renderIcon(icon.svg_path, true)}
                </div>
              </div>
              
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
        <DialogContent className="max-w-md">
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
              <Label htmlFor="edit-category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="edit-is_active">Visible to Users</Label>
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

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

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                  {editingCategory === cat ? (
                    <>
                      <Input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button size="sm" onClick={handleSaveCategoryEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <span className="capitalize font-medium">{cat}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditCategory(cat)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
