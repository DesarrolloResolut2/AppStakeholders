import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nueva etiqueta..."
              className="flex-1"
            />
            <Button onClick={handleCreateTag}>Crear</Button>
          </div>
          <div className="space-y-2">
            {tags.map((tag) =>
              editingTag?.id === tag.id ? (
                <div key={tag.id} className="flex items-center gap-2">
                  <Input
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, name: e.target.value })
                    }
                    className="flex-1"
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
                <div
                  key={tag.id}
                  className="flex items-center justify-between bg-secondary/20 p-2 rounded"
                >
                  <span>{tag.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
