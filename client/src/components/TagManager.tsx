import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/types";
import { createTag, deleteTag, updateTag } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Edit2, Check, X as Cancel } from "lucide-react";

interface Props {
  tags: Tag[];
  onTagsChange: () => void;
}

export function TagManager({ tags, onTagsChange }: Props) {
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{ id: number; name: string } | null>(
    null
  );
  const { toast } = useToast();

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await createTag(newTagName.trim());
      setNewTagName("");
      onTagsChange();
      toast({
        title: "Éxito",
        description: "Etiqueta creada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (id: number) => {
    try {
      await deleteTag(id);
      onTagsChange();
      toast({
        title: "Éxito",
        description: "Etiqueta eliminada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la etiqueta",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    try {
      await updateTag(editingTag.id, editingTag.name);
      setEditingTag(null);
      onTagsChange();
      toast({
        title: "Éxito",
        description: "Etiqueta actualizada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la etiqueta",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Etiquetas</CardTitle>
        <CardDescription>
          Crea y gestiona etiquetas para clasificar stakeholders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nueva etiqueta..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTag();
                }
              }}
            />
            <Button onClick={handleCreateTag}>Crear Etiqueta</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) =>
              editingTag?.id === tag.id ? (
                <div key={tag.id} className="flex items-center gap-2">
                  <Input
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, name: e.target.value })
                    }
                    className="w-[150px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTag();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleUpdateTag}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingTag(null)}
                  >
                    <Cancel className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-2"
                >
                  {tag.name}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Badge>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}