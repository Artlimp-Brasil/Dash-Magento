import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";

interface FilterSectionProps {
  onFilter: (startDate: string, endDate: string) => void;
  isLoading: boolean;
}

export function FilterSection({ onFilter, isLoading }: FilterSectionProps) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(startDate, endDate);
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Filtros de Período</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-foreground">Data Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-foreground">Data Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}