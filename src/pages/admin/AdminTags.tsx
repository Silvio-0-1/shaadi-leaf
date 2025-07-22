import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, FolderPlus, Tags } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TagGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  group_id: string;
  created_at: string;
  updated_at: string;
}

export const AdminTags = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#8b5cf6'
  });
  
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#8b5cf6',
    group_id: ''
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tag groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('tag_groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('template_tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;

      setTagGroups(groupsData || []);
      setTags(tagsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tags and groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tag_groups')
        .insert({
          name: groupForm.name.trim(),
          description: groupForm.description.trim(),
          color: groupForm.color
        })
        .select()
        .single();

      if (error) throw error;

      setTagGroups(prev => [...prev, data]);
      setGroupForm({ name: '', description: '', color: '#8b5cf6' });
      setIsCreateGroupOpen(false);
      toast.success('Group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleCreateTag = async () => {
    if (!tagForm.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('template_tags')
        .insert({
          name: tagForm.name.trim(),
          description: tagForm.description.trim(),
          color: tagForm.color,
          group_id: tagForm.group_id || null
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      setTagForm({ name: '', description: '', color: '#8b5cf6', group_id: '' });
      setIsCreateTagOpen(false);
      toast.success('Tag created successfully');
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !groupForm.name.trim()) return;

    try {
      const { error } = await supabase
        .from('tag_groups')
        .update({
          name: groupForm.name.trim(),
          description: groupForm.description.trim(),
          color: groupForm.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGroup.id);

      if (error) throw error;

      setTagGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...groupForm, updated_at: new Date().toISOString() }
          : group
      ));
      setEditingGroup(null);
      setGroupForm({ name: '', description: '', color: '#8b5cf6' });
      toast.success('Group updated successfully');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !tagForm.name.trim()) return;

    try {
      const { error } = await supabase
        .from('template_tags')
        .update({
          name: tagForm.name.trim(),
          description: tagForm.description.trim(),
          color: tagForm.color,
          group_id: tagForm.group_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTag.id);

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, ...tagForm, updated_at: new Date().toISOString() }
          : tag
      ));
      setEditingTag(null);
      setTagForm({ name: '', description: '', color: '#8b5cf6', group_id: '' });
      toast.success('Tag updated successfully');
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? Tags in this group will become ungrouped.')) return;

    try {
      const { error } = await supabase
        .from('tag_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setTagGroups(prev => prev.filter(group => group.id !== groupId));
      setTags(prev => prev.map(tag => 
        tag.group_id === groupId ? { ...tag, group_id: '' } : tag
      ));
      toast.success('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('template_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      toast.success('Tag deleted successfully');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const openEditGroup = (group: TagGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      color: group.color
    });
  };

  const openEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      description: tag.description || '',
      color: tag.color,
      group_id: tag.group_id || ''
    });
  };

  const getTagsByGroup = (groupId: string) => {
    return tags.filter(tag => tag.group_id === groupId);
  };

  const getUngroupedTags = () => {
    return tags.filter(tag => !tag.group_id);
  };

  if (roleLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tags Management</h1>
            <p className="text-muted-foreground">Organize template tags into groups for better categorization</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Style, Occasion, Theme"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this group..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupColor">Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="groupColor"
                        type="color"
                        value={groupForm.color}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={groupForm.color}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateGroup} className="w-full">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagName">Tag Name</Label>
                    <Input
                      id="tagName"
                      value={tagForm.name}
                      onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., floral, minimal, royal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagGroup">Group</Label>
                    <Select 
                      value={tagForm.group_id} 
                      onValueChange={(value) => setTagForm(prev => ({ ...prev, group_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Group</SelectItem>
                        {tagGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: group.color }}
                              />
                              <span>{group.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagDescription">Description</Label>
                    <Textarea
                      id="tagDescription"
                      value={tagForm.description}
                      onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this tag..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagColor">Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tagColor"
                        type="color"
                        value={tagForm.color}
                        onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={tagForm.color}
                        onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateTag} className="w-full">
                    Create Tag
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Groups and Tags Display */}
        <div className="space-y-6">
          {tagGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditGroup(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getTagsByGroup(group.id).map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-1">
                      <Badge 
                        variant="secondary"
                        className="flex items-center space-x-2"
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => openEditTag(tag)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {getTagsByGroup(group.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags in this group</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Ungrouped Tags */}
          {getUngroupedTags().length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Tags className="h-5 w-5" />
                  <span>Ungrouped Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getUngroupedTags().map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-1">
                      <Badge 
                        variant="secondary"
                        className="flex items-center space-x-2"
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => openEditTag(tag)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Group Dialog */}
        <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editGroupName">Group Name</Label>
                <Input
                  id="editGroupName"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Style, Occasion, Theme"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGroupDescription">Description</Label>
                <Textarea
                  id="editGroupDescription"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this group..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGroupColor">Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="editGroupColor"
                    type="color"
                    value={groupForm.color}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={groupForm.color}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateGroup} className="w-full">
                Update Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTagName">Tag Name</Label>
                <Input
                  id="editTagName"
                  value={tagForm.name}
                  onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., floral, minimal, royal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTagGroup">Group</Label>
                <Select 
                  value={tagForm.group_id} 
                  onValueChange={(value) => setTagForm(prev => ({ ...prev, group_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Group</SelectItem>
                    {tagGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          />
                          <span>{group.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTagDescription">Description</Label>
                <Textarea
                  id="editTagDescription"
                  value={tagForm.description}
                  onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this tag..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTagColor">Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="editTagColor"
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateTag} className="w-full">
                Update Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};