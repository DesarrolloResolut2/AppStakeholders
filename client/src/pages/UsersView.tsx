import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener usuarios");
  return response.json();
}

async function createUser(userData: {
  username: string;
  password: string;
  role: "admin" | "user";
}): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear usuario");
  }
  return response.json();
}

export function UsersView() {
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as const,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
      setNewUser({ username: "", password: "", role: "user" });
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Usuarios</CardTitle>
          <div className="flex space-x-4">
            <Link href="/">
              <Button variant="outline">
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Volver
              </Button>
            </Link>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nombre de usuario"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "admin" | "user") =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Crear Usuario
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border"
              >
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Rol: {user.role === "admin" ? "Administrador" : "Usuario"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}