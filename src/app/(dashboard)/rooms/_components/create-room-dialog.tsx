// src/app/(dashboard)/rooms/_components/create-room-dialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createRoom } from '@/lib/actions/rooms.actions';
import { useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function CreateRoomDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFormAction = async (formData: FormData) => {
    const result = await createRoom(formData);
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast({
        title: 'Erro!',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Nova Sala</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Sala</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova sala de diálise.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleFormAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isolation_type" className="text-right">
              Tipo de Isolamento
            </Label>
            <Select name="isolation_type" defaultValue="none">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="hbsag_positive">Hepatite B (HBsAg+)</SelectItem>
                <SelectItem value="hcv_positive">Hepatite C (HCV+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
